import { FancyScreepsConsoleProvider } from "./FancyScreepsConsoleProvider";
import { Logger } from "./logging/Logger";
import { ScreepsNotifyProvider } from "./ScreepsNotifyProvider";

export const logger = new Logger("MAIN", [ new FancyScreepsConsoleProvider(), new ScreepsNotifyProvider() ], { shard: Game.shard.name });
