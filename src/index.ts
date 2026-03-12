import "dotenv/config";
import "./logging";

import { application } from "./application";
import { Motion } from "./agents/motion";
import { Camera } from "./sources/camera";
import { MpvViewer } from "./targets/mpv";
import { StreamMonitor } from "./sources/streams/monitor";
import { PyServer } from "./spawn/pyserver";

const url = process.env.C121_RTSP_URL!;
const folder = process.env.LOCAL_IMAGE_FOLDER!;

const monitor = new StreamMonitor(new Camera("c121", url));
const agent = new Motion(monitor, folder, 1);
const viewer = new MpvViewer(monitor, "LiveMotion");

process.stdin.on("data", async (key) => {
    if (key.toString().toLowerCase() === "v") {
        if (viewer.running) {
            await viewer.stop();
        } else {
            await viewer.start();
        }
    }
});

application.register(new PyServer());
application.register(monitor);
application.register(agent);

await application.start();

application.register(viewer);
