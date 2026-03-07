import { Readable } from "node:stream";
import { Broadcast } from "../sources/broadcast";
import { Subscribers } from "../sources/subscribers";
import { Ffmpeg } from "../spawn/ffmpeg";

export abstract class Encoder extends Ffmpeg implements Broadcast {
    private static readonly DEFAULT_HIGHWATER = 4 * 1024 * 1024;

    private readonly subscribers: Subscribers;

    constructor(private readonly fps: number) {
        super();

        this.subscribers = new Subscribers(Encoder.DEFAULT_HIGHWATER);
    }

    protected override args(): string[] {
        const args = [
            "-fflags",
            "nobuffer",
            "-f",
            "image2pipe",
            "-vcodec",
            "mjpeg",
            "-r",
            `${this.fps}`,
            "-i",
            "-",
            "-c:v",
            "libx264",
            "-preset",
            "veryfast",
            "-tune",
            "zerolatency",
            "-g",
            "1",
            "-f",
            "mpegts",
            "-",
        ];

        return args;
    }

    public get name(): string {
        return this.toString();
    }

    public subscribe(): Readable {
        return this.subscribers.subscribe();
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        this.child.stdout.on("data", (chunk) => {
            this.subscribers.send(chunk);
        });
    }

    protected override async onstop(): Promise<void> {
        await super.onstop();

        this.end();

        await this.quit(5_000);
    }

    public override toString(): string {
        return `${super.toString()}[Encoder]`;
    }
}
