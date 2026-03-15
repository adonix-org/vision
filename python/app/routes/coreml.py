from typing import List
from io import BytesIO
from fastapi import APIRouter
from fastapi.concurrency import run_in_threadpool
from app.routes.schemas import Annotation, ImageFrame
from app.coreml.mega import CoreMLMegaDetectorV6
from app.coreml.yolo import CoreMLYoloV8s

router = APIRouter()

megav6 = CoreMLMegaDetectorV6()
yolov8= CoreMLYoloV8s()

@router.post("/coreml/mega")
async def mega_detector(frame: ImageFrame) -> List[Annotation]:
    return await run_in_threadpool(megav6.predict, BytesIO(frame.image.buffer))

@router.post("/coreml/yolo")
async def yolo(frame: ImageFrame) -> List[Annotation]:
    return await run_in_threadpool(yolov8.predict, BytesIO(frame.image.buffer))
