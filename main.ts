// deno -A main.ts deps.ts --test="deno test"

import { colors, expandGlob, parseArgs } from "./deps.ts";
import { udd, UddOptions, UddResult } from "./mod.ts";
import { DenoLand } from "./registry/denoland.ts";

function help() {
  console.log(`usage: udd [-h] [--dry-run] [--test TEST] file [file ...]

udd: Update Deno Dependencies

Positional arguments:
  file      \tfiles to update dependencies

Optional arguments:
 -h, --help \tshow this help text
 --dry-run  \ttest what dependencies can be updated
 --test TEST\tcommand to run after each dependency update e.g. "deno test"
 --upgrade  \tupdate udd to the latest version
 --version  \tprint the version of udd`);
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
  const u = new DenoLand("https://deno.land/x/udd@0.x/main.ts");
  const latestVersion = (await u.all())[0];
  const url = u.at(latestVersion).url;
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

  // TODO verbosity/quiet argument?
  const options: UddOptions = { dryRun: a["dry-run"] };
  const results: UddResult[] = [];

  for (const [i, fn] of depFiles.entries()) {
    if (i !== 0) console.log();
    console.log(colors.yellow(fn));
    results.push(...await udd(fn, options));
  }

  // TODO perhaps a table would be a nicer output?

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
