"""Main FastAPI application entry point with CORS, exception handlers, and /api/v1 routes."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator, Dict

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.models  # noqa: F401 - ensure all ORM models are registered on Base.metadata
from app.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import logger
from app.database import Base, engine
from app.ml.model_loader import default_model_loader
from app.routers import (
    admin,
    auth,
    brands,
    extension,
    feedback,
    measurements,
    products,
    recommendations,
    users,
)


@asynccontextmanager
async def lifespan(fastapi_app: FastAPI) -> AsyncGenerator[None, None]:
    """Initialize SQLite schema and ensure ML artifact is warmed up on startup."""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION} ({settings.ENVIRONMENT})")
    Base.metadata.create_all(bind=engine)
    default_model_loader.load(auto_create_if_missing=True)
    yield
    logger.info(f"Shutting down {settings.APP_NAME}")


def create_app() -> FastAPI:
    """Application factory creating and configuring the FastAPI instance."""
    application = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=(
            "Production-grade REST Backend for Apparel Size & Fit Recommendations, "
            "featuring a 4-category Strategy Engine, ML Hybrid Predictor with Rule Fallback, "
            "Fit Feedback Analytics, Admin Catalog Verification, and Browser Extension APIs."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # Configure CORS from environment settings (including browser extension origins)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_origin_regex=r"^(chrome-extension|moz-extension)://.*$",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Attach global standardized exception handlers
    register_exception_handlers(application)

    # Mount all REST routers under /api/v1
    prefix = settings.API_V1_PREFIX
    application.include_router(auth.router, prefix=prefix)
    application.include_router(users.router, prefix=prefix)
    application.include_router(measurements.router, prefix=prefix)
    application.include_router(brands.router, prefix=prefix)
    application.include_router(products.router, prefix=prefix)
    application.include_router(recommendations.router, prefix=prefix)
    application.include_router(feedback.router, prefix=prefix)
    application.include_router(admin.router, prefix=prefix)
    application.include_router(extension.router, prefix=prefix)

    @application.get("/", tags=["Health"])
    async def root_info() -> Dict[str, str]:
        """Root API discovery endpoint."""
        return {
            "service": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "docs": "/docs",
            "api_v1": settings.API_V1_PREFIX,
        }

    @application.get(f"{prefix}/health", tags=["Health"])
    async def health_check() -> Dict[str, object]:
        """Health check reporting database and ML model readiness."""
        ml_bundle = default_model_loader.load(auto_create_if_missing=True)
        return {
            "status": "healthy",
            "version": settings.APP_VERSION,
            "ml_enabled": settings.ML_ENABLED,
            "ml_model_loaded": ml_bundle is not None,
            "ml_model_version": default_model_loader.get_version(),
        }

    return application


app = create_app()
