
from PIL import Image, ImageDraw

from app.coreml.yolo import CoreMLYoloV8s
from app.coreml.mega import CoreMLMegaDetectorV6

model = CoreMLMegaDetectorV6()

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

if __name__ == "__main__":
    results = model.predict("app/test.jpeg")
    draw_annotations("app/test.jpeg", results)
    for a in results:
        print(a.model_dump_json())
