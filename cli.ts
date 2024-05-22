import { colors, getLatestVersion, parseArgs } from "./deps.ts";
import updateCommand from "./commands/update.ts";
import duplicatesCommand from "./commands/duplicates.ts";
import addCommand from "./commands/add.ts";
import { DenoLand } from "./registry/denoland.ts";

function help() {
  console.log(`usage: nudd [-h] [--dry-run] [command] [args...]

nudd: Deno Dependencies

Commands:
  update       \tupdate dependencies
               \t${colors.dim("nudd update one.ts two.ts three/*.ts ...")}

               \t-g, --global
               \tupdate the dependencies of Deno scripts installed globally
               \t${colors.dim("nudd update --global")}

  duplicates   \tshow and fix duplicated dependencies
               \t${colors.dim("nudd duplicates main.ts")}

  add          \tadd new dependencies to the import map file.
               \t${colors.dim("nudd add @std/path")}

Optional arguments:
  -h, --help   \tshow this help text
  --dry-run    \ttest what dependencies can be updated
  --upgrade    \tupdate up to the latest version
  --version    \tprint the version of up`);
}

function version() {
  try {
    const mod = DenoLand.parse(import.meta.url);
    console.log(mod.version);
  } catch {
    // Local development
    console.log(import.meta.url);
  }
}

async function upgrade() {
  const mod = DenoLand.parse(import.meta.url);
  const latestVersion = getLatestVersion(await mod.versions());

  if (mod.version === latestVersion) {
    console.log("Already latest version.");
    return;
  }

  const cmd = new Deno.Command(Deno.execPath(), {
    args: [
      "install",
      "--allow-run",
      "--allow-read",
      "--allow-write",
      "--allow-net",
      "--name",
      "nudd",
      "--force",
      "--reload",
      "--global",
      mod.at(latestVersion),
    ],
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });

  await cmd.output();
}

async function main(args: string[]) {
  const a = parseArgs(args, {
    boolean: ["dry-run", "help", "version", "global"],
    alias: {
      h: "help",
      v: "version",
      g: "global",
    },
  });

  if (a.version) {
    return version();
  }

  if (a.help) {
    return help();
  }

  const rest: string[] = a._.map((f) => String(f));
  const command = rest.shift();

  if (command === "upgrade") {
    return await upgrade();
  }

  if (command === "update") {
    return updateCommand(rest, { dryRun: a["dry-run"], global: a.global });
  }

  if (command === "add") {
    return addCommand(rest);
  }

  if (command === "duplicates") {
    const file = rest.shift();
    if (!file) {
      throw new Error("Missing file argument.");
    }
    return duplicatesCommand(file, { dryRun: a["dry-run"] });
  }

  console.error(colors.red(`Unknown command: ${command}`));
  help();
}

if (import.meta.main) {
  await main(Deno.args);
}
