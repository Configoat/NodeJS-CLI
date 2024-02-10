import { Configoat } from "@configoat/sdk";
import { parseArgsStringToArgv } from 'string-argv';
import { ChildProcess, spawn } from 'child_process';
import { loadDotEnv } from "../utils";

export async function exec(str: string, opts: any) {
    loadDotEnv(opts);
    
    const interval = +opts.interval;

    if (isNaN(interval)) {
        console.error("Interval should be a number");
        process.exit(1);
    }

    await Configoat.init({
        autoReload: opts.runtime,
        autoReloadInterval: interval * 1000,
        apiUrl: process.env.CONFIGOAT_CLI_API_URL,
    });

    const argv = parseArgsStringToArgv(str);
    const cmd = argv.shift();

    let cp: ChildProcess;

    function exitListener(code: number | null, signal: NodeJS.Signals) {
        if (signal !== "SIGTERM") {
            process.exit(code || 1);
        }
    }

    console.log(Object.fromEntries(
        Object.entries(process.env)
            .map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])));
    

    function summon() {
        cp?.off("exit", exitListener);
        cp = spawn(cmd as any, argv, {
            stdio: "inherit",
            env: Object.fromEntries(
                Object.entries(process.env)
                    .map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])),
        });
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