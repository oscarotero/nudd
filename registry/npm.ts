import { readJson, RegistryUrl } from "./utils.ts";

const parseRegex = /^npm:(\@[^/]+\/[^@/]+|[^@/]+)(?:\@([^/]+))?(.*)/;

export class Npm extends RegistryUrl {
  static regexp = [
    /npm:(\@[^/]+\/[^@/]+|[^@/]+)(?:\@([^/"']+))?[^'"]/,
  ];

  async versions(): Promise<string[]> {
    return await npmVersions(this.name);
  }

  at(version: string): string {
    const [, name, _, files] = this.url.match(parseRegex)!;
    return `npm:${name}@${version}${files}`;
  }
}

export function npmVersions(name: string): Promise<string[]> {
  return readJson(`https://registry.npmjs.org/${name}`, (json) => {
    if (!json.versions) {
      throw new Error(`versions.json for ${name} has incorrect format`);
    }
    return Object.keys(json.versions);
  });
}
