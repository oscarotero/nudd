import {
  colors,
  expandGlob,
  getLatestVersion,
  parseArgs,
  Spinner,
} from "./deps.ts";
import { nudd, NuddOptions, NuddResult } from "./mod.ts";
import { DenoLand } from "./registry/denoland.ts";

function help() {
  console.log(`usage: nudd [-h] [--dry-run] file [file ...]

nudd: Deno Dependencies

Positional arguments:
  file      \tfiles to update dependencies

Optional arguments:
 -h, --help \tshow this help text
 --dry-run  \ttest what dependencies can be updated
 --upgrade  \tupdate up to the latest version
 --version  \tprint the version of up`);
}

function version() {
  try {
    const mod = new DenoLand(import.meta.url);
    console.log(mod.version);
  } catch {
    // Local development
    console.log(import.meta.url);
  }
}

async function upgrade() {
  const mod = new DenoLand(import.meta.url);
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
  if (a.help || a._.length === 0) {
    return help();
  }

  const spinner = new Spinner({ message: "Scanning files..." });
  spinner.start();

  const depFiles: string[] = [];

  for (const arg of a._.map((x) => x.toString())) {
    for await (const file of expandGlob(arg)) {
      depFiles.push(file.path);
    }
  }

  if (depFiles.length === 0) {
    spinner.stop();
    help();
    Deno.exit(1);
  }

  if (depFiles.length === 1) {
    spinner.message = `Updating dependencies of ${depFiles[0]}...`;
  } else {
    spinner.message = `Updating dependencies of ${depFiles.length} files...`;
  }

  const options: NuddOptions = { dryRun: a["dry-run"] };
  const results: NuddResult[] = [];

  await Promise.all(depFiles.map(async (filename) => {
    results.push(...await nudd(filename, options));
  }));

  spinner.stop();

  const alreadyLatest = results.filter((x) => x.newVersion === undefined);

  if (alreadyLatest.length > 0) {
    console.log(colors.bold("\nAlready latest version:"));
    for (const a of alreadyLatest) {
      console.log(colors.dim(a.initUrl), "==", a.initVersion);
    }
  }

  const updated = results.filter((x) => x.newVersion !== undefined);
  if (updated.length > 0) {
    console.log(
      colors.bold(
        options.dryRun ? "\nAble to update:" : "\nSuccessfully updated:",
      ),
    );
    for (const s of updated) {
      console.log(colors.green(s.initUrl), s.initVersion, "->", s.newVersion);
    }
  }
}

if (import.meta.main) {
  await main(Deno.args);
}
