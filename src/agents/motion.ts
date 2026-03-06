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
import { Throttle } from "../tasks/filter/throttle";
import { Record } from "../tasks/observe/record";
import { PreRoll } from "../targets/preroll";

export class Motion extends Agent {
    constructor() {
        const camera = new C121(1);
        const viewer = new ViewerTask("LiveMotion");
        const preroll = new PreRoll(camera, 3, 256);
        const filepath = process.env.LOCAL_IMAGE_FOLDER!;

        super(camera);
        camera.register(preroll);

        this.register(new PyServer());
        this.register(viewer);

        const drawing = new Drawing(
            new Label("yellow", 36, "red"),
            new Trail(),
            new Watermark("LiveMotion"),
        );

        this.addTask(new Throttle(1));
        this.addTask(new Remote("mega"));
        this.addTask(new Ignore(1740, 562, 20));
        this.addTask(drawing);
        this.addTask(viewer);

        this.addTask(new Record(preroll, filepath, 3, "vehicle"));
    }

    public override toString(): string {
        return `${super.toString()}[Motion]`;
    }
}
