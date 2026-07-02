import { Package, parse, readJson, Version } from "./utils.ts";

export class Npm extends Package {
  static type = "npm";
  static regexp = [
    /npm:(\@[^/]+\/[^@/]+|[^@/"]+)(?:\@[^/"'\s]+)?[^'"\s]*/,
  ];

  static create(name: string): Promise<Npm> {
    return new Npm({ name, version: "0.0.0", type: this.type })
      .toLatestVersion();
  }

  static parse(url: string): Npm {
    return parse(Npm, url);
  }

  get packageUrl(): string {
    return `https://www.npmjs.com/package/${this.name}`;
  }

  async versions(): Promise<Version[]> {
    return await npmVersions(this.name);
  }

  at(version = this.version, file = this.file): string {
    return `npm:${this.name}@${version}${file}`;
  }
}

export function npmVersions(name: string): Promise<Version[]> {
  return readJson(`https://registry.npmjs.org/${name}`, (json) => {
    if (!json.versions) {
      throw new Error(`versions.json for ${name} has incorrect format`);
    }
    const time = json.time;

    return Object.keys(json.versions).map((v) => [v, time[v]]);
  });
}
