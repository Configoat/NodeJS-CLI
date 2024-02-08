import { setConfig } from "../utils";

export async function logout(str: string, opts: any) {
    setConfig("token", "");
    setConfig("environment", "");
    setConfig("environmentDisplayName", "");

    console.log("You have been logged out.");
}