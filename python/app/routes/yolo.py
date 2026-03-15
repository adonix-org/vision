from typing import List
from fastapi import APIRouter
from fastapi.concurrency import run_in_threadpool
from app.routes.schemas import Annotation, ImageFrame
from app.yolo.mega import MegaDetectorV6C
from app.yolo.yolo import YoloV8S

router = APIRouter()

megav6 = MegaDetectorV6C()
yolov8 = YoloV8S()

@router.post("/mega")
async def mega_detector(frame: ImageFrame) -> List[Annotation]:
    return await run_in_threadpool(megav6.predict, frame)

@router.post("/yolo")
async def yolo(frame: ImageFrame) -> List[Annotation]:
    return await run_in_threadpool(yolov8.predict, frame)
