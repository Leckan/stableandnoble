import { spawn } from "node:child_process";
import nextEnv from "@next/env";
import { resolve } from "node:path";

nextEnv.loadEnvConfig(process.cwd(), true);
process.env.SANITY_STUDIO_PROJECT_ID ||= process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
process.env.SANITY_STUDIO_DATASET ||= process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
process.env.CHOKIDAR_USEPOLLING ||= "1";

const cli = resolve("node_modules/@sanity/cli/bin/run.js");
const studioPort = process.env.SANITY_STUDIO_PORT || "3334";
const studio = spawn(process.execPath, [cli, "dev", "--host", "localhost", "--port", studioPort], { stdio: "inherit", env: process.env });

for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => studio.kill(signal));
studio.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exitCode = code ?? 1;
});
