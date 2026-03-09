import { ImageSource } from "..";
import { ImageDecoder } from "./image";
import { Ffmpeg } from "../../spawn/ffmpeg";
import { ImageFrame } from "../../tasks";
import { Broadcast } from "../broadcast";
import { Readable } from "node:stream";

export class StreamDecoder extends Ffmpeg implements ImageSource {
    private stream: Readable | null = null;

    constructor(
        private readonly broadcast: Broadcast,
        private readonly decoder: ImageDecoder,
        private readonly fps: number,
    ) {
        super();

        this.register(this.decoder);
    }

    protected override args(): string[] {
        const args = [
            "-loglevel",
            "fatal",
            "-f",
            "mpegts",
            "-i",
            "pipe:0",
            "-vf",
            `fps=${this.fps}`,
            "-f",
            "image2pipe",
            "-vcodec",
            this.decoder.vcodec,
            // "-q:v",
            // "1",
            "pipe:1",
        ];
        return args;
    }

    public async next(): Promise<ImageFrame | null> {
        return this.decoder.next();
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        this.child.stdout.on("data", (chunk: Buffer) => {
            this.decoder.ondata(chunk);
        });

        this.stream = this.broadcast.subscribe();
        this.stream.pipe(this.child.stdin);

        const cleanup = () => {
            this.stream?.destroy();
            this.stream = null;
        };

        this.child.stdin.on("close", cleanup);
        this.child.stdin.on("error", cleanup);
    }

    public override toString(): string {
        return `${super.toString()}[StreamDecoder]`;
    }
}
