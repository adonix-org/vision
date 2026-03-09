import { Agent } from "./agent";
import { Broadcast } from "../sources/broadcast";
import { StreamDecoder } from "../sources/decoders/stream";
import { EncoderTask } from "../tasks/transfer/encoder";
import { ViewerTask } from "../tasks/observe/viewer";
import { FfplayViewer } from "../targets/ffplay";
import { MpvViewer } from "../targets/mpv";

export class EncoderTest extends Agent {
    constructor(broadcast: Broadcast, fps: number) {
        const decoder = new StreamDecoder(broadcast, fps);
        const encoder = new EncoderTask(fps);

        const viewerA = new MpvViewer(encoder, "Encoder");
        const viewerB = new FfplayViewer(broadcast, "Broadcast");
        const viewerC = new ViewerTask();

        super(decoder);
        this.register(viewerA);
        this.register(viewerB);
        this.register(viewerC);
        this.register(encoder);

        this.addTask(encoder);
        this.addTask(viewerC);
    }

    public override toString(): string {
        return `${super.toString()}[EncoderTest]`;
    }
}
