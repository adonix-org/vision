import "dotenv/config";
import "./logging";

import { application } from "./application";
import { Recording } from "./targets/recording";
import { DatePath } from "./paths/date";
import { Camera } from "./sources/camera";

const C121_RTSP_URL = process.env.C121_RTSP_URL!;

const camera = new Camera("c121", C121_RTSP_URL);

const recording = new Recording(
    camera,
    new DatePath("/Users/tybusby/Camera/recordings", "video"),
    "mp4",
    false,
);

application.register(camera);

await application.start();
await new Promise((r) => setTimeout(r, 3_000));
await recording.start();
await new Promise((r) => setTimeout(r, 5_000));
await recording.stop();
await application.stop();
