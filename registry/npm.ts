import { RegistryUrl, type VersionsJson } from "./utils.ts";

const NPM_CACHE: Map<string, string[]> = new Map<string, string[]>();
const parseRegex = /^npm:(\@[^/]+\/[^@/]+|[^@/]+)(?:\@([^/]+))?(.*)/;

export class Npm extends RegistryUrl {
  get version(): string {
    const [, _, version] = this.url.match(parseRegex)!;
    if (version === null) {
      throw Error(`Unable to find version in ${this.url}`);
    }
    return version;
  }

  get name(): string {
    const [, name] = this.url.match(parseRegex)!;
    return name;
  }

  regexp = /npm:(\@[^/]+\/[^@/]+|[^@/]+)(?:\@([^\/\"\']+))?[^\'\"]/;

  async all(): Promise<string[]> {
    const name = this.name;

    if (NPM_CACHE.has(name)) {
      return NPM_CACHE.get(name)!;
    }

    try {
      const json: VersionsJson =
        await (await fetch(`https://registry.npmjs.org/${name}`))
          .json();
      if (!json.versions) {
        throw new Error(`versions.json for ${name} has incorrect format`);
      }

      const versions = Object.keys(json.versions).reverse();
      NPM_CACHE.set(name, versions);
      return versions;
    } catch (err) {
      // TODO this could be a permissions error e.g. no --allow-net...
      console.error(`error getting versions for ${name}`);
      throw err;
    }
  }

  at(version: string): RegistryUrl {
    const [, name, _, files] = this.url.match(parseRegex)!;
    const url = `npm:${name}@${version}${files}`;
    return new Npm(url);
  }
}
