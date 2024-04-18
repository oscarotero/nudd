import { parse, RegistryUrl } from "./utils.ts";
import { githubVersions } from "./github.ts";

export class PaxDeno extends RegistryUrl {
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
