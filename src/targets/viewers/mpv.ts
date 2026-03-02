import { ImageTask } from "../../tasks";
import { StreamProvider } from "../../sources/rtsp";
import { Viewer } from "./viewer";

export class MpvViewer extends Viewer implements ImageTask {
    constructor(
        provider: StreamProvider,
        private readonly title: string = "Publisher",
    ) {
        super(provider);
    }

    protected override executable(): string {
        return "/opt/homebrew/bin/mpv";
    }

    protected override args(): string[] {
        const args = ["--cache=no", `--title=${this.title}`, "-"];
        return args;
    }

    public override toString(): string {
        return `${super.toString()}[mpv]`;
    }
}
