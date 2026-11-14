"""Pydantic v2 schemas for Fit Feedback and Recommendation Performance Analytics."""

from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import OverallFitFeedbackLiteral


class FeedbackCreateRequest(BaseModel):
    """User feedback submission connected to an original recommendation."""

    recommendation_id: int = Field(..., gt=0)
    actual_size_worn: str = Field(..., min_length=1, max_length=32)
    overall_fit: OverallFitFeedbackLiteral
    accepted_recommendation: bool = Field(
        default=True,
        description="Whether the user wore/kept the recommended size",
    )
    chest_bust_note: Optional[str] = Field(default=None, max_length=120)
    shoulder_note: Optional[str] = Field(default=None, max_length=120)
    waist_note: Optional[str] = Field(default=None, max_length=120)
    hips_note: Optional[str] = Field(default=None, max_length=120)
    length_note: Optional[str] = Field(default=None, max_length=120)
    sleeve_note: Optional[str] = Field(default=None, max_length=120)
    comments: Optional[str] = Field(default=None, max_length=1000)


class FeedbackResponse(BaseModel):
    """Saved fit feedback record."""

    id: int
    recommendation_id: int
    user_id: int
    actual_size_worn: str
    overall_fit: str
    fit_category_label: str
    accepted_recommendation: bool
    chest_bust_note: Optional[str] = None
    shoulder_note: Optional[str] = None
    waist_note: Optional[str] = None
    hips_note: Optional[str] = None
    length_note: Optional[str] = None
    sleeve_note: Optional[str] = None
    comments: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PerformanceBucket(BaseModel):
    """Aggregated accuracy and acceptance metrics for a slice (brand, category, model version)."""

    key: str
    total_feedback_count: int
    perfect_fit_count: int
    accepted_count: int
    accuracy_rate: float
    acceptance_rate: float


class FeedbackAnalyticsResponse(BaseModel):
    """Comprehensive performance report across brands, categories, and ML model versions."""

    total_recommendations: int
    total_feedbacks: int
    overall_accuracy_rate: float
    overall_acceptance_rate: float
    feedback_distribution: Dict[str, int]
    by_brand: List[PerformanceBucket]
    by_category: List[PerformanceBucket]
    by_model_version: List[PerformanceBucket]
