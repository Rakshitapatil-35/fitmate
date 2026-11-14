"""
Database seed script populating an admin user, a demo user with body measurement profiles,
all 4 clothing categories, sample brands, products, verified size charts, and the initial ML model.
Run via: `python seed.py`
"""

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

import app.models  # noqa: F401
from app.core.security import hash_password
from app.database import Base, SessionLocal, engine
from app.ml.train_stub import build_and_save_dummy_model
from app.models.catalog import Brand, ClothingCategory, GarmentMeasurement, Product, SizeChart
from app.models.measurement import BodyMeasurementProfile
from app.models.user import User


from pathlib import Path
from app.config import settings


def seed_database(db: Session) -> dict[str, int]:
    """Idempotently seed initial data into the SQLite database."""
    Base.metadata.create_all(bind=engine)
    if not Path(settings.ML_MODEL_PATH).exists():
        build_and_save_dummy_model()

    now = datetime.now(timezone.utc)

    # 1. Users (Admin + Standard User)
    admin_user = db.scalar(select(User).where(User.email == "admin@sizerec.example.com"))
    if admin_user is None:
        admin_user = User(
            email="admin@sizerec.example.com",
            full_name="Platform Admin",
            hashed_password=hash_password("AdminPass123"),
            role="admin",
            is_active=True,
        )
        db.add(admin_user)

    demo_user = db.scalar(select(User).where(User.email == "alex@sizerec.example.com"))
    if demo_user is None:
        demo_user = User(
            email="alex@sizerec.example.com",
            full_name="Alex Rivera",
            hashed_password=hash_password("UserPass123"),
            role="user",
            is_active=True,
        )
        db.add(demo_user)

    db.flush()

    # 2. Demo User Measurement Profiles
    existing_profiles = db.scalars(
        select(BodyMeasurementProfile).where(BodyMeasurementProfile.user_id == demo_user.id)
    ).all()
    if not existing_profiles:
        db.add_all(
            [
                BodyMeasurementProfile(
                    user_id=demo_user.id,
                    profile_name="Alex Men's Regular Profile",
                    gender="male",
                    fit_preference="regular",
                    original_unit="cm",
                    is_default=True,
                    chest_bust_cm=98.0,
                    shoulder_cm=45.0,
                    sleeve_cm=64.0,
                    torso_cm=68.0,
                    waist_cm=84.0,
                    hips_cm=99.0,
                    inseam_cm=80.0,
                    thigh_cm=57.0,
                    rise_cm=27.0,
                    height_cm=179.0,
                    weight_kg=76.0,
                ),
                BodyMeasurementProfile(
                    user_id=demo_user.id,
                    profile_name="Alex Women's Tailored Profile",
                    gender="female",
                    fit_preference="regular",
                    original_unit="cm",
                    is_default=False,
                    chest_bust_cm=90.0,
                    underbust_cm=76.0,
                    shoulder_cm=39.5,
                    sleeve_cm=59.0,
                    torso_cm=60.0,
                    waist_cm=72.0,
                    hips_cm=97.0,
                    inseam_cm=75.0,
                    thigh_cm=55.0,
                    rise_cm=26.0,
                    height_cm=167.0,
                    weight_kg=61.0,
                ),
            ]
        )

    # 3. Clothing Categories (4 required categories)
    categories_seed = [
        ("mens_tops", "Men's Tops", "male", "tops", "Shirts, tees, sweaters, and jackets for men"),
        ("womens_tops", "Women's Tops", "female", "tops", "Blouses, tops, knitwear, and bodysuits for women"),
        ("mens_bottoms", "Men's Bottoms", "male", "bottoms", "Trousers, jeans, chinos, and shorts for men"),
        ("womens_bottoms", "Women's Bottoms", "female", "bottoms", "Jeans, trousers, and skirts for women"),
    ]
    cat_map: dict[str, ClothingCategory] = {}
    for code, name, gender, group, desc in categories_seed:
        cat = db.scalar(select(ClothingCategory).where(ClothingCategory.code == code))
        if cat is None:
            cat = ClothingCategory(
                code=code,
                name=name,
                gender=gender,
                garment_group=group,
                description=desc,
            )
            db.add(cat)
            db.flush()
        cat_map[code] = cat

    # 4. Brands
    brands_seed = [
        (
            "NordicThread",
            "nordic-thread",
            "nordicthread.example.com",
            "Sweden",
            "EU/International",
            "Minimalist Scandinavian essentials with verified garment measurements.",
        ),
        (
            "AuraAtelier",
            "aura-atelier",
            "auraatelier.example.com",
            "United States",
            "US/International",
            "Contemporary stretch-woven womenswear and tailored separates.",
        ),
    ]
    brand_map: dict[str, Brand] = {}
    for b_name, b_slug, b_domain, b_country, b_sys, b_desc in brands_seed:
        b_obj = db.scalar(select(Brand).where(Brand.slug == b_slug))
        if b_obj is None:
            b_obj = Brand(
                name=b_name,
                slug=b_slug,
                website_domain=b_domain,
                country=b_country,
                sizing_system=b_sys,
                description=b_desc,
                is_active=True,
            )
            db.add(b_obj)
            db.flush()
        brand_map[b_slug] = b_obj

    # 5. Products & Size Charts for all 4 categories
    existing_products = db.scalars(select(Product)).all()
    if not existing_products:
        # Product 1: Men's Top
        p_mens_top = Product(
            brand_id=brand_map["nordic-thread"].id,
            category_id=cat_map["mens_tops"].id,
            external_product_id="NT-MT-101",
            name="Nordic Oxford Button-Down Shirt",
            product_url="https://nordicthread.example.com/products/oxford-shirt-101",
            description="Crisp organic cotton oxford shirt with regular tailoring.",
            primary_fabric="Organic Cotton",
            fabric_composition="98% Organic Cotton, 2% Elastane",
            stretch_percentage=2.0,
            intended_fit="regular",
            available_sizes_csv="XS,S,M,L,XL,XXL",
            is_active=True,
        )
        # Product 2: Women's Top
        p_womens_top = Product(
            brand_id=brand_map["aura-atelier"].id,
            category_id=cat_map["womens_tops"].id,
            external_product_id="AA-WT-201",
            name="Aura Sculpted Ribbed Knit Top",
            product_url="https://auraatelier.example.com/products/sculpted-rib-top-201",
            description="Fitted ribbed knit top with contoured bust and underbust support.",
            primary_fabric="Modal Rib Knit",
            fabric_composition="92% Tencel Modal, 8% Spandex",
            stretch_percentage=8.0,
            intended_fit="regular",
            available_sizes_csv="XS,S,M,L,XL",
            is_active=True,
        )
        # Product 3: Men's Bottom
        p_mens_bottom = Product(
            brand_id=brand_map["nordic-thread"].id,
            category_id=cat_map["mens_bottoms"].id,
            external_product_id="NT-MB-301",
            name="Nordic Stretch Twill Chino",
            product_url="https://nordicthread.example.com/products/stretch-chino-301",
            description="Everyday tapered chino with comfortable 4% stretch.",
            primary_fabric="Stretch Cotton Twill",
            fabric_composition="96% Cotton, 4% Elastane",
            stretch_percentage=4.0,
            intended_fit="regular",
            available_sizes_csv="S,M,L,XL",
            is_active=True,
        )
        # Product 4: Women's Bottom
        p_womens_bottom = Product(
            brand_id=brand_map["aura-atelier"].id,
            category_id=cat_map["womens_bottoms"].id,
            external_product_id="AA-WB-401",
            name="Aura High-Rise Wide Leg Jean",
            product_url="https://auraatelier.example.com/products/high-rise-jean-401",
            description="High-rise denim tailored through waist and hips.",
            primary_fabric="Comfort Stretch Denim",
            fabric_composition="95% Cotton, 4% Polyester, 1% Elastane",
            stretch_percentage=3.0,
            intended_fit="regular",
            available_sizes_csv="XS,S,M,L,XL",
            is_active=True,
        )
        db.add_all([p_mens_top, p_womens_top, p_mens_bottom, p_womens_bottom])
        db.flush()

        # Size Chart 1: Men's Tops
        sc_mt = SizeChart(
            brand_id=brand_map["nordic-thread"].id,
            category_id=cat_map["mens_tops"].id,
            product_id=p_mens_top.id,
            name="NordicThread Men's Shirts Official Chart",
            source_url="https://nordicthread.example.com/size-guide/mens-tops",
            data_source="brand_official_garment_spec",
            verification_status="verified",
            verified_at=now,
            verified_by_user_id=admin_user.id,
            notes="Verified flat-lay garment measurements converted to 3D circumference.",
        )
        db.add(sc_mt)
        db.flush()
        mt_rows = [
            ("XS", 1, 94.0, 42.5, 62.0, 68.0),
            ("S", 2, 100.0, 44.0, 63.5, 70.0),
            ("M", 3, 106.5, 46.5, 65.0, 72.0),
            ("L", 4, 113.0, 48.5, 66.5, 74.0),
            ("XL", 5, 120.0, 50.5, 68.0, 76.0),
            ("XXL", 6, 127.0, 52.5, 69.5, 78.0),
        ]
        for label, order, chest, shoulder, sleeve, torso in mt_rows:
            db.add(
                GarmentMeasurement(
                    size_chart_id=sc_mt.id,
                    size_label=label,
                    size_order=order,
                    chest_bust_cm=chest,
                    shoulder_cm=shoulder,
                    sleeve_cm=sleeve,
                    torso_cm=torso,
                    data_source="brand_official_garment_spec",
                    verification_status="verified",
                    verified_at=now,
                    verified_by_user_id=admin_user.id,
                )
            )

        # Size Chart 2: Women's Tops
        sc_wt = SizeChart(
            brand_id=brand_map["aura-atelier"].id,
            category_id=cat_map["womens_tops"].id,
            product_id=p_womens_top.id,
            name="AuraAtelier Women's Knit Tops Chart",
            source_url="https://auraatelier.example.com/size-guide/womens-tops",
            data_source="brand_tech_pack_2026",
            verification_status="verified",
            verified_at=now,
            verified_by_user_id=admin_user.id,
        )
        db.add(sc_wt)
        db.flush()
        wt_rows = [
            ("XS", 1, 84.0, 70.0, 37.5, 58.0),
            ("S", 2, 89.0, 75.0, 39.0, 59.0),
            ("M", 3, 94.0, 80.0, 40.5, 60.0),
            ("L", 4, 100.0, 86.0, 42.0, 61.0),
            ("XL", 5, 107.0, 92.0, 43.5, 62.0),
        ]
        for label, order, bust, underbust, shoulder, sleeve in wt_rows:
            db.add(
                GarmentMeasurement(
                    size_chart_id=sc_wt.id,
                    size_label=label,
                    size_order=order,
                    chest_bust_cm=bust,
                    underbust_cm=underbust,
                    shoulder_cm=shoulder,
                    sleeve_cm=sleeve,
                    data_source="brand_tech_pack_2026",
                    verification_status="verified",
                    verified_at=now,
                    verified_by_user_id=admin_user.id,
                )
            )

        # Size Chart 3: Men's Bottoms
        sc_mb = SizeChart(
            brand_id=brand_map["nordic-thread"].id,
            category_id=cat_map["mens_bottoms"].id,
            product_id=p_mens_bottom.id,
            name="NordicThread Men's Chinos Chart",
            source_url="https://nordicthread.example.com/size-guide/mens-bottoms",
            data_source="brand_official_garment_spec",
            verification_status="verified",
            verified_at=now,
            verified_by_user_id=admin_user.id,
        )
        db.add(sc_mb)
        db.flush()
        mb_rows = [
            ("S", 1, 80.0, 98.0, 79.0, 57.0, 26.5),
            ("M", 2, 86.0, 104.0, 80.5, 61.0, 27.5),
            ("L", 3, 92.0, 110.0, 81.5, 64.5, 28.5),
            ("XL", 4, 99.0, 117.0, 82.5, 68.0, 29.5),
        ]
        for label, order, waist, hips, inseam, thigh, rise in mb_rows:
            db.add(
                GarmentMeasurement(
                    size_chart_id=sc_mb.id,
                    size_label=label,
                    size_order=order,
                    waist_cm=waist,
                    hips_cm=hips,
                    inseam_cm=inseam,
                    thigh_cm=thigh,
                    rise_cm=rise,
                    data_source="brand_official_garment_spec",
                    verification_status="verified",
                    verified_at=now,
                    verified_by_user_id=admin_user.id,
                )
            )

        # Size Chart 4: Women's Bottoms
        sc_wb = SizeChart(
            brand_id=brand_map["aura-atelier"].id,
            category_id=cat_map["womens_bottoms"].id,
            product_id=p_womens_bottom.id,
            name="AuraAtelier Women's Denim Chart",
            source_url="https://auraatelier.example.com/size-guide/womens-bottoms",
            data_source="brand_tech_pack_2026",
            verification_status="verified",
            verified_at=now,
            verified_by_user_id=admin_user.id,
        )
        db.add(sc_wb)
        db.flush()
        wb_rows = [
            ("XS", 1, 67.0, 93.0, 74.5, 54.0, 25.5),
            ("S", 2, 72.0, 98.0, 75.0, 57.0, 26.5),
            ("M", 3, 75.0, 102.5, 75.5, 59.5, 27.0),
            ("L", 4, 81.0, 108.5, 76.0, 63.0, 28.0),
            ("XL", 5, 88.0, 115.0, 76.5, 67.0, 29.0),
        ]
        for label, order, waist, hips, inseam, thigh, rise in wb_rows:
            db.add(
                GarmentMeasurement(
                    size_chart_id=sc_wb.id,
                    size_label=label,
                    size_order=order,
                    waist_cm=waist,
                    hips_cm=hips,
                    inseam_cm=inseam,
                    thigh_cm=thigh,
                    rise_cm=rise,
                    data_source="brand_tech_pack_2026",
                    verification_status="verified",
                    verified_at=now,
                    verified_by_user_id=admin_user.id,
                )
            )

    db.commit()

    return {
        "users": len(db.scalars(select(User)).all()),
        "brands": len(db.scalars(select(Brand)).all()),
        "categories": len(db.scalars(select(ClothingCategory)).all()),
        "products": len(db.scalars(select(Product)).all()),
        "size_charts": len(db.scalars(select(SizeChart)).all()),
    }


if __name__ == "__main__":
    with SessionLocal() as session:
        counts = seed_database(session)
        print("Database seeded successfully:", counts)
