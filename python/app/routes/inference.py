from fastapi import APIRouter
from schemas import Annotation, ImageFrame
from ultralytics import YOLO
import torch
import numpy as np
import cv2
from typing import Literal

router = APIRouter()

device = "mps" if torch.backends.mps.is_available() else "cpu"

models = {
    "mega": YOLO("python/app/models/mega/MDV6-yolov9-c.pt").to(device),
    "yolo": YOLO("python/app/models/yolo/yolov8s.pt").to(device)
}

def run_model(frame: ImageFrame, model_name: Literal["mega", "yolo"]) -> ImageFrame:
    model = models[model_name]

    np_buffer = np.frombuffer(frame.image.buffer, dtype=np.uint8)
    image = cv2.imdecode(np_buffer, cv2.IMREAD_COLOR)

    with torch.inference_mode():
        results = model(image, imgsz=640, verbose=False)

    for r in results:
        for box in r.boxes:
            category = model.names[int(box.cls[0])]
            x1, y1, x2, y2 = box.xyxy[0].tolist()

            frame.annotations.append(
                Annotation(
                    category=category,
                    x=int(x1),
                    y=int(y1),
                    width=int(x2 - x1),
                    height=int(y2 - y1),
                    model=model_name,
                    confidence=float(box.conf[0])
                )
            )

    return frame

@router.post("/mega")
async def mega_detector(frame: ImageFrame):
    return run_model(frame, "mega")

@router.post("/yolo")
async def yolo(frame: ImageFrame):
    return run_model(frame, "yolo")
