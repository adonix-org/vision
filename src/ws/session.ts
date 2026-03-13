import { WebSocket } from "ws";
import { ActiveWebSocket } from "./active";
import { Lifecycle } from "../lifecycle";

export abstract class WebSocketSession extends Lifecycle {
    public static readonly DEFAULT_RECONNECT_SLEEP = 3_000;
    public static readonly MINIMUM_RECONNECT_SLEEP = 1_000;

    private readonly _onmessage = this.onmessage.bind(this);

    private websocket: ActiveWebSocket | null = null;
    private reconnectTimer: NodeJS.Timeout | null = null;

    constructor(
        private readonly factory: () => ActiveWebSocket,
        private reconnectSleepMs = WebSocketSession.DEFAULT_RECONNECT_SLEEP,
    ) {
        super();
    }

    public set reconnectSleep(ms: number) {
        this.reconnectSleepMs = Math.max(
            ms,
            WebSocketSession.MINIMUM_RECONNECT_SLEEP,
        );
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        this.connect();
    }

    protected override async onstop(): Promise<void> {
        await super.onstop();

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.websocket) {
            this.websocket.removeListener("close", this.reconnect);
            this.websocket.close();
            this.websocket = null;
        }
    }

    protected abstract onmessage(
        data: WebSocket.RawData,
        isBinary: boolean,
    ): Promise<void>;

    private connect(): void {
        this.websocket = this.factory();
        this.websocket.once("close", this.reconnect);
        this.websocket.on("message", this._onmessage);
    }

    private readonly reconnect = (): void => {
        if (!this.running) return;
        if (this.reconnectTimer) return;

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            if (!this.running) return;

            console.info(this.toString(), "reconnecting...");
            this.connect();
        }, this.reconnectSleepMs);
    };

    public override toString(): string {
        return `${super.toString()}[WebSocketSession]`;
    }
}
