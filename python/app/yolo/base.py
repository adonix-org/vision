from typing import List
from pathlib import Path
from app.routes.schemas import Annotation, ImageFrame

class YOLOBase:
    name: str = "base"
    path: str = ""
    imgsz: int = 640
    load: bool = False

    def __init__(self):
        if not getattr(self, "path", None):
            raise ValueError("subclass must define a 'path' to weights")
        if not Path(self.path).exists():
            raise FileNotFoundError(f"weights do not exist: {self.path}")

        self.model = None
        self.device = None

        if self.load:
            self._load_model()

    @property
    def classes(self) -> dict[int, str]:
        model = self._load_model()
        return model.names

    def _load_model(self):
        if self.model is not None:
            return self.model

        import torch
        from ultralytics import YOLO

        if self.device is None:
            if torch.backends.mps.is_available():
                self.device = "mps"
            elif torch.cuda.is_available():
                self.device = "cuda"
            else:
                self.device = "cpu"
        
        self.model = YOLO(self.path).to(self.device)
        return self.model

    def predict(self, frame: ImageFrame, confidence_threshold: float = 0.25) -> List[Annotation]:
        import cv2
        import numpy as np

        model = self._load_model()

        np_buffer = np.frombuffer(frame.image.buffer, dtype=np.uint8)
        image = cv2.imdecode(np_buffer, cv2.IMREAD_COLOR)

        annotations: List[Annotation] = []

        import torch
        with torch.inference_mode():
            results = model(image, imgsz=self.imgsz, verbose=False)

        if not results or all(len(r.boxes) == 0 for r in results):
            return []

        for r in results:
            for box in r.boxes:
                score = float(box.conf[0])
                if score < confidence_threshold:
                    continue

                x1, y1, x2, y2 = box.xyxy[0].tolist()
                annotations.append(
                    Annotation(
                        category=self.classes[int(box.cls[0])],
                        x=int(x1),
                        y=int(y1),
                        width=int(x2 - x1),
                        height=int(y2 - y1),
                        confidence=score,
                        model=self.name
                    )
                )

        return annotations
