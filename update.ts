import { getLatestVersion, parse } from "./deps.ts";
import { RegistryCtor, RegistryUrl } from "./registry/utils.ts";
import { DenoLand } from "./registry/denoland.ts";
import { JsDelivr } from "./registry/jsdelivr.ts";
import { Npm } from "./registry/npm.ts";
import { GithubRaw } from "./registry/github.ts";
import { GitlabRaw } from "./registry/gitlab.ts";
import { Unpkg } from "./registry/unpkg.ts";
import { Skypack } from "./registry/skypack.ts";
import { EsmSh } from "./registry/esm.ts";
import { NestLand } from "./registry/nestland.ts";
import { Jspm } from "./registry/jspm.ts";
import { Denopkg } from "./registry/denopkg.ts";
import { PaxDeno } from "./registry/paxdeno.ts";
import { Jsr } from "./registry/jsr.ts";

const registries: RegistryCtor[] = [
  DenoLand,
  Unpkg,
  Denopkg,
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
  const urls: RegistryUrl[] = codeUrls(content);

  // from a url we need to extract the current version
  const results: UpdateResult[] = [];

  for (const v of urls) {
    const initUrl: string = v.url!;
    const initVersion: string = v.version;

    try {
      parse(initVersion);
    } catch {
      // The version string is a non-semver string like a branch name.
      results.push({ initUrl, initVersion });
      continue;
    }

    const newVersion = getLatestVersion(await v.versions());
    if (initVersion === newVersion) {
      results.push({ initUrl, initVersion });
      continue;
    }

    if (!options.dryRun) {
      const newUrl = v.at(newVersion);
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

function codeUrls(content: string): RegistryUrl[] {
  const urls: RegistryUrl[] = [];

  for (const R of registries) {
    const allRegexp = R.regexp.map((r) =>
      new RegExp(`['"]${r.source}['"]`, "g")
    );

    for (const regexp of allRegexp) {
      const match = content.match(regexp);
      match?.forEach((url) =>
        urls.push(R.parse(url.replace(/['"]/g, "") as string))
      );
    }
  }

  return urls;
}
