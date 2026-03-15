from torchvision.ops import nms
import coremltools as ct
import numpy as np
from PIL import Image, ImageDraw
from typing import List

from routes.schemas import Annotation

mlmodel = ct.models.MLModel("python/app/models/yolo/yolov8s.mlpackage")

mega_classes = {0: 'animal', 1: 'person', 2: 'vehicle'}

yolo_classes = {
    0: 'person', 1: 'bicycle', 2: 'car', 3: 'motorcycle', 4: 'airplane', 5: 'bus', 6: 'train',
    7: 'truck', 8: 'boat', 9: 'traffic light', 10: 'fire hydrant', 11: 'stop sign', 12: 'parking meter',
    13: 'bench', 14: 'bird', 15: 'cat', 16: 'dog', 17: 'horse', 18: 'sheep', 19: 'cow', 20: 'elephant',
    21: 'bear', 22: 'zebra', 23: 'giraffe', 24: 'backpack', 25: 'umbrella', 26: 'handbag', 27: 'tie',
    28: 'suitcase', 29: 'frisbee', 30: 'skis', 31: 'snowboard', 32: 'sports ball', 33: 'kite',
    34: 'baseball bat', 35: 'baseball glove', 36: 'skateboard', 37: 'surfboard', 38: 'tennis racket',
    39: 'bottle', 40: 'wine glass', 41: 'cup', 42: 'fork', 43: 'knife', 44: 'spoon', 45: 'bowl',
    46: 'banana', 47: 'apple', 48: 'sandwich', 49: 'orange', 50: 'broccoli', 51: 'carrot', 52: 'hot dog',
    53: 'pizza', 54: 'donut', 55: 'cake', 56: 'chair', 57: 'couch', 58: 'potted plant', 59: 'bed',
    60: 'dining table', 61: 'toilet', 62: 'tv', 63: 'laptop', 64: 'mouse', 65: 'remote', 66: 'keyboard',
    67: 'cell phone', 68: 'microwave', 69: 'oven', 70: 'toaster', 71: 'sink', 72: 'refrigerator',
    73: 'book', 74: 'clock', 75: 'vase', 76: 'scissors', 77: 'teddy bear', 78: 'hair drier', 79: 'toothbrush'
}

def to_square(image: Image.Image, target_size=(640, 640), color=(0, 0, 0)) -> Image.Image:
    img = image.copy()
    img.thumbnail(target_size, Image.LANCZOS)
    new_img = Image.new("RGB", target_size, color)
    new_img.paste(img, (0, 0))
    new_img.show()
    return new_img

def predict_annotations(image_path: str,
                        confidence_threshold: float = 0.0,
                        iou_threshold: float = 0.45,
                        model_name: str = "yolo") -> List[Annotation]:
    
    source = Image.open(image_path)
    square = to_square(source)
    scale = 640 / max(source.width, source.height)

    input_dict = {
        "image": square,
        "confidenceThreshold": confidence_threshold, 
        "iouThreshold": iou_threshold,
    }

    prediction = mlmodel.predict(input_dict)

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

        category = yolo_classes[class_inds[i]]

        annotations.append(
            Annotation(
                category=category,
                x=x,
                y=y,
                width=w,
                height=h,
                confidence=score,
                model=model_name,
                active=True,
                reason="detected"
            )
        )

    return annotations

def draw_annotations(image_path: str, annotations):
    original = Image.open(image_path).convert("RGB")
    img = original.copy()
    draw = ImageDraw.Draw(img)

    for a in annotations:
        x1 = a.x
        y1 = a.y
        x2 = a.x + a.width
        y2 = a.y + a.height

        draw.rectangle([x1, y1, x2, y2], outline="red", width=3)
        draw.text((x1, y1 - 10), f"{a.category} {a.confidence:.2f}", fill="red")

        cx = a.x + a.width // 2
        cy = a.y + a.height // 2
        draw.ellipse([cx-3, cy-3, cx+3, cy+3], fill="yellow")

    img.show()

# Example usage
if __name__ == "__main__":
    results = predict_annotations("python/app/test.jpeg", 0.25, 0.7)
    draw_annotations("python/app/test.jpeg", results)
    for a in results:
        print(a.model_dump_json())  # Pydantic v2
