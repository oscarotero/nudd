import { Package, parse } from "./utils.ts";
import { githubVersions } from "./github.ts";

export class Denopkg extends Package {
  static type = "denopkg";
  static regexp = [/https?:\/\/denopkg.com\/[^/"']*?\/[^/"']*?\@[^'"\s]*/];

  static create(name: string): Promise<Denopkg> {
    return new Denopkg({ name, version: "0.0.0", type: this.type })
      .toLatestVersion();
  }

  static parse(url: string): Denopkg {
    return parse(Denopkg, url, false);
  }

  get packageUrl(): string {
    return `https://github.com/${this.name}`;
  }

  async versions(): Promise<string[]> {
    return await githubVersions(this.name);
  }

  at(version = this.version, file = this.file): string {
    return `https://denopkg.com/${this.name}@${version}${file}`;
  }
}
