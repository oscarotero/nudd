import { readJson, RegistryUrl } from "./utils.ts";

export class Jsr extends RegistryUrl {
  static regexp = [
    /jsr:\@[^/]+\/[^@/"]+(?:\@[^/"']+)?[^'"]*/,
  ];

  async versions(): Promise<string[]> {
    return await readJson(`https://jsr.io/${this.name}/meta.json`, (json) => {
      if (!json.versions) {
        throw new Error(`versions.json for ${this.name} has incorrect format`);
      }
      return Object.keys(json.versions);
    });
  }

  at(version: string): string {
    return `jsr:${this.name}@${version}${this.file}`;
  }
}
