import { defaultAt, defaultVersion, readJson, RegistryUrl } from "./utils.ts";

export class DenoLand extends RegistryUrl {
  static regexp =
    /https?:\/\/deno.land\/(?:std\@[^\'\"]*|x\/[^\/\"\']*?\@[^\'\"]*)/;

  get version(): string {
    return defaultVersion(this);
  }

  get name(): string {
    const [, stdGroup, xGroup] = this.url.match(
      /deno\.land\/(?:(std)|x\/([^/@]*))/,
    )!;

    return stdGroup ?? xGroup;
  }

  async all(): Promise<string[]> {
    const name = this.name;
    const url = `https://cdn.deno.land/${name}/meta/versions.json`;

    return await readJson(url, (json) => {
      if (!json.versions) {
        throw new Error(`versions.json for ${name} has incorrect format`);
      }
      return json.versions;
    });
  }

  at(version: string): RegistryUrl {
    const url = defaultAt(this, version);
    return new DenoLand(url);
  }
}
