import { C121 } from "../sources/c121";
import { Monitor } from "../workflows/monitor";
import { Agent } from "./agent";
import { LiveImage } from "../workflows/live";
import { PublisherSession } from "../ws/publisher";
import { PyServer } from "../spawn/pyserver";

export class MonitorLive extends Agent {
    constructor() {
        const source = new C121();
        const live = new LiveImage(source.getName());
        const session = new PublisherSession(live);
        const monitor = new Monitor();

        super(source);
        this.register(session);
        this.register(new PyServer());
        this.register(monitor);

        //this.addTask(live);
        this.addTask(monitor);
    }

    public override toString(): string {
        return `${super.toString()}[MonitorLive]`;
    }
}
