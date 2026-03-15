from typing import List
from fastapi import APIRouter
from fastapi.concurrency import run_in_threadpool
from schemas import Annotation, ImageFrame
from app.coreml.mega import CoreMLMegaDetectorV6
from app.coreml.yolo import CoreMLYoloV8s

router = APIRouter()

mega = CoreMLMegaDetectorV6()
yolo = CoreMLYoloV8s()

@router.post("/coreml/mega")
async def mega_detector(frame: ImageFrame) -> List[Annotation]:
    return await run_in_threadpool(mega.predict, frame.image.buffer)

@router.post("/coreml/yolo")
async def yolo(frame: ImageFrame) -> List[Annotation]:
    return await run_in_threadpool(yolo.predict, frame.image.buffer)
