import { Package, parse, readJson } from "./utils.ts";

export class Jsr extends Package {
  http = false;
  static type = "jsr";
  static regexp = [
    /jsr:\/?\@[^/]+\/[^@/"]+(?:\@[^/"']+)?[^'"\s]*/,
    /https:\/\/jsr\.io\/\@[^/]+\/[^/"]+\/[^'"\s]*/,
  ];

  static create(name: string): Promise<Jsr> {
    return new Jsr({ name, version: "0.0.0", type: this.type })
      .toLatestVersion();
  }

  static parse(url: string): Package {
    if (url.startsWith("https:")) {
      const match = url.match(/(@[^/]+\/[^/]+)\/([^/]+)(.*)$/);

      if (!match) {
        throw new Error(`Unable to parse ${url}`);
      }

      const pkg = new Jsr({
        version: match[2],
        name: match[1],
        file: match[3],
        type: Jsr.type,
      });
      pkg.http = true;
      return pkg;
    }
    return parse(Jsr, url);
  }

  get packageUrl(): string {
    return `https://jsr.io/${this.name}`;
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
    if (this.http) {
      return this.atHttp(version, file);
    }
    return `jsr:${this.name}@${version}${file}`;
  }

  atHttp(version = this.version, file = this.file): string {
    return `https://jsr.io/${this.name}/${version}${file}`;
  }
}
