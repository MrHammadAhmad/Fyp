from pydantic import BaseModel, Field, field_validator
from typing import Optional

class ServiceBase(BaseModel):
    name: str
    price: float = Field(..., ge=0)
    duration: int = Field(default=30, gt=0) # duration in minutes

class ServiceCreate(ServiceBase):
    @field_validator('price')
    @classmethod
    def check_price(cls, v):
        if v < 0:
            raise ValueError('Price must be greater than or equal to 0')
        return v
        
    @field_validator('duration')
    @classmethod
    def check_duration(cls, v):
        if v <= 0:
            raise ValueError('Duration must be greater than 0')
        return v

class ServiceResponse(ServiceBase):
    id: str
    salon_id: str

    class Config:
        from_attributes = True

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    duration: Optional[int] = Field(None, gt=0)
    
    @field_validator('price')
    @classmethod
    def check_price(cls, v):
        if v is not None and v < 0:
            raise ValueError('Price must be greater than or equal to 0')
        return v
        
    @field_validator('duration')
    @classmethod
    def check_duration(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Duration must be greater than 0')
        return v

