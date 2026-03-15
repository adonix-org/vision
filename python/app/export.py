from ultralytics import YOLO

mega = YOLO("python/app/models/mega/MDV6-yolov9-c.pt")
mega.export(
    format="coreml",
    nms=True,                       
    imgsz=640,
    half=True,   
)

print(mega.names)

# Your yolo model
yolo = YOLO("python/app/models/yolo/yolov8s.pt")

yolo.export(
    format="coreml",
    nms=True,                       
    imgsz=640,
    half=True,                                 
)

print(yolo.names)
