import { C121 } from "../sources/c121";
import { Agent } from "./agent";
import { Remote } from "../tasks/remote/remote";
import { PyServer } from "../spawn/pyserver";
import { ViewerTask } from "../tasks/observe/viewer";
import { Label } from "../tasks/transform/label";
import { Trail } from "../tasks/transform/trail";
import { Watermark } from "../tasks/transform/watermark";
import { SimpleWatermark } from "../tasks/transform/watermark2";

export class Motion extends Agent {
    constructor() {
        const source = new C121(6);
        const viewer = new ViewerTask("LiveMotion!");
        super(source);

        this.register(new PyServer());
        this.register(viewer);

        this.addTask(new Remote("mega"));
        this.addTask(new Label("yellow", 36));
        this.addTask(new Trail("orange"));
        this.addTask(new Watermark("LiveImage", 80, "northwest"));
        this.addTask(new SimpleWatermark("LiveImage", 512));
        this.addTask(viewer);
    }

    public override toString(): string {
        return `${super.toString()}[Motion]`;
    }
}
