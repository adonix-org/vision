import "dotenv/config";
import "./logging";

import { application } from "./application";
import { Camera } from "./sources/camera";
import { StreamMonitor } from "./sources/streams/monitor";

const url = process.env.C121_RTSP_URL!;
const c121 = new Camera("c121", url);
const monitor = new StreamMonitor(c121, 3_000);

application.register(monitor, c121);
application.start();
