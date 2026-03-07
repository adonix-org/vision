import "dotenv/config";
import "./logging";

import { application } from "./application";
import { Motion } from "./agents/motion";
import { Camera } from "./sources/camera";
import { MpvViewer } from "./targets/mpv";

const url = process.env.C121_RTSP_URL!;
const camera = new Camera("c121", url);

const folder = process.env.LOCAL_IMAGE_FOLDER!;
const agent = new Motion(camera, folder, 1);
const viewer = new MpvViewer(camera, `LiveMotion - ${camera.name}`);

camera.register(viewer);
camera.register(agent);

application.register(camera).start();
