import { Package, parse } from "./utils.ts";
import { githubVersions } from "./github.ts";

export class DenoRe extends Package {
  static type = "denore";
  static regexp = [/https?:\/\/deno.re\/[^/"']*?\/[^/"']*?\@[^'"\s]*/];

  static create(name: string): Promise<DenoRe> {
    return new DenoRe({ name, version: "0.0.0", type: this.type })
      .toLatestVersion();
  }

  static parse(url: string): DenoRe {
    return parse(DenoRe, url, false);
  }

  get packageUrl(): string {
    return `https://github.com/${this.name}`;
  }

  async versions(): Promise<string[]> {
    return await githubVersions(this.name);
  }

  at(version = this.version, file = this.file): string {
    return `https://deno.re/${this.name}@${version}${file}`;
  }
}
