from pydantic import BaseModel
from typing import Optional

class StaffBase(BaseModel):
    salon_id: str
    name: str
    role: Optional[str] = None
    avatar: Optional[str] = None

class StaffCreate(StaffBase):
    pass

class StaffUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    avatar: Optional[str] = None

class StaffResponse(StaffBase):
    id: str

    class Config:
        from_attributes = True
