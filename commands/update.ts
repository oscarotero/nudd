import {
  colors,
  expandGlob,
  getLatestVersion,
  parse,
  Spinner,
} from "../deps.ts";
import { Package, Registry } from "../registry/utils.ts";
import { DenoLand } from "../registry/denoland.ts";
import { DenoRe } from "../registry/denore.ts";
import { JsDelivr } from "../registry/jsdelivr.ts";
import { Npm } from "../registry/npm.ts";
import { GithubRaw } from "../registry/github.ts";
import { GitlabRaw } from "../registry/gitlab.ts";
import { Unpkg } from "../registry/unpkg.ts";
import { Skypack } from "../registry/skypack.ts";
import { EsmSh } from "../registry/esm.ts";
import { NestLand } from "../registry/nestland.ts";
import { Jspm } from "../registry/jspm.ts";
import { Denopkg } from "../registry/denopkg.ts";
import { PaxDeno } from "../registry/paxdeno.ts";
import { Jsr } from "../registry/jsr.ts";

const registries: Registry[] = [
  DenoLand,
  Unpkg,
  Denopkg,
  DenoRe,
  PaxDeno,
  Jspm,
  Skypack,
  EsmSh,
  GithubRaw,
  GitlabRaw,
  JsDelivr,
  NestLand,
  Npm,
  Jsr,
];

export interface UpdateOptions {
  // don't permanently edit files
  dryRun?: boolean;
}

export default async function run(files: string[], options: UpdateOptions) {
  const spinner = new Spinner({ message: "Scanning files..." });
  spinner.start();

  const depFiles: string[] = [];

  for (const arg of files.map((x) => x.toString())) {
    for await (const file of expandGlob(arg)) {
      depFiles.push(file.path);
    }
  }

  if (depFiles.length === 0) {
    spinner.stop();
    console.error("No files found.");
    return;
  }

  if (depFiles.length === 1) {
    spinner.message = `Updating dependencies of ${depFiles[0]}...`;
  } else {
    spinner.message = `Updating dependencies of ${depFiles.length} files...`;
  }

  const results: UpdateResult[] = [];

  await Promise.all(depFiles.map(async (filename) => {
    results.push(...await update(filename, options));
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

export interface UpdateResult {
  initUrl: string;
  initVersion: string;
  newVersion?: string;
}

export async function update(
  filename: string,
  options: UpdateOptions,
): Promise<UpdateResult[]> {
  if (filename.endsWith(".json")) {
    return await updateImportMap(filename, options);
  }

  return await updateCode(filename, options);
}

async function updateCode(
  filename: string,
  options: UpdateOptions,
): Promise<UpdateResult[]> {
  let content: string = Deno.readTextFileSync(filename);
  let changed = false;
  const packages: Package[] = codeUrls(content);

  // from a url we need to extract the current version
  const results: UpdateResult[] = [];

  for (const pkg of packages) {
    const initUrl: string = pkg.url!;
    const initVersion: string = pkg.version;

    try {
      parse(initVersion);
    } catch {
      // The version string is a non-semver string like a branch name.
      results.push({ initUrl, initVersion });
      continue;
    }

    const newVersion = getLatestVersion(await pkg.versions());
    if (initVersion === newVersion) {
      results.push({ initUrl, initVersion });
      continue;
    }

    if (!options.dryRun) {
      const newUrl = pkg.at(newVersion);
      content = content.replace(initUrl, newUrl);
      changed = true;
    }

    results.push({
      initUrl,
      initVersion,
      newVersion,
    });
  }

  if (changed) {
    Deno.writeTextFileSync(filename, content);
  }

  return results;
}

interface ImportMap {
  imports?: Record<string, string>;
}

async function updateImportMap(
  filename: string,
  options: UpdateOptions,
): Promise<UpdateResult[]> {
  const content: string = Deno.readTextFileSync(filename);
  const json = JSON.parse(content) as ImportMap;
  const results: UpdateResult[] = [];
  let changed = false;

  if (!json.imports) {
    return results;
  }

  for (const [key, initUrl] of Object.entries(json.imports)) {
    for (const R of registries) {
      if (R.regexp.some((r) => r.test(initUrl))) {
        const v = R.parse(initUrl);
        const newVersion = getLatestVersion(await v.versions());

        if (v.version !== newVersion && !options.dryRun) {
          json.imports[key] = v.at(newVersion);
          results.push({ initUrl, initVersion: v.version, newVersion });
          changed = true;
          break;
        }

        results.push({ initUrl, initVersion: v.version });
        break;
      }
    }
  }

  if (changed) {
    Deno.writeTextFileSync(filename, JSON.stringify(json, null, 2) + "\n");
  }

  return results;
}

function codeUrls(content: string): Package[] {
  const packages: Package[] = [];

  for (const R of registries) {
    const allRegexp = R.regexp.map((r) =>
      new RegExp(`['"]${r.source}['"]`, "g")
    );

    for (const regexp of allRegexp) {
      const match = content.match(regexp);
      match?.forEach((url) =>
        packages.push(R.parse(url.replace(/['"]/g, "") as string))
      );
    }
  }

  return packages;
}
