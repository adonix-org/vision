from base import CoreMLBase

class CoreMLMegaDetectorV6(CoreMLBase):
    name = "mdv6"
    path = "python/app/models/mega/MDV6-yolov9-c.mlpackage"
    classes = {
        0: 'animal', 1: 'person', 2: 'vehicle'
    }
    imgsz = 640
