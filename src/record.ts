import "dotenv/config";
import "./logging";

import { application } from "./application";
import { Rtsp } from "./sources/rtsp";
import { MpvViewer } from "./targets/viewers/mpv";

import { Recording } from "./targets/recording";
import { PreRoll } from "./targets/preroll";
import { DatePath } from "./file/date";

const C121_RTSP_URL = process.env.C121_RTSP_URL!;

const broadcast = new Rtsp(C121_RTSP_URL);

const preroll = new PreRoll(broadcast, 5);
const mpv = new MpvViewer(broadcast);

const recording = new Recording(
    broadcast,
    new DatePath("/Users/tybusby/Camera/recordings", "video"),
    "mp4",
);

broadcast.register(preroll, mpv);

application.register(broadcast);
await application.start();

while (application.running) {
    await new Promise((r) => setTimeout(r, 5_000));

    await recording.start();

    await new Promise((r) => setTimeout(r, 5_000));

    await recording.stop();
}
