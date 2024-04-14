import { getLatestVersion, parse } from "./deps.ts";
import { importUrls, RegistryUrl } from "./registry/utils.ts";
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

const registries = [
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
];

export interface UddOptions {
  // don't permanently edit files
  dryRun?: boolean;
}

export interface UddResult {
  initUrl: string;
  initVersion: string;
  newVersion?: string;
}

export async function udd(
  filename: string,
  options: UddOptions,
): Promise<UddResult[]> {
  let content: string = Deno.readTextFileSync(filename);
  let changed = false;
  const urls: RegistryUrl[] = importUrls(content, registries);

  // from a url we need to extract the current version
  const results: UddResult[] = [];

  for (const v of urls) {
    const initUrl: string = v.url;
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
