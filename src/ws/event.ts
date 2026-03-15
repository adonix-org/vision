import WebSocket from "ws";
import { WebSocketSession } from "./session";

export interface EventMessage {
    event: string;
}

export abstract class EventSession extends WebSocketSession {
    protected abstract handle(msg: EventMessage): void;

    protected override onmessage(data: WebSocket.RawData): void {
        const raw = data.toString();

        const json = this.safeParse(raw);
        if (!json || (typeof json === "object" && !("event" in json))) {
            console.error(this.toString(), "Invalid event object:", raw);
            return;
        }

        this.safeHandle(json as EventMessage);
    }

    private safeParse(raw: string): unknown {
        try {
            return JSON.parse(raw);
        } catch (err) {
            console.error(this.toString(), "Failed to parse JSON:", raw, err);
            return null;
        }
    }

    private safeHandle(msg: EventMessage): void {
        try {
            this.handle(msg);
        } catch (err) {
            console.error(this.toString(), "Error handling event:", msg, err);
        }
    }
}
