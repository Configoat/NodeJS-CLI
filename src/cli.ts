#!/usr/bin/env node

import { Command } from 'commander';
import { exec } from './commands';
import { fork } from './commands/fork';

const program = new Command();

program
    .name("configoat")
    .description("Configoat.com CLI tool")
    .version("0.0.1");

program
    .command("exec")
    .description("Executes a command with the runtime configuration")
    .argument("<command>", "The command to execute")
    .option("-nr, --no-runtime", "Do not use runtime configuration", true)
    .option("-i, --interval <interval>", "The interval to check for changes", "60")
    .action(exec);

program
    .command("fork")
    .description("Forks a new NodeJS process with the runtime configuration")
    .argument("<file>", "The file to execute")
    .option("-nr, --no-runtime", "Do not use runtime configuration", true)
    .option("-i, --interval <interval>", "The interval to check for changes", "60")
    .action(fork);

program.parse(process.argv);