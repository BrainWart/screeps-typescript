interface Memory {
  version: { major: string; minor: string; patch: string; branch: string; revision: string };
  logLevel: number;
  [key: string]: any;
}
