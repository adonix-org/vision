import { SaveImage } from "../tasks/transfer/save";
import { Workflow } from "./workflow";
import { RequiredFilter } from "../tasks/filter/requried";
import { Remote } from "../tasks/remote/remote";
import { Watermark } from "../tasks/transform/watermark";
import { ConfidenceFilter } from "../tasks/filter/confidence";
import { CategoryPath } from "../file/category";

export class ExportSubject extends Workflow {
    constructor(
        folder: string,
        private readonly label: string,
        threshold: number = 0,
    ) {
        super();

        const target = new CategoryPath(folder, label, label);

        this.addTask(new ConfidenceFilter(threshold, label));
        this.addTask(new RequiredFilter(label));
        this.addTask(new Watermark("ActiveImage"));
        this.addTask(new Remote("outline"));
        this.addTask(new Remote("label"));
        this.addTask(new SaveImage(target));
    }

    public override toString(): string {
        return `${super.toString()}[ExportSubject-${this.label}]`;
    }
}
