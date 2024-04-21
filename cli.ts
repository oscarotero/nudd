import { getLatestVersion, parseArgs } from "./deps.ts";
import updateCommand from "./commands/update.ts";
import duplicatesCommand from "./commands/duplicates.ts";
import { DenoLand } from "./registry/denoland.ts";

function help() {
  console.log(`usage: nudd [-h] [--dry-run] file [file ...]

nudd: Deno Dependencies

Positional arguments:
  file      \tfiles to update dependencies

Optional arguments:
 -h, --help   \tshow this help text
 --dry-run    \ttest what dependencies can be updated
 --duplicates \tshow and fix duplicated dependencies
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
    boolean: ["dry-run", "help", "upgrade", "version"],
    string: ["duplicates"],
    alias: {
      h: "help",
      v: "version",
    },
  });

  if (a.upgrade) {
    return await upgrade();
  }

  if (a.version) {
    return version();
  }

  if (a.duplicates) {
    return duplicatesCommand(a.duplicates, { dryRun: a["dry-run"] });
  }

  if (a.help || a._.length === 0) {
    return help();
  }

  return updateCommand(a._ as string[], { dryRun: a["dry-run"] });
}

if (import.meta.main) {
  await main(Deno.args);
}
