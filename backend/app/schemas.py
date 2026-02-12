from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime
from typing import Optional, List
from app.models import UserRole, ProjectStatus, MilestoneStatus

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    role: UserRole

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Project Schemas
class ProjectBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    budget: float = Field(..., gt=0)  # Must be greater than 0
    
    @field_validator('budget')
    def validate_budget(cls, v):
        if v <= 0:
            raise ValueError('Budget must be greater than 0')
        return v

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    status: ProjectStatus
    creator_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Milestone Schemas
class MilestoneBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    requested_amount: float = Field(..., gt=0)  # Must be greater than 0
    
    @field_validator('requested_amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Requested amount must be greater than 0')
        return v

class MilestoneCreate(MilestoneBase):
    project_id: int

class MilestoneResponse(MilestoneBase):
    id: int
    project_id: int
    status: MilestoneStatus
    contractor_id: int
    auditor_id: Optional[int]
    created_at: datetime
    approved_at: Optional[datetime]
    
    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[UserRole] = None