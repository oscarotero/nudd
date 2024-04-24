import { Package, parse, readJson } from "./utils.ts";

export class Jsr extends Package {
  static type = "jsr";
  static regexp = [
    /jsr:\@[^/]+\/[^@/"]+(?:\@[^/"']+)?[^'"]*/,
    /https:\/\/jsr\.io\/\@[^/]+\/[^@/"]+(?:\@[^/"']+)?[^'"]*/,
  ];

  static parse(url: string): Package {
    if (url.startsWith("https:")) {
      const match = url.match(/(@[^/]+\/[^/]+)\/([^/]+)(.*)$/);

      if (!match) {
        throw new Error(`Unable to parse ${url}`);
      }

      return new Jsr({
        url,
        version: match[2],
        name: match[1],
        file: match[3],
        type: Jsr.type,
      });
    }
    return parse(Jsr, url);
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

  atHttp(version = this.version, file = this.file): string {
    return `https://jsr.io/${this.name}/${version}${file}`;
  }
}
