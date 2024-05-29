import pack from "../../package.json";
import gitDescribe from "consts:gitDescribe";

export const Version = {
  version: pack.version,
	gitAbbrevHash: pack.gitAbbrevHash,
	gitBranch: pack.gitBranch,
	gitCommitHash: pack.gitCommitHash,
	gitDate: pack.gitDate,
  gitDescribe: gitDescribe,
	gitVersion: pack.gitVersion
}
