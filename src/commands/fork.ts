import { readFileSync, writeFileSync } from "fs";
import { fork as cpFork } from 'child_process';
import { parseArgsStringToArgv } from 'string-argv';
import { Configoat } from "@configoat/sdk";

export async function fork(str: string, opts: any) {
    const argv = parseArgsStringToArgv(str);
    const cmd = argv.shift();

    if (!cmd || !cmd.endsWith(".js")) {
        console.error("Only .js files are supported");
        process.exit(1);
    }

    const interval = +opts.interval;

    if (isNaN(interval)) {
        console.error("Interval should be a number");
        process.exit(1);
    }

    await Configoat.init({
        autoReload: opts.runtime,
        autoReloadInterval: interval*1000,
    });

    const fileContent = readFileSync(cmd!, "utf-8");

    const code = `
    process.env = JSON.parse(process.env.ENV);
    process.on('message', (m) => {
        process.env = m;
    });
    `

    const tempFileName = `temp-${Date.now()}-${cmd}`;

    writeFileSync(tempFileName, code + fileContent, "utf-8");

    const cp = cpFork(tempFileName, argv, { env: {
        ENV: JSON.stringify(process.env),
    } });

    cp.on("exit", () => {
        process.exit(0);
    });

    Configoat.onReload(({ deleted, created, updated }) => {
        if (deleted.length || created.length || updated.length) {
            cp.send(process.env);
        }
    });
}