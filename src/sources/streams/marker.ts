export interface StreamMarker {
    find(buffer: Buffer): number;
    size: number;
}
