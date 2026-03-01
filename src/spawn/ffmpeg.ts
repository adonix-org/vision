import { Executable } from "./executable";

export abstract class Ffmpeg extends Executable {
    constructor() {
        super("/opt/homebrew/bin/ffmpeg");
    }

    public override toString(): string {
        return `${super.toString()}[ffmpeg]`;
    }
}
