import "dotenv/config";
import "./logging";

import { application } from "./application";
import { Camera } from "./sources/camera";
import { BroadcastMonitor } from "./sources/streams/monitor";
import { MpvViewer } from "./targets/mpv";

const url = process.env.C121_RTSP_URL!;
const camera = new Camera("c121", url);
const monitor = new BroadcastMonitor(camera, 3_000);
const viewer = new MpvViewer(camera);

application.register(monitor);
application.register(viewer);

await application.start();
