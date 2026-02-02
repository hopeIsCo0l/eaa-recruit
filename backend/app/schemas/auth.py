"""
Pydantic schemas for authentication.
"""
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from enum import Enum


class UserRole(str, Enum):
    """User roles enumeration."""
    CANDIDATE = "candidate"
    RECRUITER = "recruiter"
    ADMIN = "admin"


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=100)


class UserCreate(UserBase):
    """Schema for user registration."""
    password: str = Field(..., min_length=6, max_length=100)


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class UserResponse(UserBase):
    """Schema for user response."""
    id: int
    role: UserRole
    is_active: bool

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """Schema for updating user."""
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for token data."""
    email: Optional[str] = None
    role: Optional[str] = None


class MessageResponse(BaseModel):
    """Schema for simple message response."""
    message: str
