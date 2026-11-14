"""
ML client service that orchestrates ML prediction, validates output, falls back to the
rule-based RecommendationEngine when necessary, and logs every prediction in `prediction_logs`.
"""

import json
import time
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy.orm import Session

from app.config import settings
from app.core.logging import logger
from app.ml.predictor import MLPredictor
from app.ml.version import MODEL_VERSION
from app.models.recommendation import PredictionLog
from app.schemas.recommendation import RankedSizeOption, RecommendationExplanation
from app.services.recommendation_engine import RecommendationEngine


class MLRecommendationClient:
    """Service coordinating ML model inference, rule-based fallback, and audit logging."""

    def __init__(
        self,
        predictor: Optional[MLPredictor] = None,
        rule_engine: Optional[RecommendationEngine] = None,
    ) -> None:
        self.predictor = predictor or MLPredictor()
        self.rule_engine = rule_engine or RecommendationEngine()

    def recommend_with_fallback(
        self,
        db: Session,
        category_code: str,
        body_measurements: Dict[str, Optional[float]],
        garment_rows: List[Dict[str, Any]],
        allowed_sizes: List[str],
        fit_preference: str = "regular",
        product_stretch_pct: float = 0.0,
        verification_status: str = "verified",
        top_n: int = 3,
        use_ml: bool = True,
        user_id: Optional[int] = None,
        product_id: Optional[int] = None,
    ) -> Tuple[List[RankedSizeOption], RecommendationExplanation, Dict[str, Any], PredictionLog]:
        """
        Execute size recommendation using both the rule-based strategy engine (for per-measurement
        fit notes and top-N ranking) and the ML model (when enabled).
        If the ML model is disabled, unavailable, or returns invalid/low-confidence output,
        cleanly fall back to the rule-based engine and log the fallback event in `prediction_logs`.
        """
        start_time = time.perf_counter()

        # Always compute rule-based rankings and rich per-measurement explanations
        ranked_sizes, explanation = self.rule_engine.recommend(
            category_code=category_code,
            body_measurements=body_measurements,
            garment_rows=garment_rows,
            fit_preference=fit_preference,
            product_stretch_pct=product_stretch_pct,
            verification_status=verification_status,
            top_n=max(top_n, len(garment_rows)),
        )

        fallback_used = False
        fallback_reason: Optional[str] = None
        method_used = "rule_based"
        model_version = MODEL_VERSION

        ml_summary: Dict[str, Any] = {}

        if not use_ml or not settings.ML_ENABLED:
            fallback_used = True
            fallback_reason = "ML disabled by request or configuration"
            chosen_option = ranked_sizes[0]
        else:
            try:
                ml_output = self.predictor.predict(
                    category_code=category_code,
                    body_measurements=body_measurements,
                    garment_rows=garment_rows,
                    fit_preference=fit_preference,
                    stretch_pct=product_stretch_pct,
                    allowed_sizes=allowed_sizes,
                )
                model_version = ml_output.model_version

                # Verify that the ML predicted size isn't severely constrictive according to rules
                matched_rule_opt = next(
                    (opt for opt in ranked_sizes if opt.size_label == ml_output.predicted_size),
                    None,
                )
                if matched_rule_opt is None:
                    raise ValueError(f"Predicted size '{ml_output.predicted_size}' not found in rule rankings.")

                if matched_rule_opt.score < 45.0:
                    raise ValueError(
                        f"ML predicted size '{ml_output.predicted_size}' scored too low ({matched_rule_opt.score}) "
                        "on physical ease checks; triggering rule-based safety fallback."
                    )

                # Promote the validated ML size or blend confidence with the top rule size
                method_used = "ml_hybrid"
                chosen_option = matched_rule_opt
                # Re-order so the validated ML choice is first if its physical score is strong
                ranked_sizes = [chosen_option] + [
                    opt for opt in ranked_sizes if opt.size_label != chosen_option.size_label
                ]
                explanation.per_measurement_notes = chosen_option.measurement_notes
                ml_summary = {
                    "predicted_size": ml_output.predicted_size,
                    "fit_category": ml_output.fit_category,
                    "confidence": ml_output.confidence,
                    "model_version": ml_output.model_version,
                    "status": "validated",
                }
            except Exception as exc:
                fallback_used = True
                fallback_reason = str(exc)
                method_used = "rule_based_fallback"
                chosen_option = ranked_sizes[0]
                ml_summary = {
                    "status": "fallback_to_rules",
                    "reason": fallback_reason,
                }
                logger.info(
                    f"ML fallback triggered for product_id={product_id}: {fallback_reason}",
                    extra={"extra_data": {"fallback_reason": fallback_reason}},
                )

        latency_ms = round((time.perf_counter() - start_time) * 1000.0, 3)
        explanation.ml_prediction = ml_summary
        top_ranked_sliced = ranked_sizes[:top_n]

        input_payload = {
            "category_code": category_code,
            "body_measurements": body_measurements,
            "fit_preference": fit_preference,
            "product_stretch_pct": product_stretch_pct,
            "allowed_sizes": allowed_sizes,
        }
        output_payload = {
            "recommended_size": chosen_option.size_label,
            "fit_category": chosen_option.fit_category,
            "score": chosen_option.score,
            "confidence": chosen_option.confidence,
            "method_used": method_used,
            "ml_summary": ml_summary,
        }

        prediction_log = PredictionLog(
            user_id=user_id,
            product_id=product_id,
            model_version=model_version,
            input_payload_json=json.dumps(input_payload, default=str),
            output_payload_json=json.dumps(output_payload, default=str),
            predicted_size=chosen_option.size_label,
            fit_category=chosen_option.fit_category,
            confidence=chosen_option.confidence,
            latency_ms=latency_ms,
            fallback_used=fallback_used,
            fallback_reason=fallback_reason,
        )
        db.add(prediction_log)
        db.flush()

        metadata = {
            "recommended_size": chosen_option.size_label,
            "fit_category": chosen_option.fit_category,
            "score": chosen_option.score,
            "confidence": chosen_option.confidence,
            "method_used": method_used,
            "fallback_used": fallback_used,
            "model_version": model_version,
            "latency_ms": latency_ms,
        }

        return top_ranked_sliced, explanation, metadata, prediction_log
