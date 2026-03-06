import { AgentSource } from "../agents";
import { Lifecycle } from "../lifecycle";
import { StreamDecoder } from "./decoders/stream";
import { MpvViewer } from "../targets/viewers/mpv";
import { ImageFrame } from "../tasks";
import { Rtsp } from "./rtsp";
import { LiveDecoder } from "./decoders/live";

const C121_RTSP_URL = process.env.C121_RTSP_URL!;

export class C121 extends Lifecycle implements AgentSource {
    private readonly camera = new Rtsp(C121_RTSP_URL);
    private readonly viewer = new MpvViewer(this.camera, "C121 - Front Yard");
    private readonly decoder = new StreamDecoder(
        this.camera,
        new LiveDecoder(15),
        this.fps,
    );

    constructor(private readonly fps: number) {
        super();

        this.register(this.camera);
        this.camera.register(this.viewer);
        this.camera.register(this.decoder);
    }

    public async next(): Promise<ImageFrame | null> {
        return await this.decoder.next();
    }

    public getName(): string {
        return "c121";
    }

    protected getUrl(): string {
        return C121_RTSP_URL;
    }

    public override toString(): string {
        return `${super.toString()}[C121]`;
    }
}
