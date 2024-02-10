#!/usr/bin/env node

import { Command } from 'commander';
import { environment, exec, fork, login, logout } from './commands';

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
    .option("-ef, --envFile <fileName>", "The dot env file to load.", ".env")
    .option("-ne, --no-env", "Do not load dot env file.", true)
    .action(exec);

program
    .command("fork")
    .description("Forks a new NodeJS process with the runtime configuration")
    .argument("<file>", "The file to execute")
    .option("-nr, --no-runtime", "Do not use runtime configuration", true)
    .option("-i, --interval <interval>", "The interval to check for changes", "60")
    .option("-ef, --envFile <fileName>", "The dot env file to load.", ".env")
    .option("-ne, --no-env", "Do not load dot env file.", true)
    .action(fork);

program
    .command("login")
    .description("Login to Configoat.com")
    .action(login);

program
    .command("environment")
    .description("Prints or sets the environment")
    .argument("[environment]", "Environment name to set")
    .option("--unset", "Unset the environment", false)
    .action(environment);

program
    .command("logout")
    .description("Logout from Configoat.com")
    .action(logout);

program.parse(process.argv);