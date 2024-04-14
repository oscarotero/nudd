// deno -A main.ts deps.ts --test="deno test"

import { colors, expandGlob, parseArgs, Spinner } from "./deps.ts";
import { up, UpOptions, UpResult } from "./mod.ts";
import { DenoLand } from "./registry/denoland.ts";

function help() {
  console.log(`usage: up [-h] [--dry-run] [--test TEST] file [file ...]

up: Update Deno Dependencies

Positional arguments:
  file      \tfiles to update dependencies

Optional arguments:
 -h, --help \tshow this help text
 --dry-run  \ttest what dependencies can be updated
 --upgrade  \tupdate up to the latest version
 --version  \tprint the version of up`);
}

function version() {
  // FIXME this might be kinda a hacky way to do it...
  const u = new DenoLand(import.meta.url);
  try {
    console.log(u.version);
  } catch (e) {
    console.error(e);
  }
}

async function upgrade() {
  const u = new DenoLand("https://deno.land/x/up@0.x/main.ts");
  const latestVersion = (await u.versions())[0];
  const url = u.at(latestVersion);
  console.log(url);

  // TODO;
}

async function main(args: string[]) {
  const a = parseArgs(args, {
    boolean: ["dry-run", "h", "help", "upgrade", "version"],
  });

  if (a.h || a.help) {
    return help();
  }
  if (a.upgrade) {
    return await upgrade();
  }
  if (a.version) {
    return version();
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
    help();
    Deno.exit(1);
  }

  if (depFiles.length === 1) {
    spinner.message = `Updating dependencies of ${depFiles[0]}...`;
  } else {
    spinner.message = `Updating dependencies of ${depFiles.length} files...`;
  }

  const options: UpOptions = { dryRun: a["dry-run"] };
  const results: UpResult[] = [];

  await Promise.all(depFiles.map(async (filename) => {
    results.push(...await up(filename, options));
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
