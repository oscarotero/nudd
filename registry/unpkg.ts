import { Package, parse } from "./utils.ts";
import { npmVersions } from "./npm.ts";

export class Unpkg extends Package {
  static type = "unpkg";
  static regexp = [
    /https?:\/\/unpkg.com\/[^/"']*?\@[^'"\s]*/,
  ];

  static create(name: string): Promise<Unpkg> {
    return new Unpkg({ name, version: "0.0.0", type: this.type })
      .toLatestVersion();
  }

  static parse(url: string): Unpkg {
    return parse(Unpkg, url);
  }

  get packageUrl(): string {
    return `https://www.npmjs.com/package/${this.name}`;
  }

  async versions(): Promise<string[]> {
    return await npmVersions(this.name);
  }

  at(version = this.version, file = this.file): string {
    return `https://unpkg.com/${this.name}@${version}${file}`;
  }
}
