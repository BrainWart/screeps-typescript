import { FancyScreepsConsoleProvider } from "./FancyScreepsConsoleProvider";
import { Logger, LogLevel } from "./logging/Logger";
import { ScreepsNotifyProvider } from "./ScreepsNotifyProvider";

export const logger = new Logger(
  "MAIN",
  [new FancyScreepsConsoleProvider(LogLevel.Trace), new ScreepsNotifyProvider()],
  { shard: Game.shard.name }
);
