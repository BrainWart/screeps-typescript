import { LogMessage } from "./LogMessage";
import { Provider } from "./Provider";

export class ConsoleProvider extends Provider {
  public log(message: LogMessage): void {
    console.log(`[${message.level}] [${message.scope}] : ${message.message}`);
  }
}
