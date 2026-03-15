from fastapi import APIRouter
from app.routes.schemas import ImageFrame

router = APIRouter()

@router.post("/passthrough")
async def passthrough(frame: ImageFrame):
    return frame

