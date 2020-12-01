import { LogLevel } from "./logging/Logger";
import { LogMessage } from "./logging/LogMessage";
import { Provider } from "./logging/Provider";

export class ScreepsNotifyProvider extends Provider {
  constructor(level: LogLevel = LogLevel.Alert, private groupInterval: number = 0) {
    super(level);
  }

  public log(message: LogMessage): void {
    Game.notify(`[${message.level}] [${message.scope}] : ${message.message}`, this.groupInterval);
  }
}
