import { Broadcast } from "../../sources/broadcast";
import { Viewer } from "./viewer";

export class MpvViewer extends Viewer {
    constructor(
        broadcast: Broadcast,
        private readonly title: string = "Publisher",
    ) {
        super(broadcast);
    }

    protected override executable(): string {
        return "/opt/homebrew/bin/mpv";
    }

    protected override args(): string[] {
        const args = [
            "--cache=no",
            "--osc=no",
            "--input-terminal=no",
            "--no-input-default-bindings",
            `--title=${this.title}`,
            "-",
        ];
        return args;
    }

    public override toString(): string {
        return `${super.toString()}[mpv]`;
    }
}
