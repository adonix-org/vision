from ultralytics import YOLO

# Your mega model (YOLOv9-c variant)
mega = YOLO("python/app/models/mega/MDV6-yolov9-c.pt")
mega.export(
    format="coreml",
    nms=True,                        # very important → gives usable post-NMS output
    imgsz=640,
    half=True,                      # or True if you want FP16
    # int8=True,                     # optional quantization
)



# Your yolo model
yolo = YOLO("python/app/models/yolo/yolov8s.pt")

yolo.export(
    format="coreml",
    nms=True,                        # very important → gives usable post-NMS output
    imgsz=640,
    half=True,                      # or True if you want FP16
    # int8=True,                     # optional quantization
)
