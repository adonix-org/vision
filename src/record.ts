import "dotenv/config";
import "./logging";

import { application } from "./application";
import { Rtsp } from "./sources/rtsp";

import { Recorder } from "./targets/recorder";
import { Preview } from "./targets/preview";

const C121_RTSP_URL = process.env.C121_RTSP_URL!;

const rtsp = new Rtsp(C121_RTSP_URL);

const preview = new Preview(rtsp, "mpegts", "LiveMotion");
const recorder = new Recorder(rtsp, "/Users/tybusby/Camera/recordings");

application.register(rtsp);
application.start();

recorder;
preview;
