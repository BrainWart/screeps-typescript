"use strict";

import { globSync } from 'glob';
import clear from "rollup-plugin-clear";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import screeps from "rollup-plugin-screeps";
import gitInfo from "rollup-plugin-git-info";
import json from "@rollup/plugin-json";
import consts from "rollup-plugin-consts";
import child_process from 'child_process';

let cfg;
const dest = process.env.DEST;
if (!dest) {
  console.log("No destination specified - code will be compiled but not uploaded");
} else if ((cfg = require("./screeps.json")[dest]) == null) {
  throw new Error("Invalid upload destination");
}

let gitDescribe = child_process.execSync("git describe --always --dirty", {
  cwd: ".",
  encoding: "utf-8",
  windowsHide: true
}).trim();

if (gitDescribe.endsWith("-dirty")) {
  const now = new Date();
  function pad(d) { return d < 10 ? `0${d}` : `${d}`}
  gitDescribe = `${gitDescribe}.${now.getFullYear()}${pad(now.getMonth())}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
}

export default {
  input: "src/main.ts",
  output: {
    file: "dist/main.js",
    format: "cjs",
    sourcemap: true,
  },

  plugins: [
    gitInfo(),
    json({ exclude: "package.json" }),
    consts({
      "gitDescribe": gitDescribe,
    }),
    clear({ targets: ["dist"] }),
    resolve(),
    commonjs(),
    typescript({ include: "src/**/*.ts", tsconfig: "./tsconfig.json" }),
    screeps({ config: cfg, dryRun: cfg == null })
  ]
};
