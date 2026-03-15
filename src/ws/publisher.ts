import { EventMessage, EventSession } from "./event";
import { Lifecycle } from "../lifecycle";

const WSS_URL = process.env.LIVEIMAGE_WSS_PUBLISH!;
const BEARER_TOKEN = process.env.LIVEIMAGE_ADMIN_TOKEN!;

export interface OnlineMessage extends EventMessage {
    active: number;
    zombies: number;
    subscribers: number;
    publishers: number;
}

export class PublisherSession extends EventSession {
    constructor(private readonly agent: Lifecycle) {
        super(new URL(WSS_URL), {
            headers: { Authorization: "Bearer " + BEARER_TOKEN },
        });

        this.register(agent);
    }

    protected override handle(msg: EventMessage): void {
        if (msg.event === "online") {
            const online = msg as OnlineMessage;
            if (online.active > 0) this.agent.start();
            else this.agent.stop();
        }
    }

    public override toString(): string {
        return `${super.toString()}[PublisherSession]`;
    }
}
