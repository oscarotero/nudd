import { Package, parse } from "./utils.ts";
import { npmVersions } from "./npm.ts";

export class Jspm extends Package {
  static type = "jspm";
  static regexp = [
    /https?:\/\/dev.jspm.io\/npm:[^/"']*?\@[^'"\s]*/,
    /https?:\/\/jspm.dev\/[^/"']*?\@[^'"\s]*/,
  ];

  static create(name: string): Promise<Jspm> {
    return new Jspm({ name, version: "0.0.0", type: this.type })
      .toLatestVersion();
  }

  static parse(url: string): Jspm {
    return parse(Jspm, url);
  }

  get packageUrl(): string {
    return `https://www.npmjs.com/package/${this.name}`;
  }

  async versions(): Promise<string[]> {
    return await npmVersions(this.name);
  }

  at(version = this.version, file = this.file): string {
    return `https://dev.jspm.io/npm:${this.name}@${version}${file}`;
  }
}
