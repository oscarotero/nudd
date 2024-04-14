import { readJson, RegistryUrl } from "./utils.ts";

const parseRegex = /^npm:(\@[^/]+\/[^@/]+|[^@/]+)(?:\@([^/]+))?(.*)/;

export class Npm extends RegistryUrl {
  static regexp = /npm:(\@[^/]+\/[^@/]+|[^@/]+)(?:\@([^\/\"\']+))?[^\'\"]/;

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

  async all(): Promise<string[]> {
    return await allVersions(this.name);
  }

  at(version: string): RegistryUrl {
    const [, name, _, files] = this.url.match(parseRegex)!;
    const url = `npm:${name}@${version}${files}`;
    return new Npm(url);
  }
}

export function allVersions(name: string): Promise<string[]> {
  return readJson(`https://registry.npmjs.org/${name}`, (json) => {
    if (!json.versions) {
      throw new Error(`versions.json for ${name} has incorrect format`);
    }
    return Object.keys(json.versions);
  });
}
