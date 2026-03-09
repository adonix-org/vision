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
        const args: string[] = [];

        args.push("-loglevel", "quiet");
        args.push("-fflags", "nobuffer");
        args.push("-flags", "low_delay");
        args.push("-analyzeduration", "0");
        args.push("-vf", "setpts=0");
        args.push("-sync", "video");
        args.push("-framedrop");
        args.push("-f", "mpegts");
        args.push("-i", "pipe:0");
        args.push("-autoexit");
        args.push("-window_title", this.title);

        return args;
    }

    public override toString(): string {
        return `${super.toString()}[ffplay]`;
    }
}
