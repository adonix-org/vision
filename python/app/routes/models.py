from typing import List, Literal
from fastapi import APIRouter
from fastapi.concurrency import run_in_threadpool
from ultralytics import YOLO
import torch
import numpy as np
import cv2
from app.routes.schemas import Annotation, ImageFrame

router = APIRouter()

device = "mps" if torch.backends.mps.is_available() else "cpu"

models = {
    "mega": YOLO("app/models/mega/MDV6-yolov9-c.pt").to(device),
    "yolo": YOLO("app/models/yolo/yolov8s.pt").to(device)
}

def run_model(frame: ImageFrame, model_name: Literal["mega", "yolo"]) -> List[Annotation]:
    model = models[model_name]

    np_buffer = np.frombuffer(frame.image.buffer, dtype=np.uint8)
    image = cv2.imdecode(np_buffer, cv2.IMREAD_COLOR)

    annotations: List[Annotation] = []

    with torch.inference_mode():
        results = model(image, imgsz=640, verbose=False)

    names = model.names

    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()

            annotations.append(
                Annotation(
                    category=names[int(box.cls[0])],
                    x=int(x1),
                    y=int(y1),
                    width=int(x2 - x1),
                    height=int(y2 - y1),
                    confidence=float(box.conf[0]),
                    model=model_name
                )
            )

    return annotations

@router.post("/mega")
async def mega_detector(frame: ImageFrame) -> List[Annotation]:
    return await run_in_threadpool(run_model, frame, "mega")

@router.post("/yolo")
async def yolo(frame: ImageFrame) -> List[Annotation]:
    return await run_in_threadpool(run_model, frame, "yolo")
