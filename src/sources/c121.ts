import { AgentSource } from "../agents";
import { Lifecycle } from "../lifecycle";
import { MJpeg } from "../targets/mjpeg";
import { FfplayViewer } from "../targets/viewers/ffplay";
import { Viewer } from "../targets/viewers/viewer";
import { ImageFrame } from "../tasks";
import { Rtsp } from "./rtsp";
import { LiveStream } from "./streams/live";

const C121_RTSP_URL = process.env.C121_RTSP_URL!;

export class C121 extends Lifecycle implements AgentSource {
    private readonly camera: Rtsp = new Rtsp(C121_RTSP_URL);
    private readonly viewer: Viewer = new FfplayViewer(this.camera, "mpegts");
    private readonly source: AgentSource = new MJpeg(
        this.camera,
        new LiveStream(1),
        1,
    );

    constructor() {
        super();

        this.register(this.camera);
        this.register(this.viewer);
        this.register(this.source);
    }

    public async next(): Promise<ImageFrame | null> {
        return await this.source.next();
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
