import { LogLevel } from "./logging/Logger";
import { LogMessage } from "./logging/LogMessage";
import { Provider } from "./logging/Provider";

interface LogLevelInfo { color: string; prefix: string; }

// Colors were chosen to work with https://github.com/screepers/screeps-multimeter
const info: { [K in LogLevel]: LogLevelInfo } = {
  [LogLevel.Emerg]:   { color: "red",    prefix: "e" },
  [LogLevel.Alert]:   { color: "red",    prefix: "a" },
  [LogLevel.Crit]:    { color: "red",    prefix: "c" },
  [LogLevel.Error]:   { color: "red",    prefix: "e" },
  [LogLevel.Warning]: { color: "yellow", prefix: "w" },
  [LogLevel.Notice]:  { color: "white",  prefix: "n" },
  [LogLevel.Info]:    { color: "white",  prefix: "i" },
  [LogLevel.Debug]:   { color: "grey",   prefix: "d" },
  [LogLevel.Trace]:   { color: "grey",   prefix: "t" },
};

/*
  Makes rooms and ids clickable where possible
*/
export class FancyScreepsConsoleProvider extends Provider {
  constructor(level: LogLevel = LogLevel.Trace) { super(level); }

  public log(message: LogMessage): void {
    let finalMessage = `<span style="color: ${info[message.level].color};">${info[message.level].prefix} [${message.scope}] : ${message.message}</span>`;

    // Possibly do stuff with the memory viewer
    // angular.element($('.memory>.ng-scope')).scope().MemoryMain
    //  - addWatch: ƒ (e)   -- Doesn't seem to add a watch if it already exists.
    //  - newWatchPath: ""  -- The value of the new watch user text input
    //  - orderBy: ƒ (e)
    //  - removeWatch: ƒ (e)
    //  - selectedObjectWatch: null     -- When set to a memory path that is watched, it will highlight the watch
    //  - submitNewWatch: ƒ ()  -- add a watch from `newWatchPath`
    //  - watches: [{…}]  -- list of paths being watched

    if ("shard" in message) {
      if ("tick" in message) {
        finalMessage = finalMessage.replace(/[EW]\d{1,2}[NS]\d{1,2}/g, (s) => `<span style="text-decoration:underline;cursor:pointer;" onclick="location.assign('/a/#!/history/${message.shard}/${s}?t=${message.tick}');">${s}</span>`);
      } else {
        finalMessage = finalMessage.replace(/[EW]\d{1,2}[NS]\d{1,2}/g, (s) => `<span style="text-decoration:underline;cursor:pointer;" onclick="location.assign('/a/#!/room/${message.shard}/${s}');">${s}</span>`);
      }
    }

    if ("room" in message && "shard" in message) {
      if ("tick" in message) {
        finalMessage = finalMessage.replace(/[a-zA-Z0-9]{24}/g, (s) => `<span style="text-decoration:underline;cursor:pointer;" onclick="location.assign('/a/#!/history/${message.shard}/${message.room}?t=${message.tick}');angular.element('body').injector().get('RoomViewPendingSelector').set('${s}');">${s}</span>`);
      } else {
        finalMessage = finalMessage.replace(/[a-zA-Z0-9]{24}/g, (s) => `<span style="text-decoration:underline;cursor:pointer;" onclick="location.assign('/a/#!/room/${message.shard}/${message.room}');angular.element('.game-field-container').scope().Room.selectObjectPending('${s}');">${s}</span>`);
      }
    }

    console.log(finalMessage);
  }
}
