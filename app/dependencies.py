"""FastAPI dependencies for authentication, token blacklist checking, and role-based access control."""

from typing import Any, Dict

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenException, UnauthorizedException
from app.core.security import decode_token
from app.database import get_db
from app.models.user import TokenBlacklist, User

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_token_payload(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Extract and verify the Bearer JWT token and ensure it is not blacklisted."""
    if credentials is None or not credentials.credentials:
        raise UnauthorizedException("Missing Bearer authentication token.")

    payload = decode_token(credentials.credentials, expected_type="access")
    jti = payload.get("jti")

    revoked = db.scalar(select(TokenBlacklist).where(TokenBlacklist.jti == jti))
    if revoked is not None:
        raise UnauthorizedException("Token has been revoked. Please log in again.")

    return payload


async def get_current_user(
    payload: Dict[str, Any] = Depends(get_current_token_payload),
    db: Session = Depends(get_db),
) -> User:
    """Resolve the currently authenticated active user from the database."""
    user_id_str = payload.get("sub")
    try:
        user_id = int(str(user_id_str))
    except (TypeError, ValueError) as exc:
        raise UnauthorizedException("Invalid user subject in token.") from exc

    user = db.get(User, user_id)
    if user is None:
        raise UnauthorizedException("User account no longer exists.")
    if not user.is_active:
        raise ForbiddenException("User account is deactivated.")
    return user


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Restrict route access to users with the 'admin' role."""
    if current_user.role != "admin":
        raise ForbiddenException("Admin privileges are required to access this endpoint.")
    return current_user
