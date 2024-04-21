import { Package, parse } from "./utils.ts";
import { githubVersions } from "./github.ts";

export class PaxDeno extends Package {
  static type = "paxdeno";
  static regexp = [/https?:\/\/pax.deno.dev\/[^/"']*?\/[^/"']*?\@[^'"]*/];

  static parse(url: string): PaxDeno {
    return parse(PaxDeno, url, false);
  }

  async versions(): Promise<string[]> {
    return await githubVersions(this.name);
  }

  at(version = this.version, file = this.file): string {
    return `https://pax.deno.dev/${this.name}@${version}${file}`;
  }
}
