#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_1 = require("@configoat/sdk");
const child_process_1 = require("child_process");
const commander_1 = require("commander");
const string_argv_1 = require("string-argv");
const program = new commander_1.Command();
// This function is used to execute a command with the runtime configuration
// We re-run the command when the configuration changes
function execCommand(str, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        yield sdk_1.Configoat.init({
            autoReloadInterval: 1000 * 10,
        });
        const argv = (0, string_argv_1.parseArgsStringToArgv)(str);
        const cmd = argv.shift();
        let cp;
        function exitListener(code, signal) {
            if (signal !== "SIGTERM") {
                process.exit(code || 1);
            }
        }
        function summon() {
            cp === null || cp === void 0 ? void 0 : cp.off("exit", exitListener);
            cp = (0, child_process_1.spawn)(cmd, argv, { stdio: "inherit", env: process.env });
            cp.on("exit", exitListener);
        }
        sdk_1.Configoat.onReload(({ deleted, created, updated }) => {
            if (deleted.length || created.length || updated.length) {
                cp.kill();
                summon();
            }
        });
        summon();
    });
}
program
    .name("configoat")
    .description("Configoat.com CLI tool")
    .version("0.0.1");
program
    .command("exec")
    .description("Executes a configuration file")
    .argument("<command>", "The command to execute")
    .option("-nr, --no-runtime", "Do not use runtime configuration", true)
    .action(execCommand);
program.parse(process.argv);
