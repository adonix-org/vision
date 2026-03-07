import { Broadcast } from "../sources/broadcast";
import { Viewer } from "./viewer";

export class FfplayViewer extends Viewer {
    constructor(
        broadcast: Broadcast,
        private readonly title: string = "Publisher",
    ) {
        super(broadcast);
    }

    protected override executable(): string {
        return "/opt/homebrew/bin/ffplay";
    }

    protected override args(): string[] {
        const args = [
            "-loglevel",
            "quiet",
            "-fflags",
            "nobuffer",
            "-flags",
            "low_delay",
            "-analyzeduration",
            "0",
            "-vf",
            "setpts=0",
            "-sync",
            "video",
            "-framedrop",
            "-f",
            "mpegts",
            "-i",
            "pipe:0",
            "-autoexit",
            "-window_title",
            this.title,
        ];

        return args;
    }

    public override toString(): string {
        return `${super.toString()}[ffplay]`;
    }
}
