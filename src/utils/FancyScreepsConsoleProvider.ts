import { LogLevel } from "./logging/Logger";
import { LogMessage } from "./logging/LogMessage";
import { Provider } from "./logging/Provider";

interface LogLevelInfo {
  color: string;
  prefix: string;
}

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

function getShardPath(shardName: string): string {
  if (shardName === "shardSeason") {
    return "/season";
  }
  return "/a";
}

export class FancyScreepsConsoleProvider extends Provider {
  constructor(level: LogLevel = LogLevel.Debug) {
    super(level);
  }

  public log(message: LogMessage): void {
    let finalMessage = `<span style="color: ${info[message.level].color};">${info[message.level].prefix} [${
      message.scope
    }] : ${message.message}</span>`;

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
            // shardSeason == seasonal server
            if ("tick" in message) {
              return `<span style="text-decoration:underline;cursor:pointer;" onclick="location.assign('${getShardPath(
                message.shard
              )}/#!/history/${message.shard}/${roomName}?t=${message.tick}');">${roomName}</span>`;
            } else {
              return `<span style="text-decoration:underline;cursor:pointer;" onclick="location.assign('${getShardPath(
                message.shard
              )}/#!/room/${message.shard}/${roomName}');">${roomName}</span>`;
            }
          }
        } else if (objectId) {
          if ("room" in message && "shard" in message) {
            if ("tick" in message) {
              return `<span style="text-decoration:underline;cursor:pointer;" onclick="location.assign('${getShardPath(
                message.shard
              )}/#!/history/${message.shard}/${message.room}?t=${
                message.tick
              }');angular.element('body').injector().get('RoomViewPendingSelector').set('${objectId}');">${objectId}</span>`;
            } else {
              return `<span style="text-decoration:underline;cursor:pointer;" onclick="location.assign('${getShardPath(
                message.shard
              )}/#!/room/${message.shard}/${
                message.room
              }');angular.element('.game-field-container').scope().Room.selectObjectPending('${objectId}');">${objectId}</span>`;
            }
          }
        }

        return fullMatch;
      }
    );

    console.log(finalMessage);
  }
}
