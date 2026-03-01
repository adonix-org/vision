import { Executable } from "./executable";

export abstract class Ffplay extends Executable {
    constructor() {
        super("/opt/homebrew/bin/ffplay");
    }

    public override toString(): string {
        return `${super.toString()}[ffplay]`;
    }
}
