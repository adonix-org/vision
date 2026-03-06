import { C121 } from "../sources/c121";
import { Agent } from "./agent";
import { Remote } from "../tasks/remote/remote";
import { PyServer } from "../spawn/pyserver";
import { ViewerTask } from "../tasks/observe/viewer";
import { Label } from "../tasks/transform/label";
import { Trail } from "../tasks/transform/trail";
import { Watermark } from "../tasks/transform/watermark";
import { Transform } from "../tasks/transform";
import { Timer } from "../tasks/observe/timer";

export class Motion extends Agent {
    constructor() {
        const camera = new C121(6);
        const viewer = new ViewerTask("LiveMotion");

        super(camera);

        this.register(new PyServer());
        this.register(viewer);

        this.addTask(new Remote("mega"));

        const transform = new Transform();
        transform.add(new Label());
        transform.add(new Trail());
        transform.add(new Watermark("LiveImage"));

        this.addTask(new Timer(transform, 10_000));
        this.addTask(viewer);
    }

    public override toString(): string {
        return `${super.toString()}[Motion]`;
    }
}
