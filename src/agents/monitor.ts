import { Monitor } from "../workflows/monitor";
import { Agent } from "./agent";
import { LiveImage } from "../workflows/live";
import { PublisherSession } from "../ws/publisher";
import { PyServer } from "../spawn/pyserver";
import { Broadcast } from "../sources/broadcast";
import { StreamDecoder } from "../sources/decoders/stream";

export class MonitorLive extends Agent {
    constructor(broadcast: Broadcast, folder: string, fps: number) {
        const decoder = new StreamDecoder(broadcast, fps);
        const live = new LiveImage(broadcast.name);
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
