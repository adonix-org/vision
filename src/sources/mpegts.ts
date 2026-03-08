import { Lifecycle } from "../lifecycle";
import { Broadcast } from "./broadcast";

export interface MpegTsChunk {
    chunk: Buffer;
    timestamp: number;
}

export class MpegTsBuffer extends Lifecycle {
    private static readonly NAL_UNIT_START = Buffer.from([
        0x00, 0x00, 0x00, 0x01,
    ]);

    private purgeInterval?: NodeJS.Timeout;

    private readonly _buffer: MpegTsChunk[] = [];

    constructor(
        private readonly broadcast: Broadcast,
        private readonly maxAgeMs: number = 0,
    ) {
        super();
    }

    public buffer(cutoff?: number): Buffer[] {
        const chunks = this.chunks(cutoff);
        return chunks.map((c) => c.chunk);
    }

    public chunks(cutoff?: number): MpegTsChunk[] {
        if (this._buffer.length === 0) return [];

        const start = this.index(cutoff);
        if (start === -1) return [];

        const idx = this.keyframe(start);
        if (idx === -1) return [];

        return this._buffer.slice(idx);
    }

    public get duration(): number {
        const oldest = this._buffer[0];
        const newest = this._buffer[this._buffer.length - 1];
        if (!oldest || !newest) return 0;

        return newest.timestamp - oldest.timestamp;
    }

    public get size(): number {
        let bytes = 0;
        for (const entry of this._buffer) {
            bytes += entry.chunk.length;
        }
        return bytes;
    }

    protected purge(): void {
        let end: number;
        if (this.maxAgeMs === 0) {
            end = this.keyframe(this._buffer.length - 1);
        } else {
            const cutoff = Date.now() - this.maxAgeMs;
            end = this.keyframe(this.index(cutoff));
        }

        this._buffer.splice(0, end + 1);
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

    private keyframe(start: number): number {
        if (start < 0 || start > this._buffer.length - 1) return -1;

        let prevTail: Buffer | null = null;
        for (let i = start; i >= 0; i--) {
            const entry = this._buffer[i]!;
            const buf = entry.chunk;
            const scan = prevTail ? Buffer.concat([prevTail, buf]) : buf;

            let offset = 0;
            while (true) {
                const start = scan.indexOf(MpegTsBuffer.NAL_UNIT_START, offset);
                if (start === -1) break;

                const headerIdx = start + 4;
                if (headerIdx >= scan.length) break;

                const nalType = scan[headerIdx]! & 0x1f;
                if (nalType === 5) return i;

                offset = headerIdx + 1;
            }

            prevTail = buf.subarray(Math.max(0, buf.length - 3));
        }

        return -1;
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        const stream = this.broadcast.subscribe();

        stream.on("data", (chunk) => {
            this._buffer.push({
                chunk,
                timestamp: Date.now(),
            });
        });

        this.purgeInterval = setInterval(() => {
            this.purge();
        }, 1_000);
    }

    protected override async onstop(): Promise<void> {
        await super.onstop();

        clearInterval(this.purgeInterval);

        this._buffer.length = 0;
    }

    public override toString(): string {
        return `${super.toString()}[MpegTsBuffer]`;
    }
}
