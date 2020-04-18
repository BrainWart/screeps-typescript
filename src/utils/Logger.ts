import { EnumDictionary } from "utils/Utility";

export enum LogLevel {
  /** Use for verbose non-critical warnings */
  Trace2,
  /** Use for verbose information */
  Trace1,
  /** Use for information */
  Info,
  /** Use for warnings */
  Warn,
  /** Use for errors */
  Error
}

interface LogLevelInfo {
  color: string;
  prefix: string;
}

const info: EnumDictionary<LogLevel, LogLevelInfo> = {
  [LogLevel.Error]: { color: "red", prefix: "#" },
  [LogLevel.Warn]: { color: "yellow", prefix: "=" },
  [LogLevel.Info]: { color: "white", prefix: "-" },
  [LogLevel.Trace1]: { color: "grey", prefix: "1" },
  [LogLevel.Trace2]: { color: "grey", prefix: "2" }
};

export class Logger {
  public static level: LogLevel = LogLevel.Trace1;

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

  public logTrace2(message: string): void {
    this.log(message, LogLevel.Trace2);
  }

  public logTrace1(message: string): void {
    this.log(message, LogLevel.Trace1);
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
