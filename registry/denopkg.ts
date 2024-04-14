import { RegistryUrl } from "./utils.ts";
import { githubVersions } from "./github.ts";

export class Denopkg extends RegistryUrl {
  static regexp = [/https?:\/\/denopkg.com\/[^/"']*?\/[^/"']*?\@[^'"]*/];

  parse() {
    return super.parse(false);
  }

  async versions(): Promise<string[]> {
    return await githubVersions(this.name);
  }

  at(version: string): string {
    return `https://denopkg.com/${this.name}@${version}${this.file}`;
  }
}
