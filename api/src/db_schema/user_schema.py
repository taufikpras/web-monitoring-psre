from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"

class UserBase(BaseModel):
    username: str
    role: UserRole = UserRole.USER
    is_approved: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    approved_at: Optional[datetime] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    role: Optional[UserRole] = None
    is_approved: Optional[bool] = None
    approved_at: Optional[datetime] = None

class UserInDB(UserBase):
    id: str = Field(alias="_id")
    hashed_password: str

class UserResponse(UserBase):
    id: str

    class Config:
        populate_by_name = True
