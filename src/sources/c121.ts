import { ImageSource } from ".";
import { Lifecycle } from "../lifecycle";
import { MJpeg } from "../targets/mjpeg";
import { MpvViewer } from "../targets/viewers/mpv";
import { ImageFrame } from "../tasks";
import { Rtsp } from "./rtsp";
import { CameraStream } from "./streams/camera";

const C121_RTSP_URL = process.env.C121_RTSP_URL!;

export class C121 extends Lifecycle implements ImageSource {
    private readonly rtsp: Rtsp = new Rtsp(C121_RTSP_URL);
    private readonly mpv: MpvViewer = new MpvViewer(this.rtsp);
    private readonly mjpeg: MJpeg = new MJpeg(this.rtsp, new CameraStream(), 1);

    constructor() {
        super();

        this.register(this.rtsp);
        this.register(this.mpv);
        this.register(this.mjpeg);
    }

    public async next(): Promise<ImageFrame | null> {
        return await this.mjpeg.next();
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
