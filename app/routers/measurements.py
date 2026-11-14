"""Body measurement profile router: CRUD for multiple profiles + unit conversion utility."""

from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundException
from app.database import get_db
from app.dependencies import get_current_user
from app.models.measurement import BodyMeasurementProfile
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.measurement import (
    MeasurementCreateRequest,
    MeasurementProfileResponse,
    MeasurementUpdateRequest,
    UnitConversionRequest,
    UnitConversionResponse,
)
from app.services.unit_conversion import (
    LINEAR_MEASUREMENT_FIELDS,
    cm_to_inches,
    inches_to_cm,
    normalize_and_validate_measurements,
)

router = APIRouter(prefix="/measurements", tags=["Body Measurements"])


@router.post("/convert", response_model=UnitConversionResponse)
async def convert_measurement_unit(payload: UnitConversionRequest) -> UnitConversionResponse:
    """Convert a linear measurement value between inches ('in') and centimetres ('cm')."""
    if payload.from_unit == payload.to_unit:
        converted = round(payload.value, 2)
    elif payload.from_unit == "in" and payload.to_unit == "cm":
        converted = inches_to_cm(payload.value)
    else:
        converted = cm_to_inches(payload.value)

    return UnitConversionResponse(
        original_value=payload.value,
        from_unit=payload.from_unit,
        converted_value=converted,
        to_unit=payload.to_unit,
    )


@router.post(
    "",
    response_model=MeasurementProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_measurement_profile(
    payload: MeasurementCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BodyMeasurementProfile:
    """
    Save a new body measurement profile for the current user.
    Accepts either 'cm' or 'in' and stores all dimensions normalized in centimetres.
    """
    raw_dict = {f: getattr(payload, f) for f in LINEAR_MEASUREMENT_FIELDS}
    measurements_cm, weight_kg = normalize_and_validate_measurements(
        raw_measurements=raw_dict,
        unit=payload.unit,
        weight=payload.weight,
        weight_unit=payload.weight_unit,
        gender=payload.gender,
        target_category=payload.target_category,
    )

    existing_count = len(
        db.scalars(
            select(BodyMeasurementProfile).where(BodyMeasurementProfile.user_id == current_user.id)
        ).all()
    )
    make_default = payload.is_default or (existing_count == 0)

    if make_default:
        db.execute(
            update(BodyMeasurementProfile)
            .where(BodyMeasurementProfile.user_id == current_user.id)
            .values(is_default=False)
        )

    profile = BodyMeasurementProfile(
        user_id=current_user.id,
        profile_name=payload.profile_name.strip(),
        gender=payload.gender,
        fit_preference=payload.fit_preference,
        original_unit=payload.unit,
        is_default=make_default,
        chest_bust_cm=measurements_cm["chest_bust"],
        underbust_cm=measurements_cm["underbust"],
        shoulder_cm=measurements_cm["shoulder"],
        sleeve_cm=measurements_cm["sleeve"],
        torso_cm=measurements_cm["torso"],
        waist_cm=measurements_cm["waist"],
        hips_cm=measurements_cm["hips"],
        inseam_cm=measurements_cm["inseam"],
        thigh_cm=measurements_cm["thigh"],
        rise_cm=measurements_cm["rise"],
        height_cm=measurements_cm["height"],
        weight_kg=weight_kg,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("", response_model=List[MeasurementProfileResponse])
async def list_measurement_profiles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[BodyMeasurementProfile]:
    """Retrieve all saved body measurement profiles for the current user."""
    stmt = (
        select(BodyMeasurementProfile)
        .where(BodyMeasurementProfile.user_id == current_user.id)
        .order_by(BodyMeasurementProfile.is_default.desc(), BodyMeasurementProfile.updated_at.desc())
    )
    return list(db.scalars(stmt).all())


@router.get("/{profile_id}", response_model=MeasurementProfileResponse)
async def get_measurement_profile(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BodyMeasurementProfile:
    """Retrieve a specific body measurement profile belonging to the current user."""
    profile = db.get(BodyMeasurementProfile, profile_id)
    if profile is None or profile.user_id != current_user.id:
        raise NotFoundException(f"Measurement profile with id={profile_id} not found.")
    return profile


@router.put("/{profile_id}", response_model=MeasurementProfileResponse)
async def update_measurement_profile(
    profile_id: int,
    payload: MeasurementUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BodyMeasurementProfile:
    """Update an existing body measurement profile (converting inches to cm if unit='in')."""
    profile = db.get(BodyMeasurementProfile, profile_id)
    if profile is None or profile.user_id != current_user.id:
        raise NotFoundException(f"Measurement profile with id={profile_id} not found.")

    # Merge existing cm measurements with any newly supplied fields converted to cm
    incoming_any = any(getattr(payload, f) is not None for f in LINEAR_MEASUREMENT_FIELDS)
    if incoming_any or payload.weight is not None or payload.target_category is not None:
        raw_incoming = {}
        for f in LINEAR_MEASUREMENT_FIELDS:
            val = getattr(payload, f)
            if val is not None:
                raw_incoming[f] = val
            else:
                # Existing value is already in cm; if payload.unit=='in', convert back temporarily or handle directly
                existing_cm = getattr(profile, f"{f}_cm")
                if existing_cm is not None and payload.unit == "in":
                    raw_incoming[f] = existing_cm / 2.54
                else:
                    raw_incoming[f] = existing_cm

        measurements_cm, weight_kg = normalize_and_validate_measurements(
            raw_measurements=raw_incoming,
            unit=payload.unit,
            weight=payload.weight if payload.weight is not None else profile.weight_kg,
            weight_unit=payload.weight_unit if payload.weight is not None else "kg",
            gender=payload.gender or profile.gender,
            target_category=payload.target_category,
        )

        for f in LINEAR_MEASUREMENT_FIELDS:
            if getattr(payload, f) is not None:
                setattr(profile, f"{f}_cm", measurements_cm[f])
        if payload.weight is not None:
            profile.weight_kg = weight_kg
        profile.original_unit = payload.unit

    if payload.profile_name is not None:
        profile.profile_name = payload.profile_name.strip()
    if payload.gender is not None:
        profile.gender = payload.gender
    if payload.fit_preference is not None:
        profile.fit_preference = payload.fit_preference
    if payload.is_default is True:
        db.execute(
            update(BodyMeasurementProfile)
            .where(BodyMeasurementProfile.user_id == current_user.id)
            .values(is_default=False)
        )
        profile.is_default = True
    elif payload.is_default is False:
        profile.is_default = False

    db.commit()
    db.refresh(profile)
    return profile


@router.delete("/{profile_id}", response_model=MessageResponse)
async def delete_measurement_profile(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    """Delete a saved body measurement profile."""
    profile = db.get(BodyMeasurementProfile, profile_id)
    if profile is None or profile.user_id != current_user.id:
        raise NotFoundException(f"Measurement profile with id={profile_id} not found.")

    db.delete(profile)
    db.commit()
    return MessageResponse(success=True, message=f"Measurement profile {profile_id} deleted.")
