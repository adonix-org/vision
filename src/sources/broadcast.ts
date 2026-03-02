import { Readable } from "node:stream";

export interface Broadcast {
    getReadable(): Readable;
}
