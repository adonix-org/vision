import { SaveImage } from "../tasks/transfer/save";
import { Workflow } from "./workflow";
import { Required } from "../tasks/filter/requried";
import { Watermark } from "../tasks/draw/watermark";
import { ConfidenceFilter } from "../tasks/filter/confidence";
import { CategoryPath } from "../paths/category";
import { Label } from "../tasks/draw/label";
import { Drawing } from "../tasks/draw";

export class ExportSubject extends Workflow {
    constructor(
        folder: string,
        private readonly label: string,
        threshold: number = 0,
    ) {
        super();

        const target = new CategoryPath(folder, label, label);

        const drawing = new Drawing(new Label(), new Watermark("ActiveImage"));

        this.addTask(new ConfidenceFilter(threshold, label));
        this.addTask(new Required(label));
        this.addTask(drawing);
        this.addTask(new SaveImage(target));
    }

    public override toString(): string {
        return `${super.toString()}[ExportSubject-${this.label}]`;
    }
}
