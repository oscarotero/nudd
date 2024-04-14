import { RegistryUrl } from "./utils.ts";
import { npmVersions } from "./npm.ts";

export class Jspm extends RegistryUrl {
  static regexp = [/https?:\/\/dev.jspm.io\/npm:[^/"']*?\@[^'"]*/];

  async versions(): Promise<string[]> {
    return await npmVersions(this.name);
  }

  at(version: string): string {
    return `https://dev.jspm.io/npm:${this.name}@${version}${this.file}`;
  }
}
