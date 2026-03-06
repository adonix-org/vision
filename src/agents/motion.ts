import { C121 } from "../sources/c121";
import { Agent } from "./agent";
import { Remote } from "../tasks/remote/remote";
import { PyServer } from "../spawn/pyserver";
import { ViewerTask } from "../tasks/observe/viewer";
import { Label } from "../tasks/draw/label";
import { Trail } from "../tasks/draw/trail";
import { Watermark } from "../tasks/draw/watermark";
import { Drawing } from "../tasks/draw";
import { Ignore } from "../tasks/filter/ignore";

export class Motion extends Agent {
    constructor() {
        const camera = new C121(6);
        const viewer = new ViewerTask("LiveMotion");

        super(camera);

        this.register(new PyServer());
        this.register(viewer);

        const drawing = new Drawing(
            new Label("yellow", 36, "red"),
            new Trail("yellow"),
            new Watermark("LiveMotion"),
        );

        this.addTask(new Remote("mega"));
        this.addTask(new Ignore(1740, 562, 20));
        this.addTask(drawing);
        this.addTask(viewer);
    }

    public override toString(): string {
        return `${super.toString()}[Motion]`;
    }
}
