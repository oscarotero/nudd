import { Package, parse } from "./utils.ts";
import { npmVersions } from "./npm.ts";

export class EsmSh extends Package {
  static type = "esm.sh";
  static regexp = [
    /https?:\/\/esm.sh\/[^/"']*?\@[^'"]*/,
    /https?:\/\/esm\.sh\/@[^/"']*?\/[^/"']*?\@[^'"\s]*/,
  ];

  static create(name: string): Promise<EsmSh> {
    return new EsmSh({ name, version: "0.0.0", type: this.type })
      .toLatestVersion();
  }

  static parse(url: string): EsmSh {
    return parse(EsmSh, url);
  }

  get packageUrl(): string {
    return `https://www.npmjs.com/package/${this.name}`;
  }

  async versions(): Promise<string[]> {
    return await npmVersions(this.name);
  }

  at(version = this.version, file = this.file): string {
    return `https://esm.sh/${this.name}@${version}${file}`;
  }
}
