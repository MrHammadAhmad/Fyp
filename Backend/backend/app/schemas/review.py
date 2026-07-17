from pydantic import BaseModel
from typing import Optional

class ReviewBase(BaseModel):
    salon_id: str
    rating: int # 1 to 5
    comment: Optional[str] = None
    customer_name: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewReply(BaseModel):
    owner_reply: str

class ReviewResponse(ReviewBase):
    id: str
    user_id: str
    owner_reply: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True
