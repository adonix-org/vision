import { Rtsp } from "./rtsp";

export class Camera extends Rtsp {
    private readonly _name: string;

    constructor(name: string, url: string) {
        super(url);

        this._name = name;
    }

    public get name(): string {
        return this._name;
    }
}
