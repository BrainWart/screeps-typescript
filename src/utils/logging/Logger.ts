import { ConsoleProvider } from "./ConsoleProvider";
import { LogMessage } from "./LogMessage";
import { Provider } from "./Provider";

export enum LogLevel {
  Emerg,
  Alert,
  Crit,
  Error,
  Warning,
  Notice,
  Info,
  Debug,
  Trace
}

const defaultProviders: Provider[] = [new ConsoleProvider(LogLevel.Notice)];

type Loggable = string | ({ [key: string]: any } & Pick<LogMessage, "message">);

export class Logger {
  public data: { [key: string]: any };
  private providers: Provider[];

  constructor(private scope: string, providers?: Provider[], data?: { [key: string]: any }) {
    this.providers = providers ?? [...defaultProviders];
    this.data = data ?? {};
  }

  public log(message: Loggable, level: LogLevel): void {
    const builtMessage: LogMessage = {
      ...this.data,
      ...(typeof message === "string" ? { message } : message),
      ...{ level, scope: this.scope }
    };

    for (const provider of this.providers) {
      if (provider.shouldLog(level)) {
        provider.log(builtMessage);
      }
    }
  }

  public logEmerg(message: Loggable): void {
    this.log(message, LogLevel.Emerg);
  }
  public logAlert(message: Loggable): void {
    this.log(message, LogLevel.Alert);
  }
  public logCrit(message: Loggable): void {
    this.log(message, LogLevel.Crit);
  }
  public logError(message: Loggable): void {
    this.log(message, LogLevel.Error);
  }
  public logWarning(message: Loggable): void {
    this.log(message, LogLevel.Warning);
  }
  public logNotice(message: Loggable): void {
    this.log(message, LogLevel.Notice);
  }
  public logInfo(message: Loggable): void {
    this.log(message, LogLevel.Info);
  }
  public logDebug(message: Loggable): void {
    this.log(message, LogLevel.Debug);
  }
  public logTrace(message: Loggable): void {
    this.log(message, LogLevel.Trace);
  }

  public scoped(scope: string, data: { [key: string]: any } = {}): Logger {
    return new Logger(`${this.scope}.${scope}`, this.providers, { ...this.data, ...data });
  }

  public withData(data: { [key: string]: any }) : Logger {
    return new Logger(this.scope, this.providers, { ...this.data, ...data });
  }
}
