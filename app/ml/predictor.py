"""ML predictor and strict output validator."""

from typing import Any, Dict, List, Optional
import numpy as np
from pydantic import BaseModel, Field, field_validator

from app.config import settings
from app.ml.model_loader import ModelLoader, default_model_loader
from app.ml.version import ALLOWED_FIT_CATEGORIES

FIT_PREF_MAP = {"slim": 0, "regular": 1, "relaxed": 2}


class ValidatedMLOutput(BaseModel):
    """Pydantic v2 schema enforcing strict validation on ML model predictions."""

    predicted_size: str = Field(..., min_length=1, max_length=32)
    fit_category: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    model_version: str

    @field_validator("fit_category")
    @classmethod
    def check_fit_category(cls, value: str) -> str:
        if value not in ALLOWED_FIT_CATEGORIES:
            raise ValueError(f"Invalid fit_category '{value}'. Must be one of {ALLOWED_FIT_CATEGORIES}")
        return value


class MLPredictor:
    """Runs inference against the loaded scikit-learn artifact and validates output."""

    def __init__(self, loader: Optional[ModelLoader] = None, auto_create_if_missing: bool = True) -> None:
        self.loader = loader or default_model_loader
        self.auto_create_if_missing = auto_create_if_missing

    def predict(
        self,
        category_code: str,
        body_measurements: Dict[str, Optional[float]],
        garment_rows: List[Dict[str, Any]],
        fit_preference: str,
        stretch_pct: float,
        allowed_sizes: List[str],
        min_confidence: Optional[float] = None,
    ) -> ValidatedMLOutput:
        """
        Predict the best size and fit category from user measurements and garment chart.
        Raises ValueError or RuntimeError if model is unavailable or output fails validation.
        """
        bundle = self.loader.load(auto_create_if_missing=self.auto_create_if_missing)
        if bundle is None:
            raise RuntimeError("ML model artifact is unavailable or disabled.")

        clf = bundle["classifier"]
        model_version = str(bundle.get("model_version", "unknown"))

        # Extract primary & secondary measurements depending on category
        if "tops" in category_code:
            primary = body_measurements.get("chest_bust")
            secondary = body_measurements.get("waist") or (primary * 0.85 if primary else None)
        else:
            primary = body_measurements.get("waist") or body_measurements.get("hips")
            secondary = body_measurements.get("hips") or primary

        if primary is None or secondary is None:
            raise ValueError("Primary body measurement missing for ML feature vector.")

        fit_code = FIT_PREF_MAP.get(fit_preference, 1)
        features = np.array([[float(primary), float(secondary), float(stretch_pct), float(fit_code)]])

        proba = clf.predict_proba(features)[0]
        classes = list(clf.classes_)

        # Filter probabilities to sizes available in the current size chart if compatible
        chart_sizes = [str(r["size_label"]) for r in garment_rows]
        valid_allowed = set(allowed_sizes) & set(chart_sizes) if allowed_sizes else set(chart_sizes)

        best_size: Optional[str] = None
        best_conf: float = 0.0

        # Rank class probabilities
        ranked_indices = np.argsort(proba)[::-1]
        for idx in ranked_indices:
            candidate_size = str(classes[idx])
            if candidate_size in valid_allowed:
                best_size = candidate_size
                # Normalize confidence across chart-compatible classes
                compatible_prob_sum = sum(
                    float(proba[i]) for i, c in enumerate(classes) if str(c) in valid_allowed
                )
                raw_p = float(proba[idx])
                best_conf = round(
                    min(0.96, max(raw_p, raw_p / max(compatible_prob_sum, 0.01) * 0.85)),
                    2,
                )
                break

        if best_size is None:
            raise ValueError(
                f"ML model classes {classes} do not match product's allowed size chart {sorted(valid_allowed)}."
            )

        # Infer fit category by checking ease on primary dimension for the predicted size
        matched_row = next((r for r in garment_rows if str(r["size_label"]) == best_size), None)
        fit_category = "good_fit"
        if matched_row:
            garment_primary = (
                matched_row.get("chest_bust_cm")
                if "tops" in category_code
                else matched_row.get("waist_cm") or matched_row.get("hips_cm")
            )
            if garment_primary is not None:
                ease = float(garment_primary) - float(primary)
                if ease < 1.0:
                    fit_category = "too_tight"
                elif ease > 16.0:
                    fit_category = "loose"

        threshold = min_confidence if min_confidence is not None else settings.ML_MIN_CONFIDENCE
        if best_conf < threshold:
            raise ValueError(
                f"ML prediction confidence ({best_conf:.2f}) is below minimum threshold ({threshold:.2f})."
            )

        return ValidatedMLOutput(
            predicted_size=best_size,
            fit_category=fit_category,
            confidence=best_conf,
            model_version=model_version,
        )
