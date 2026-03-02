import "dotenv/config";
import "./logging";

import { application } from "./application";
import { Motion } from "./agents/motion";
import { PyServer } from "./spawn/pyserver";

application.register(new PyServer(), new Motion()).start();
