import { ImageSource } from "..";
import { ImageDecoder } from "./image";
import { Ffmpeg } from "../../spawn/ffmpeg";
import { ImageFrame } from "../../tasks";
import { Broadcast } from "../broadcast";
import { Readable } from "node:stream";
import { JpegDecoder } from "./jpeg";

export class StreamDecoder extends Ffmpeg implements ImageSource {
    private stream: Readable | null = null;
    private timeOrigin: number = Date.now();
    private readonly msPerFrame: number;

    constructor(
        private readonly broadcast: Broadcast,
        private readonly fps: number,
        private readonly decoder: ImageDecoder = new JpegDecoder(1),
    ) {
        super();

        this.msPerFrame = 1_000 / fps;

        this.register(this.decoder);
    }

    protected override args(): string[] {
        const args: string[] = [];

        args.push("-fflags", "nobuffer");
        args.push("-f", "mpegts");
        args.push("-i", "pipe:0");
        args.push("-vf", `fps=${this.fps}`);
        args.push("-f", "image2pipe");
        args.push("-vcodec", this.decoder.vcodec);
        args.push("pipe:1");

        return args;
    }

    public async next(): Promise<ImageFrame | null> {
        const frame = await this.decoder.next();
        if (frame === null) return null;

        const timestamp = this.timeOrigin + frame.index * this.msPerFrame;

        return {
            ...frame,
            timestamp,
        };
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        this.child.stdout.on("data", (chunk: Buffer) => {
            this.decoder.ondata(chunk);
        });

        this.stream = this.broadcast.subscribe();
        this.stream.pipe(this.child.stdin);

        this.stream.once("data", () => {
            this.timeOrigin = Date.now();
        });

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
