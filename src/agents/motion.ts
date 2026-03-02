import { C121 } from "../sources/c121";
import { Agent } from "./agent";
import { Remote } from "../tasks/remote/remote";
import { ConfidenceFilter } from "../tasks/filter/confidence";
import { PyServer } from "../spawn/pyserver";

export class Motion extends Agent {
    constructor() {
        const source = new C121(5);

        super(source, new PyServer());

        this.addTask(new Remote("yolo"));
        this.addTask(new Remote("passthrough"));
        this.addTask(new ConfidenceFilter(0.4));
        this.addTask(new Remote("outline"));
        this.addTask(new Remote("label"));
    }

    public override toString(): string {
        return `${super.toString()}[Motion]`;
    }
}
