import { Readable } from "node:stream";

export type StreamFormat = "mpegts" | "mjpeg";

export interface Broadcast {
    get format(): StreamFormat;

    subscribe(timestamp?: number): Readable;
}
