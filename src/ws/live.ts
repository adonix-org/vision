import { ActiveWebSocket } from "./active";

const WSS_URL = process.env.LIVEIMAGE_WSS_BROADCAST!;
const BEARER_TOKEN = process.env.LIVEIMAGE_ADMIN_TOKEN!;

export class LiveWebSocket extends ActiveWebSocket {
    public static readonly Factory = () => new this();

    constructor() {
        super(new URL(WSS_URL), {
            headers: { Authorization: "Bearer " + BEARER_TOKEN },
        });
    }

    public override toString(): string {
        return `${super.toString()}[LiveWebSocket-${this.id}]`;
    }
}
