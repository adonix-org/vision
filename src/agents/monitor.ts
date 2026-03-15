import { Monitor } from "../workflows/monitor";
import { Agent } from "./agent";
import { LiveImage } from "../workflows/live";
import { PublisherSession } from "./publisher";
import { PyServer } from "../spawn/pyserver";
import { StreamDecoder } from "../sources/decoders/stream";
import { Camera } from "../sources/camera";

export class MonitorLive extends Agent {
    constructor(camera: Camera, folder: string, fps: number) {
        const decoder = new StreamDecoder(camera, fps);
        const live = new LiveImage(camera.name);
        const session = new PublisherSession(live);
        const monitor = new Monitor(folder);

        super(decoder);

        this.register(new PyServer());
        this.register(session);
        this.register(monitor);

        this.addTask(live);
        this.addTask(monitor);
    }

    public override toString(): string {
        return `${super.toString()}[MonitorLive]`;
    }
}
