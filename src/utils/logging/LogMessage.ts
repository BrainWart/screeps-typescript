import { LogLevel } from "./Logger";

export interface LogMessage {
  level: LogLevel;
  message: string;
  scope: string;
  [key: string]: any;
}
