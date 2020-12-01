import { LogLevel } from "./logging/Logger";
import { LogMessage } from "./logging/LogMessage";
import { Provider } from "./logging/Provider";

interface LogLevelInfo {
  color: string;
  prefix: string;
}

// Colors were chosen to work with https://github.com/screepers/screeps-multimeter
const info: Record<LogLevel, LogLevelInfo> = {
  [LogLevel.Emerg]: { color: "red", prefix: "e" },
  [LogLevel.Alert]: { color: "red", prefix: "a" },
  [LogLevel.Crit]: { color: "red", prefix: "c" },
  [LogLevel.Error]: { color: "red", prefix: "e" },
  [LogLevel.Warning]: { color: "yellow", prefix: "w" },
  [LogLevel.Notice]: { color: "white", prefix: "n" },
  [LogLevel.Info]: { color: "white", prefix: "i" },
  [LogLevel.Debug]: { color: "grey", prefix: "d" },
  [LogLevel.Trace]: { color: "grey", prefix: "t" }
};

/*
  Makes rooms and ids clickable where possible
*/
export class FancyScreepsConsoleProvider extends Provider {
  constructor(level: LogLevel = LogLevel.Debug) {
    super(level);
  }

  public log(message: LogMessage): void {
    let finalMessage = `<span style="color: ${info[message.level].color};">${info[message.level].prefix} [${
      message.scope
    }] : ${message.message}</span>`;

    // Possibly do stuff with the memory viewer
    // angular.element($('.memory').children('.ng-scope')).scope().MemoryMain
    //  - addWatch: ƒ (e)   -- Doesn't seem to add a watch if it already exists.
    //  - newWatchPath: ""  -- The value of the new watch user text input
    //  - orderBy: ƒ (e)
    //  - removeWatch: ƒ (e)
    //  - selectedObjectWatch: null     -- When set to a memory path that is watched, it will highlight the watch
    //  - submitNewWatch: ƒ ()  -- add a watch from `newWatchPath`
    //  - watches: [{…}]  -- list of paths being watched
    finalMessage = finalMessage.replace(
      /\{\{([\w\. ]+)\}\(([\w\. \[\]\{\}]+)\)\}|([EW]\d{1,2}[NS]\d{1,2})|([a-zA-Z0-9]{24})/g,
      (fullMatch, memoryPath, memoryText, roomName, objectId, matchPosition, fullString) => {
        if (memoryPath && memoryText) {
          const onclick =
            `angular.element($('.editor-panel')).scope().EditorPanel.activeTab = 'memory';` +
            `angular.element($('.memory').children('.ng-scope')).scope().MemoryMain.addWatch('${memoryPath}');` +
            `angular.element($('.memory').children('.ng-scope')).scope().MemoryMain.selectedObjectWatch = '${memoryPath}';`;
          return `<span style="text-decoration:underline;cursor:pointer;" onclick="${onclick}">${memoryText}</span>`;
        } else if (roomName) {
          if ("shard" in message) {
            if ("tick" in message) {
              return `<span style="text-decoration:underline;cursor:pointer;" onclick="location.assign('/a/#!/history/${message.shard}/${roomName}?t=${message.tick}');">${roomName}</span>`;
            } else {
              return `<span style="text-decoration:underline;cursor:pointer;" onclick="location.assign('/a/#!/room/${message.shard}/${roomName}');">${roomName}</span>`;
            }
          }
        } else if (objectId) {
          if ("room" in message && "shard" in message) {
            if ("tick" in message) {
              return `<span style="text-decoration:underline;cursor:pointer;" onclick="location.assign('/a/#!/history/${message.shard}/${message.room}?t=${message.tick}');angular.element('body').injector().get('RoomViewPendingSelector').set('${objectId}');">${objectId}</span>`;
            } else {
              return `<span style="text-decoration:underline;cursor:pointer;" onclick="location.assign('/a/#!/room/${message.shard}/${message.room}');angular.element('.game-field-container').scope().Room.selectObjectPending('${objectId}');">${objectId}</span>`;
            }
          }
        }

        return fullMatch;
      }
    );

    console.log(finalMessage);
  }
}
