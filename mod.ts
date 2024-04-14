import { Progress, SilentProgress } from "./progress.ts";
import { getLatestVersion, parse } from "./semver.ts";
import {
  importUrls,
  lookup,
  type RegistryCtor,
  type RegistryUrl,
} from "./registry/utils.ts";
import { DenoLand } from "./registry/denoland.ts";
import { JsDelivr } from "./registry/jsdelivr.ts";
import { Npm } from "./registry/npm.ts";
import { GithubRaw } from "./registry/github.ts";
import { GitlabRaw } from "./registry/gitlab.ts";
import { Unpkg, UnpkgScope } from "./registry/unpkg.ts";
import { Skypack, SkypackScope } from "./registry/skypack.ts";
import { EsmSh, EsmShScope } from "./registry/esm.ts";
import { Pika, PikaScope } from "./registry/pika.ts";
import { NestLand } from "./registry/nestland.ts";
import { Jspm } from "./registry/jspm.ts";
import { Denopkg } from "./registry/denopkg.ts";
import { PaxDeno } from "./registry/paxdeno.ts";

const REGISTRIES = [
  DenoLand,
  UnpkgScope,
  Unpkg,
  Denopkg,
  PaxDeno,
  Jspm,
  PikaScope,
  Pika,
  SkypackScope,
  Skypack,
  EsmShScope,
  EsmSh,
  GithubRaw,
  GitlabRaw,
  JsDelivr,
  NestLand,
  Npm,
];

// FIXME we should catch ctrl-c etc. and write back the original deps.ts

export async function udd(
  filename: string,
  options: UddOptions,
): Promise<UddResult[]> {
  const u = new Udd(filename, options);
  return await u.run();
}

export interface UddOptions {
  // don't permanently edit files
  dryRun?: boolean;
  // don't print progress messages
  quiet?: boolean;

  _registries?: RegistryCtor[];
}

export interface UddResult {
  initUrl: string;
  initVersion: string;
  newVersion?: string;
}

export class Udd {
  private filename: string;
  private options: UddOptions;
  private progress: Progress;
  private registries: RegistryCtor[];

  constructor(
    filename: string,
    options: UddOptions,
  ) {
    this.filename = filename;
    this.options = options;
    this.registries = options._registries || REGISTRIES;
    this.progress = options.quiet ? new SilentProgress(1) : new Progress(1);
  }

  async run(): Promise<UddResult[]> {
    const content: string = Deno.readTextFileSync(this.filename);

    const urls: string[] = importUrls(content, this.registries);
    this.progress.n = urls.length;

    // from a url we need to extract the current version
    const results: UddResult[] = [];
    for (const [i, u] of urls.entries()) {
      this.progress.step = i;
      const v = lookup(u, this.registries);
      if (v !== undefined) {
        results.push(await this.update(v!));
      }
    }

    return results;
  }

  async update(
    url: RegistryUrl,
  ): Promise<UddResult> {
    const initUrl: string = url.url;
    const initVersion: string = url.version;

    await this.progress.log(`Looking for releases: ${url.url}`);

    try {
      parse(url.version);
    } catch (_) {
      // The version string is a non-semver string like a branch name.
      await this.progress.log(`Skip updating: ${url.url}`);
      return { initUrl, initVersion };
    }

    const newVersion = getLatestVersion(await url.all());
    if (url.version === newVersion) {
      await this.progress.log(`Using latest: ${url.url}`);
      return { initUrl, initVersion };
    }

    if (!this.options.dryRun) {
      await this.progress.log(`Attempting update: ${url.url} -> ${newVersion}`);
      this.replace(url, newVersion, initUrl);
      await this.progress.log(`Update successful: ${url.url} -> ${newVersion}`);
    }

    return {
      initUrl,
      initVersion,
      newVersion,
    };
  }

  // Note: we pass initUrl because it may have been modified with fragments :(
  replace(
    url: RegistryUrl,
    newVersion: string,
    initUrl: string,
  ): void {
    const newUrl = url.at(newVersion).url;
    const content = Deno.readTextFileSync(this.filename);
    const newContent = content.split(initUrl).join(newUrl);
    Deno.writeTextFileSync(this.filename, newContent);
  }
}
