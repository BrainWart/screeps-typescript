import { EnumDictionary } from "utils/Utility";

export enum LogLevel {
  Trace = 0,
  Info = 1,
  Warn = 2,
  Error = 3
}

interface LogLevelInfo {
  color: string;
  prefix: string;
}

const info: EnumDictionary<LogLevel, LogLevelInfo> = {
  [LogLevel.Error]: { color: "red", prefix: "#" },
  [LogLevel.Warn]: { color: "yellow", prefix: "=" },
  [LogLevel.Info]: { color: "white", prefix: "-" },
  [LogLevel.Trace]: { color: "grey", prefix: " " }
};

export class Logger {
  public static level: LogLevel = LogLevel.Info;

  private _level: LogLevel;
  private _className: string;

  constructor(className: string, level?: LogLevel) {
    if (level == null) {
      this._level = Logger.level;
    } else {
      this._level = level;
    }

    this._className = className;
  }

  public log(message: string, level?: LogLevel): void {
    if (level == null) {
      level = LogLevel.Info;
    }

    if (level >= this._level) {
      console.log(
        `<span style="color: ${info[level].color};">${info[level].prefix} [${this._className}] : ${message}</span>`
      );
    }
  }

  public logTrace(message: string): void {
    this.log(message, LogLevel.Trace);
  }

  public logWarning(message: string): void {
    this.log(message, LogLevel.Warn);
  }

  public logError(message: string): void {
    this.log(message, LogLevel.Error);
  }

  public prepend(message: string): Logger {
    return new Logger(`${this._className}.${message}`, this._level);
  }
}
