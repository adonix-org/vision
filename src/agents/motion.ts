import { C121 } from "../sources/c121";
import { Agent } from "./agent";
import { Remote } from "../tasks/remote/remote";
import { PyServer } from "../spawn/pyserver";
import { ViewerTask } from "../tasks/observe/viewer";
import { Label } from "../tasks/draw/label";
import { Trail } from "../tasks/draw/trail";
import { Watermark } from "../tasks/draw/watermark";
import { Drawing } from "../tasks/draw";
import { Throttle } from "../tasks/filter/throttle";
import { Record } from "../tasks/observe/record";
import { PreRoll } from "../targets/preroll";
import { CenterPointFilter } from "../tasks/filter/centerpoint";
import { ConfidenceFilter } from "../tasks/filter/confidence";

export class Motion extends Agent {
    constructor() {
        const camera = new C121(1);
        const viewer = new ViewerTask("LiveMotion");
        const preroll = new PreRoll(camera, 4, 256);
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
        this.addTask(new ConfidenceFilter(0.4));
        this.addTask(new CenterPointFilter(1740, 562, 20));
        this.addTask(drawing);
        this.addTask(viewer);

        this.addTask(new Record(preroll, filepath, 5, "person"));
        this.addTask(new Record(preroll, filepath, 10, "animal"));
    }

    public override toString(): string {
        return `${super.toString()}[Motion]`;
    }
}
