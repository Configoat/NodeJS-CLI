#!/usr/bin/env node

import { Configoat } from '@configoat/sdk';
import { ChildProcess, spawn } from 'child_process';
import { Command } from 'commander';
import { parseArgsStringToArgv } from 'string-argv';

const program = new Command();

// This function is used to execute a command with the runtime configuration
// We re-run the command when the configuration changes
async function execCommand(str: string, opts: any) {
    await Configoat.init({
        autoReload: opts.runtime,
    });

    const argv = parseArgsStringToArgv(str);
    const cmd = argv.shift();

    let cp: ChildProcess;

    function exitListener(code: number | null, signal: NodeJS.Signals) {
        if (signal !== "SIGTERM") {
            process.exit(code || 1);
        }
    }

    function summon() {        
        cp?.off("exit", exitListener);
        cp = spawn(cmd as any, argv, { stdio: "inherit", env: process.env });
        cp.on("exit", exitListener);
    }

    Configoat.onReload(({ deleted, created, updated }) => {
        if (deleted.length || created.length || updated.length) {
            cp.kill();
            summon();
        }
    });

    summon();
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