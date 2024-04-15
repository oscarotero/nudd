import { readJson, RegistryUrl } from "./utils.ts";

export class Npm extends RegistryUrl {
  static regexp = [
    /npm:(\@[^/]+\/[^@/]+|[^@/]+)(?:\@[^/"']+)?[^'"]*/,
  ];

  async versions(): Promise<string[]> {
    return await npmVersions(this.name);
  }

  at(version: string): string {
    return `npm:${this.name}@${version}${this.file}`;
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
