import { Ffmpeg } from "../spawn/ffmpeg";

export class FileSource extends Ffmpeg {
    constructor(
        private readonly file: string,
        private readonly fps: number = 15,
    ) {
        super();
    }

    protected override async args(): Promise<string[]> {
        const args = [
            "-loglevel",
            "fatal",
            "-i",
            this.file,
            "-vf",
            `fps=${this.fps}`,
            "-f",
            "image2pipe",
            "-vcodec",
            "mjpeg",
            "pipe:1",
        ];
        return args;
    }

    public override toString(): string {
        return `${super.toString()}[File]`;
    }
}
