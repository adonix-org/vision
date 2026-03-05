import { Readable } from "node:stream";
import { promises as fs } from "node:fs";
import { Ffmpeg } from "../spawn/ffmpeg";
import { Broadcast } from "../sources/broadcast";
import { FilePath } from "../file";

type SupportedFileFormat = "mp4" | "mkv" | "mov" | "ts";

export class Recording extends Ffmpeg {
    private stream: Readable | null = null;

    constructor(
        private readonly broadcast: Broadcast,
        private readonly file: FilePath,
        private readonly format: SupportedFileFormat = "mp4",
    ) {
        super();
    }

    protected override args(): string[] {
        const args = [
            "-loglevel",
            "fatal",
            "-y",
            "-f",
            "mpegts",
            "-use_wallclock_as_timestamps",
            "0",
            "-i",
            "pipe:0",
            "-avoid_negative_ts",
            "make_zero",
            "-copyts",
            "-c",
            "copy",
            "-f",
            this.format,
            `${this.file.path}.${this.format}`,
        ];

        return args;
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        await fs.mkdir(this.file.dirname, { recursive: true });

        this.stream = this.broadcast.subscribe();
        this.stream.pipe(this.child.stdin);

        const cleanup = () => {
            this.stream?.destroy();
            this.stream = null;
        };

        this.child.stdin.on("close", cleanup);
        this.child.stdin.on("error", cleanup);
    }

    protected override async onstop(): Promise<void> {
        await super.onstop();

        await this.waitForIFrame(this.stream!);

        this.stream?.unpipe();
        this.stream?.destroy();
        this.stream = null;

        this.child.stdin.end();

        await this.quit(5_000);
    }

    private waitForIFrame(stream: Readable): Promise<void> {
        return new Promise((resolve) => {
            const onData = (chunk: Buffer) => {
                // Scan the chunk for NAL unit type 0x65 (IDR/I-frame)
                for (let i = 0; i < chunk.length - 4; i++) {
                    // Look for start code 0x00 0x00 0x00 0x01
                    if (
                        chunk[i] === 0x00 &&
                        chunk[i + 1] === 0x00 &&
                        chunk[i + 2] === 0x00 &&
                        chunk[i + 3] === 0x01
                    ) {
                        const nalType = chunk[i + 4]! & 0x1f;
                        if (nalType === 5) {
                            // I-frame found
                            stream.off("data", onData);
                            resolve();
                            return;
                        }
                    }
                }
            };

            stream.on("data", onData);
        });
    }

    public override toString(): string {
        return `${super.toString()}[Recording]`;
    }
}
