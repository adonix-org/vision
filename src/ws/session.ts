import { WebSocket } from "ws";
import { Lifecycle } from "../lifecycle";
import { ActiveWebSocket } from "./active";
import { ClientRequestArgs } from "node:http";
import { HeartbeatOptions } from "./heartbeat";

export class WebSocketSession extends Lifecycle {
    public static readonly DEFAULT_RECONNECT_SLEEP = 3_000;
    public static readonly MINIMUM_RECONNECT_SLEEP = 1_000;

    private readonly _onmessage = this.onmessage.bind(this);

    private websocket: WebSocket | null = null;
    private reconnectTimer: NodeJS.Timeout | null = null;

    constructor(
        private readonly address: string | URL,
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

    public send(
        data: string | Buffer,
        cb?: ((err?: Error) => void) | undefined,
    ): void {
        if (!this.websocket) {
            const err = new Error("websocket not connected");
            console.warn(this.toString(), err.message);
            cb?.(err);
            return;
        }

        this.websocket.send(data, cb);
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

    protected options():
        | WebSocket.ClientOptions
        | ClientRequestArgs
        | undefined {
        return undefined;
    }

    protected heartbeat(): HeartbeatOptions | undefined {
        return undefined;
    }

    protected onconnect(address: string | URL): WebSocket {
        return new ActiveWebSocket(address, this.options(), this.heartbeat());
    }

    protected onmessage(_data: WebSocket.RawData, _isBinary: boolean): void {
        return;
    }

    private connect(): void {
        this.websocket = this.onconnect(this.address);
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
