import "dotenv/config";
import "./logging";

import { application } from "./application";
import { Rtsp } from "./sources/rtsp";
import { MpvViewer } from "./targets/viewers/mpv";

import { Recording } from "./targets/recording";
import { PreRoll } from "./targets/preroll";

const C121_RTSP_URL = process.env.C121_RTSP_URL!;

const broadcast = new Rtsp(C121_RTSP_URL);

const preroll = new PreRoll(broadcast, 5);
const mpv = new MpvViewer(broadcast);
const recording = new Recording(
    broadcast,
    "/Users/tybusby/Camera/recordings",
    "mp4",
);

application.register(broadcast, preroll, mpv);
await application.start();

while (true) {
    await new Promise((r) => setTimeout(r, 5_000));

    await recording.start();

    await new Promise((r) => setTimeout(r, 5_000));

    await recording.stop();
}
