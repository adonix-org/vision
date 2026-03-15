from ultralytics import YOLO

mega = YOLO("app/models/mega/MDV6-yolov9-c.pt")
mega.export(
    format="coreml",
    nms=True,                       
    imgsz=640,
    half=True,   
)

print(mega.names)

yolo = YOLO("app/models/yolo/yolov8s.pt")
yolo.export(
    format="coreml",
    nms=True,                       
    imgsz=640,
    half=True,                                 
)

print(yolo.names)
