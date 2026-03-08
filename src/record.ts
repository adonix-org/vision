import "dotenv/config";
import "./logging";

import { application } from "./application";
// import { MpvViewer } from "./targets/mpv";

import { Recording } from "./targets/recording";
import { PreRoll } from "./targets/preroll";
import { DatePath } from "./paths/date";
import { Camera } from "./sources/camera";

const C121_RTSP_URL = process.env.C121_RTSP_URL!;

const broadcast = new Camera("c121", C121_RTSP_URL);

const preroll = new PreRoll(broadcast, 10);
// const mpv = new MpvViewer(broadcast);

const recording = new Recording(
    preroll,
    new DatePath("/Users/tybusby/Camera/recordings", "video"),
    "mp4",
);

broadcast.register(preroll);

application.register(broadcast);

await application.start();

console.info(preroll.buffer.duration, preroll.buffer.size);
await new Promise((r) => setTimeout(r, 10_000));
console.info(preroll.buffer.duration, preroll.buffer.size);

recording.timestamp = Date.now() - 5_000;
await recording.start();
await new Promise((r) => setTimeout(r, 100));
await recording.stop();

while (true) {
    await new Promise((r) => setTimeout(r, 5_000));

    console.info(preroll.buffer.duration, preroll.buffer.size);
}
