import { StreamMarker } from "./marker";

export class H264KeyFrame implements StreamMarker {
    private static readonly START_CODE = Buffer.from([0x00, 0x00, 0x00, 0x01]);

    private static readonly NAL_TYPE_IDR = 5;

    public find(h264: Buffer): number {
        let offset = 0;

        while (true) {
            const start = h264.indexOf(H264KeyFrame.START_CODE, offset);
            if (start === -1) return -1;

            const headerIdx = start + H264KeyFrame.START_CODE.length;
            if (headerIdx >= h264.length) return -1;

            if ((h264[headerIdx]! & 0x1f) === H264KeyFrame.NAL_TYPE_IDR)
                return start;

            offset = start + H264KeyFrame.START_CODE.length;
        }
    }

    public get size(): number {
        return H264KeyFrame.START_CODE.length;
    }

    public toString(): string {
        return `[H264KeyFrame]`;
    }
}
