import { ParseResult, readJson, RegistryUrl } from "./utils.ts";

export class Jsr extends RegistryUrl {
  static regexp = [
    /jsr:\@[^/]+\/[^@/"]+(?:\@[^/"']+)?[^'"]*/,
    /https:\/\/jsr\.io\/\@[^/]+\/[^@/"]+(?:\@[^/"']+)?[^'"]*/,
  ];

  parse(): ParseResult {
    if (this.url.startsWith("https:")) {
      const match = this.url.match(/(@[^/]+\/[^/]+)\/([^/]+)(.*)$/);

      if (!match) {
        throw new Error(`Unable to parse ${this.url}`);
      }

      return {
        version: match[2],
        name: match[1],
        file: match[3],
      };
    }
    return super.parse();
  }

  async versions(): Promise<string[]> {
    return await readJson(`https://jsr.io/${this.name}/meta.json`, (json) => {
      if (!json.versions) {
        throw new Error(`versions.json for ${this.name} has incorrect format`);
      }
      return Object.keys(json.versions);
    });
  }

  at(version = this.version, file = this.file): string {
    return `jsr:${this.name}@${version}${file}`;
  }
}
