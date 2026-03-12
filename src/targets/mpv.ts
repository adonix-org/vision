import { Broadcast } from "../sources/streams/broadcast";
import { Viewer } from "./viewer";

export class MpvViewer extends Viewer {
    constructor(
        broadcast: Broadcast,
        private readonly title: string = "Publisher",
    ) {
        super(broadcast);
    }

    protected override executable(): string {
        return "mpv";
    }

    protected override args(): string[] {
        const args: string[] = [];

        args.push("--cache=no");
        args.push("--osc=no");
        args.push("--input-terminal=no");
        args.push("--no-input-default-bindings");
        args.push("--mute");
        args.push(`--title=${this.title}`);
        args.push("-");

        return args;
    }

    public override toString(): string {
        return `${super.toString()}[mpv]`;
    }
}
