import "dotenv/config";
import "./logging";

import { application } from "./application";
import { Rtsp } from "./sources/rtsp";
import { MpvViewer } from "./targets/viewers/mpv";

import { Recorder } from "./targets/recorder";

const C121_RTSP_URL = process.env.C121_RTSP_URL!;

const broadcast = new Rtsp(C121_RTSP_URL);

const mpv = new MpvViewer(broadcast);
const recorder = new Recorder(broadcast, "/Users/tybusby/Camera/recordings");

application.register(broadcast, mpv, recorder);
application.start();
