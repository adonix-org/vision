import "dotenv/config";
import "./logging";

import { application } from "./application";
import { Recording } from "./targets/recording";
import { DatePath } from "./paths/date";
import { Camera } from "./sources/camera";

const C121_RTSP_URL = process.env.C121_RTSP_URL!;

const broadcast = new Camera("c121", C121_RTSP_URL);

const recording = new Recording(
    broadcast,
    new DatePath("/Users/tybusby/Camera/recordings", "video"),
    "mp4",
    true,
);

application.register(broadcast);
application.register(recording);

await application.start();
await new Promise((r) => setTimeout(r, 5_000));
application.stop();
