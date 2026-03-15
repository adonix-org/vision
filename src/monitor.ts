import "dotenv/config";
import "./logging";

import { application } from "./application";
import { MonitorLive } from "./agents/monitor";
import { Camera } from "./sources/camera";
import { BroadcastMonitor } from "./sources/streams/monitor";

const url = process.env.C121_RTSP_URL!;
const folder = process.env.LOCAL_IMAGE_FOLDER!;
const c121 = new Camera("c121", url);

application.register(new BroadcastMonitor(c121));
application.register(new MonitorLive(c121, folder, 1));
application.start();
