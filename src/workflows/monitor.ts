import { Remote } from "../tasks/remote/remote";
import { ConfidenceFilter } from "../tasks/filter/confidence";
import { Workflow } from "./workflow";
import { Throttle } from "../tasks/filter/throttle";
import { ExportSubject } from "./export";

export class Monitor extends Workflow {
    constructor() {
        super();

        const folder = process.env.LOCAL_IMAGE_FOLDER!;

        const animal = new ExportSubject(folder, "animal", 0.75);
        const person = new ExportSubject(folder, "person", 0.55);
        const vehicle = new ExportSubject(folder, "vehicle", 0.667);

        this.register(animal);
        this.register(person);
        this.register(vehicle);

        this.addTask(new Throttle(1));
        this.addTask(new Remote("mega"));
        this.addTask(new ConfidenceFilter(0.4));
        this.addTask(animal);
        this.addTask(person);
        this.addTask(vehicle);
    }

    public override toString(): string {
        return `${super.toString()}[Monitor]`;
    }
}
