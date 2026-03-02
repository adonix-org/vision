import { Publish } from "../tasks/transfer/publish";
import { MaxSize } from "../tasks/filter/maxsize";
import { Throttle } from "../tasks/filter/throttle";
import { Workflow } from "./workflow";
import { Watermark } from "../tasks/transform/watermark";
import { Enhance } from "../tasks/transform/enhance";

export class LiveImage extends Workflow {
    constructor(name: string) {
        super();

        this.addTask(new Throttle(0.2));
        this.addTask(new MaxSize());
        this.addTask(new Enhance());
        this.addTask(new Watermark("LiveImage"));
        this.addTask(new Publish(name));
    }

    public override toString(): string {
        return `${super.toString()}[LiveImage]`;
    }
}
