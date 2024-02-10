import axios from "axios";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";

const configoatFolder = `${homedir()}/.configoat`;
const configFile = `${configoatFolder}/config.json`;

export function setConfig(key: string, value: any) {
    mkdirSync(configoatFolder, { recursive: true });

    let config: any = {};

    try {
        config = JSON.parse(readFileSync(configFile, "utf-8"));
    }
    catch (err) {}

    config[key] = value;

    writeFileSync(configFile, JSON.stringify(config, null, 2));
}

export function getConfig(key: string) {
    try {
        return JSON.parse(readFileSync(configFile, "utf-8"))[key];
    }
    catch (err) {
        return undefined;
    }
}

export const axiosInstance = axios.create({
    baseURL: (process.env.CONFIGOAT_CLI_API_URL || "https://configoat.com") + "/v1",
    headers: {
        "Content-Type": "application/json",
    },
});

export function loadDotEnv(opts: any) {
    if (opts.env) {
        require("dotenv").config({ path: opts.envFile });
    }
}