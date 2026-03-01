import { ImageSource } from ".";
import { ImageFrame } from "../tasks";
import { Ffmpeg } from "../spawn/ffmpeg";
import { ImageStream } from "./streams/image";

export class Encoder extends Ffmpeg implements ImageSource {
    constructor(
        private readonly stream: ImageStream,
        private readonly fps: number = 15,
    ) {
        super();

        this.register(stream);
    }

    protected override args(): string[] {
        const args = [
            "-loglevel",
            "fatal",
            "-i",
            "pipe:0",
            "-vf",
            `fps=${this.fps}`,
            "-f",
            "image2pipe",
            "-vcodec",
            this.stream.vcodec,
            "pipe:1",
        ];
        return args;
    }

    public ondata(data: Buffer): Promise<void> | void {
        this.child.stdin.write(data);
    }

    public async next(): Promise<ImageFrame | null> {
        return this.stream.next();
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        this.stream.clear();

        this.child.stdout.on("data", (data) => {
            this.stream.ondata(data);
        });
    }

    public override toString(): string {
        return `${super.toString()}[Encoder]`;
    }
}
