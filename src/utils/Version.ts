import pack from "../../package.json";

const versionParts = _.flatten(_.map(pack.version.split("+"), (part) => part.split(".")));
export const Version = {
  branch: versionParts[3],
  major: versionParts[0],
  minor: versionParts[1],
  name: pack.name,
  patch: versionParts[2],
  revision: versionParts[4],
  string: pack.version
};
