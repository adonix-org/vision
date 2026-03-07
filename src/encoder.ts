import "dotenv/config";
import "./logging";

import { application } from "./application";
import { Camera } from "./sources/camera";
import { EncoderTest } from "./agents/test";

const url = process.env.C121_RTSP_URL!;
const c121 = new Camera("c121", url);

const agent = new EncoderTest(c121, 1);

c121.register(agent);

application.register(c121).start();
