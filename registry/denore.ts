import { Package, parse } from "./utils.ts";
import { githubVersions } from "./github.ts";

export class DenoRe extends Package {
  static type = "denore";
  static regexp = [/https?:\/\/deno.re\/[^/"']*?\/[^/"']*?\@[^'"]*/];

  static parse(url: string): DenoRe {
    return parse(DenoRe, url, false);
  }

  async versions(): Promise<string[]> {
    return await githubVersions(this.name);
  }

  at(version = this.version, file = this.file): string {
    return `https://deno.re/${this.name}@${version}${file}`;
  }
}
