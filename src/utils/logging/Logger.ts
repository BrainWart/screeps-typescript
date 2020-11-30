import { EnumDictionary } from "utils/Utility";
/*
{
  emerg: 0,
  alert: 1,
  crit: 2,
  error: 3,
  warning: 4,
  notice: 5,
  info: 6,
  debug: 7
}
*/

export enum LogLevel {
  Emerg,
  Alert,
  Crit,
  Error,
  Warning,
  Notice,
  Info,
  Debug,
  Trace,
}

interface LogLevelInfo {
  color: string;
  prefix: string;
}

const info: EnumDictionary<LogLevel, LogLevelInfo> = {
  [LogLevel.Emerg]:   { color: "red",    prefix: "emerg" },
  [LogLevel.Alert]:   { color: "red",    prefix: "alert" },
  [LogLevel.Crit]:    { color: "red",    prefix: "crit" },
  [LogLevel.Error]:   { color: "red",    prefix: "error" },
  [LogLevel.Warning]: { color: "yellow", prefix: "warn" },
  [LogLevel.Notice]:  { color: "white",  prefix: "notic" },
  [LogLevel.Info]:    { color: "white",  prefix: "info" },
  [LogLevel.Debug]:   { color: "grey",   prefix: "debug" },
  [LogLevel.Trace]:   { color: "grey",   prefix: "trace" },
};

export class Logger {
  public static defaultLogLevel: LogLevel = LogLevel.Notice;

  private logLevel: LogLevel;

  constructor(private module: string, logLevel?: LogLevel) {
    this.logLevel = logLevel ?? Logger.defaultLogLevel;
  }

  public log(message: string, level?: LogLevel): void {
    if (level == null) {
      level = LogLevel.Info;
    }

    if (level <= this.logLevel) {
      console.log(
        `<span style="color: ${info[level].color};">${info[level].prefix} [${this.module}] : ${message}</span>`
      );
    }
  }

  public prepend(message: string): Logger {
    return new Logger(`${this.module}.${message}`);
  }
}
