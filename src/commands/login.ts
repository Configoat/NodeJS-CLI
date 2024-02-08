import cors from '@fastify/cors'
import fastify from "fastify";
// @ts-ignore
import opener from "opener";
import { setConfig } from '../utils';

function waitForToken() {
    return new Promise<{ port: number, tokenPromise: Promise<string> }>(async mainResolve => {
        const tokenPromise = new Promise<string>(async tokenResolve => {
            const server = fastify({
                ajv: {
                    customOptions: {
                        removeAdditional: false
                    }
                }
            });

            await server.register(cors);

            server.get<{ Querystring: { token: string } }>("/", (req, res) => {
                const token = req.query.token;

                if (token) {
                    tokenResolve(token);
                    server.close();
                }

                res.header("Content-Type", "text/html");

                res.send(`
                <script> history.pushState(null, "", location.href.split("?")[0]); </script>
                <p> Thanks, You can now close this tab. </p>
                `)
            });

            const startingPort = +(process.env.CONFIGOAT_CLI_LOGIN_PORT || 3173);

            for (let port = startingPort; port < startingPort + 100; port++) {
                try {
                    await server.listen({ port, host: "0.0.0.0" });
                    mainResolve({
                        tokenPromise,
                        port,
                    })
                    break;
                }
                catch (err: any) {
                    if (err.code !== "EADDRINUSE") {
                        throw err;
                    }
                }
            }
        });
    });
}

export async function login(str: string, opts: any) {
    console.log("In order to login, you will be redirected to the Configoat.com website in few seconds. After logging in, the website will be closed and you'll be able to continue in the CLI.");
    console.log("");
    
    const siteUrl = process.env.CONFIGOAT_CLI_LOGIN_URL || "https://configoat.com";

    const { port, tokenPromise } = await waitForToken();

    opener(`${siteUrl}/login?type=cli&port=${port}`);

    const token = await tokenPromise;

    setConfig("token", token);

    console.log("You are now logged in.");
}