import { Lifecycle } from "../../lifecycle";
import { Broadcast } from "../broadcast";
import { StreamMarker } from "./marker";

export interface StreamChunk {
    data: Buffer;
    timestamp: number;
    marker: number | undefined;
}

export class StreamBuffer extends Lifecycle {
    private purgeTimer?: NodeJS.Timeout;

    private readonly _buffer: StreamChunk[] = [];

    constructor(
        private readonly broadcast: Broadcast,
        private readonly marker: StreamMarker,
        private readonly maxAgeMs: number = 0,
    ) {
        super();
    }

    public buffer(cutoff?: number): Buffer[] {
        const chunks = this.chunks(cutoff);
        return chunks.map((c) => c.data);
    }

    public chunks(cutoff?: number): StreamChunk[] {
        if (this._buffer.length === 0) return [];

        const start = this.index(cutoff);
        if (start === -1) return [];

        const idx = this.scan(start);
        if (idx === -1) return [];

        return this._buffer.slice(idx);
    }

    public get duration(): number {
        const oldest = this._buffer[0];
        const newest = this._buffer[this._buffer.length - 1];
        if (!oldest || !newest) return 0;

        return Math.max(0, newest.timestamp - oldest.timestamp);
    }

    public get size(): number {
        let bytes = 0;
        for (const entry of this._buffer) {
            bytes += entry.data.length;
        }
        return bytes;
    }

    protected purge(): void {
        let end: number;
        if (this.maxAgeMs === 0) {
            end = this.scan();
        } else {
            const cutoff = Date.now() - this.maxAgeMs;
            end = this.scan(this.index(cutoff));
        }

        if (end > 0) {
            this._buffer.splice(0, end);
        }
    }

    private index(cutoff?: number): number {
        if (this._buffer.length === 0) return -1;
        if (cutoff === undefined) return this._buffer.length - 1;

        let end = 0;
        for (const entry of this._buffer) {
            if (entry.timestamp >= cutoff) break;
            end++;
        }

        return end;
    }

    private scan(start: number = this._buffer.length - 1): number {
        if (start < 0 || start > this._buffer.length - 1) return -1;

        let previous: Buffer | undefined;
        for (let i = start; i >= 0; i--) {
            const entry = this._buffer[i]!;

            if (entry.marker !== undefined) {
                if (entry.marker >= 0) return i;
                continue;
            }

            const current = entry.data;
            let search: Buffer;
            if (previous === undefined) {
                search = current;
            } else {
                const overflow = previous.subarray(
                    0,
                    Math.min(this.marker.size, previous.length),
                );
                search = Buffer.concat(
                    [current, overflow],
                    current.length + overflow.length,
                );
            }

            entry.marker = this.marker.find(search);

            if (entry.marker >= 0) return i;

            previous = current;
        }

        return -1;
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        const stream = this.broadcast.subscribe();

        stream.on("data", (chunk) => {
            this._buffer.push({
                data: chunk,
                timestamp: Date.now(),
                marker: undefined,
            });
        });

        this.purgeTimer = setInterval(() => {
            this.purge();
        }, 2_000);
    }

    protected override async onstop(): Promise<void> {
        await super.onstop();

        clearInterval(this.purgeTimer);

        this._buffer.length = 0;
    }

    public override toString(): string {
        return `${super.toString()}[StreamBuffer]`;
    }
}
