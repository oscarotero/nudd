import { parse, RegistryUrl } from "./utils.ts";
import { githubVersions } from "./github.ts";

export class Denopkg extends RegistryUrl {
  static regexp = [/https?:\/\/denopkg.com\/[^/"']*?\/[^/"']*?\@[^'"]*/];

  static parse(url: string): Denopkg {
    return parse(Denopkg, url, false);
  }

  async versions(): Promise<string[]> {
    return await githubVersions(this.name);
  }

  at(version = this.version, file = this.file): string {
    return `https://denopkg.com/${this.name}@${version}${file}`;
  }
}
