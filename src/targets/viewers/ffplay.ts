import { Broadcast } from "../../sources/broadcast";
import { ImageTask } from "../../tasks";
import { Viewer } from "./viewer";

type DataFormat = "mjpeg" | "mpegts";

export class FfplayViewer extends Viewer implements ImageTask {
    constructor(
        broadcast: Broadcast,
        private readonly format: DataFormat,
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
            "-f",
            this.format,
            "-i",
            "pipe:0",
            "-window_title",
            this.title,
        ];
        return args;
    }

    public override toString(): string {
        return `${super.toString()}[ffplay]`;
    }
}
