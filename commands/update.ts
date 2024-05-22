import {
  colors,
  dirname,
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
import { getImportMapFile } from "../import_map.ts";

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

  // search in global scripts
  global?: boolean;
}

export default async function run(files: string[], options: UpdateOptions) {
  const ignored: string[] = [];

  if (files.length === 0) {
    if (options.global) {
      // Get deno binary path
      const denoBin = Deno.execPath();
      ignored.push(denoBin);
      files.push(dirname(denoBin) + "/*");
    } else {
      files.push(await getImportMapFile());
    }
  }

  if (files.length === 0) {
    console.error("No files found.");
    return;
  }

  const spinner = new Spinner({ message: "Scanning files..." });
  spinner.start();

  const depFiles: string[] = [];

  for (const arg of files.map((x) => x.toString())) {
    console.log(arg);
    for await (const file of expandGlob(arg)) {
      if (ignored.includes(file.path)) {
        continue;
      }

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
  const results: UpdateResult[] = [];
  const content = Deno.readTextFileSync(filename);

  if (filename.endsWith(".json")) {
    const map = JSON.parse(content) as ImportMap;
    const updatedMap = await updateImportMap(map, options, results);

    if (updatedMap) {
      Deno.writeTextFileSync(
        filename,
        JSON.stringify(updatedMap, null, 2) + "\n",
      );
    }
    return results;
  }

  const updatedContent = await updateCode(content, options, results);

  if (updatedContent) {
    Deno.writeTextFileSync(filename, updatedContent);
  }

  return results;
}

async function updateCode(
  content: string,
  options: UpdateOptions,
  results: UpdateResult[],
): Promise<string | undefined> {
  let changed = false;
  const packages = codeUrls(content);

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

  return changed ? content : undefined;
}

interface ImportMap {
  imports?: Record<string, string>;
  tasks?: Record<string, string>; // only in deno.json
}

async function updateImportMap(
  json: ImportMap,
  options: UpdateOptions,
  results: UpdateResult[],
): Promise<ImportMap | undefined> {
  let changed = false;

  if (!json.imports && !json.tasks) {
    return;
  }

  if (json.imports) {
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
  }
  if (json.tasks) {
    for (const [key, command] of Object.entries(json.tasks)) {
      const updatedCommand = await updateCode(command + " ", options, results);
      if (updatedCommand) {
        json.tasks[key] = updatedCommand.slice(0, -1);
        changed = true;
      }
    }
  }

  return changed ? json : undefined;
}

function codeUrls(content: string): Package[] {
  const packages: Package[] = [];

  for (const R of registries) {
    const allRegexp = R.regexp.map((r) =>
      new RegExp(`['"\\s]${r.source}['"\\s$]`, "g")
    );

    for (const regexp of allRegexp) {
      const match = content.match(regexp);
      match?.forEach((url) =>
        packages.push(R.parse(url.replace(/['"\s]/g, "") as string))
      );
    }
  }

  return packages;
}
