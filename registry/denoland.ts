import {
  defaultAt,
  defaultVersion,
  RegistryUrl,
  type VersionsJson,
} from "./utils.ts";

const DL_CACHE: Map<string, string[]> = new Map<string, string[]>();

export class DenoLand extends RegistryUrl {
  get version(): string {
    return defaultVersion(this);
  }

  get name(): string {
    const [, stdGroup, xGroup] = this.url.match(
      /deno\.land\/(?:(std)|x\/([^/@]*))/,
    )!;

    return stdGroup ?? xGroup;
  }

  regexp = /https?:\/\/deno.land\/(?:std\@[^\'\"]*|x\/[^\/\"\']*?\@[^\'\"]*)/;

  async all(): Promise<string[]> {
    const name = this.name;

    if (DL_CACHE.has(name)) {
      return DL_CACHE.get(name)!;
    }

    try {
      const json: VersionsJson =
        await (await fetch(`https://cdn.deno.land/${name}/meta/versions.json`))
          .json();
      if (!json.versions) {
        throw new Error(`versions.json for ${name} has incorrect format`);
      }

      DL_CACHE.set(name, json.versions);
      return json.versions;
    } catch (err) {
      // TODO this could be a permissions error e.g. no --allow-net...
      console.error(`error getting versions for ${name}`);
      throw err;
    }
  }

  at(version: string): RegistryUrl {
    const url = defaultAt(this, version);
    return new DenoLand(url);
  }
}
