import { C121 } from "../sources/c121";
import { Agent } from "./agent";
import { Remote } from "../tasks/remote/remote";
import { ConfidenceFilter } from "../tasks/filter/confidence";
import { Timer } from "../tasks/observe/timer";

export class Motion extends Agent {
    constructor() {
        const source = new C121();

        super(source);

        this.addTask(new Timer(new Remote("yolo"), 60_000));
        this.addTask(new Timer(new Remote("passthrough")));
        this.addTask(new ConfidenceFilter(0.4));
        this.addTask(new Remote("outline"));
        this.addTask(new Remote("label"));
    }

    public override toString(): string {
        return `${super.toString()}[Motion]`;
    }
}
