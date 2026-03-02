import "dotenv/config";
import "./logging";

import { application } from "./application";
import { MonitorLive } from "./agents/monitor";

application.register(new MonitorLive()).start();
