from typing import IO, Dict, List
from pathlib import Path
from PIL import Image
import coremltools as ct
import numpy as np
from app.routes.schemas import Annotation

class CoreMLBase:
    name: str = "base"
    path: str = ""
    classes: Dict[int, str] = {}
    imgsz: int = 640
    load: bool = False

    def __init__(self):
        if not getattr(self, "path", None):
            raise ValueError("subclass must define a 'path' to an mlpackage")
        if not Path(self.path).exists():
            raise FileNotFoundError(f"mlpackage does not exist: {self.path}")
        
        self.model = None

        if self.load:
            self._load_model()

    def _load_model(self):
        if self.model is None:
            self.model = ct.models.MLModel(self.path)
        
        return self.model

    def predict(self, image: str | IO[bytes],
                confidence_threshold: float = 0.25,
                iou_threshold: float = 0.45) -> List[Annotation]:
        
        model = self._load_model()
        
        with Image.open(image) as source:
            square, scale = self.to_square(source)

        input_dict = {
            "image": square,
            "confidenceThreshold": confidence_threshold, 
            "iouThreshold": iou_threshold,
        }

        prediction = model.predict(input_dict)

        coordinates = np.array(prediction["coordinates"])
        confidence = np.array(prediction["confidence"])
        
        if coordinates.size == 0 or confidence.size == 0:
            return []

        class_inds = np.argmax(confidence, axis=1)
        scores = confidence.max(axis=1)

        annotations: List[Annotation] = []

        for i, (x_center, y_center, w_norm, h_norm) in enumerate(coordinates):
            score = float(scores[i])

            if score < confidence_threshold:
                continue

            x = int((x_center - w_norm / 2) * square.width / scale) 
            y = int((y_center - h_norm / 2) * square.height / scale)
            w = int(w_norm * square.width / scale)
            h = int(h_norm * square.height / scale)

            category = self.classes.get(class_inds[i], "unknown")

            annotations.append(
                Annotation(
                    category=category,
                    x=x,
                    y=y,
                    width=w,
                    height=h,
                    confidence=score,
                    model=self.name,
                    active=True,
                    reason="detected"
                )
            )

        return annotations
    
    def to_square(self, image: Image.Image, color=(0,0,0)):
        w, h = image.size
        scale = min(self.imgsz / w, self.imgsz / h)
        new_w, new_h = int(w * scale), int(h * scale)

        resized = image.resize((new_w, new_h), Image.LANCZOS)
        square = Image.new("RGB", (self.imgsz, self.imgsz), color)
        square.paste(resized, (0, 0))

        return square, scale

