import { LogLevel } from "./Logger";
import { LogMessage } from "./LogMessage";

export abstract class Provider {
  constructor(protected logLevel: LogLevel) {}

  public abstract log(message: LogMessage): void;

  public shouldLog(level: LogLevel): boolean {
    return this.logLevel >= level;
  }
}
