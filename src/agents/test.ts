import { Agent } from "./agent";
import { Broadcast } from "../sources/broadcast";
import { StreamDecoder } from "../sources/decoders/stream";
import { LiveDecoder } from "../sources/decoders/live";
import { EncoderTask } from "../tasks/transfer/encoder";
import { ImageViewer } from "../tasks/observe/image";
import { FfplayViewer } from "../targets/ffplay";
import { MpvViewer } from "../targets/mpv";

export class EncoderTest extends Agent {
    constructor(broadcast: Broadcast, fps: number) {
        const decoder = new StreamDecoder(broadcast, new LiveDecoder(15), fps);
        const encoder = new EncoderTask(fps);

        const viewerA = new MpvViewer(encoder, "Encoder");
        const viewerB = new FfplayViewer(broadcast, "Broadcast");
        const viewerC = new ImageViewer();

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
