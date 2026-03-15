from typing import Dict, List
from pathlib import Path
from PIL import Image, ImageDraw
import coremltools as ct
import numpy as np
from routes.schemas import Annotation

class CoreMLBase:
    name: str = "base"
    path: str = ""
    classes: Dict[int, str] = {}
    imgsz: int = 640

    def __init__(self):
        if not getattr(self, "path", None):
            raise ValueError("subclass must define a 'path' to an mlpackage")
        if not Path(self.path).exists():
            raise FileNotFoundError(f"mlpackage does not exist: {self.path}")
        
        self.model = ct.models.MLModel(self.path)

    def predict(self, image_path: str,
                confidence_threshold: float = 0.0,
                iou_threshold: float = 0.45) -> List[Annotation]:
        
        source = Image.open(image_path)
        square = self.to_square(source)
        scale = self.imgsz / max(source.width, source.height)

        input_dict = {
            "image": square,
            "confidenceThreshold": confidence_threshold, 
            "iouThreshold": iou_threshold,
        }

        prediction = self.model.predict(input_dict)

        coordinates = np.array(prediction["coordinates"])
        confidence = np.array(prediction["confidence"])

        class_inds = np.argmax(confidence, axis=1)
        scores = confidence[np.arange(confidence.shape[0]), class_inds]

        annotations: List[Annotation] = []

        for i in range(len(coordinates)):
            x_center, y_center, w_norm, h_norm = coordinates[i]
            score = float(scores[i])

            x = int((x_center - w_norm / 2) * square.width / scale) 
            y = int((y_center - h_norm / 2) * square.height / scale)
            w = int(w_norm * square.width / scale)
            h = int(h_norm * square.height / scale)

            category = self.classes[class_inds[i]]

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
    
    def to_square(self, image: Image.Image, color=(0,0,0)) -> Image.Image:
        w, h = image.size
        scale = min(self.imgsz / w, self.imgsz / h)
        new_w, new_h = int(w * scale), int(h * scale)

        resized = image.resize((new_w, new_h), Image.LANCZOS)
        square = Image.new("RGB", (self.imgsz, self.imgsz), color)
        square.paste(resized, (0, 0))  # top-left
        return square

    def to_square_working(self, image: Image.Image, color=(0, 0, 0)) -> Image.Image:
        img = image.copy()
        img.thumbnail(self.imgsz, Image.LANCZOS)
        new_img = Image.new("RGB", self.imgsz, color)
        new_img.paste(img, (0, 0))
        new_img.show()
        return new_img
