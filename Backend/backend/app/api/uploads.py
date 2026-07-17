from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.services.supabase_db import supabase
from app.core.security import get_current_user
import uuid

router = APIRouter()

@router.post("/")
async def upload_file(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        contents = await file.read()
        
        ext = file.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{ext}"
        storage_path = f"user_{current_user['id']}/{unique_filename}"
        
        # Upload to Supabase bucket 'beauty-media'
        supabase.storage.from_("beauty-media").upload(
            path=storage_path,
            file=contents,
            file_options={"content-type": file.content_type}
        )
        
        # Get public URL
        public_url = supabase.storage.from_("beauty-media").get_public_url(storage_path)
        
        return {"filename": file.filename, "public_url": public_url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
