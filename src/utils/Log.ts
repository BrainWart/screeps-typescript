import { FancyScreepsConsoleProvider } from "./FancyScreepsConsoleProvider";
import { Logger, LogLevel } from "./logging/Logger";
import { ScreepsNotifyProvider } from "./ScreepsNotifyProvider";

export const logger = new Logger(
  "MAIN",
  [new FancyScreepsConsoleProvider(LogLevel.Info), new ScreepsNotifyProvider()],
  { shard: Game.shard.name }
);
