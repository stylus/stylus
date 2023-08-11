import Mocha from "mocha";

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

globalThis.process = process;

const mocha = new Mocha({
  bail: true,
  checkLeaks: true,
  require: ["chai"],
  reporter: "dot",
});

const testDirs = ["test/", "test/middleware/"];

testDirs.forEach((testDir) => {
  fs
    .readdirSync(testDir)
    .filter(function (file) {
      if (testDir === "test/" && file === "deno.js") return false;

      return file.slice(-3) === ".js";
    })
    .forEach(function (file) {
      mocha.addFile(path.join(testDir, file));
    });
});

mocha.run(function (failures) {
  process.exitCode = failures ? 1 : 0;
});
