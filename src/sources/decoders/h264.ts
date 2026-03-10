const NAL_START_CODE_4 = Buffer.from([0x00, 0x00, 0x00, 0x01]);
const NAL_TYPE_IDR = 5;

export function indexOfKeyFrame(h264: Buffer): number {
    let offset = 0;

    while (true) {
        const start = h264.indexOf(NAL_START_CODE_4, offset);
        if (start === -1) return -1;

        const headerIdx = start + NAL_START_CODE_4.length;
        if (headerIdx >= h264.length) return -1;

        if ((h264[headerIdx]! & 0x1f) === NAL_TYPE_IDR) return start;

        offset = start + NAL_START_CODE_4.length;
    }
}
