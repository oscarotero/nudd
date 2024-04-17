import { RegistryUrl } from "./utils.ts";
import { npmVersions } from "./npm.ts";

export class Jspm extends RegistryUrl {
  static regexp = [
    /https?:\/\/dev.jspm.io\/npm:[^/"']*?\@[^'"]*/,
    /https?:\/\/jspm.dev\/[^/"']*?\@[^'"]*/,
  ];

  async versions(): Promise<string[]> {
    return await npmVersions(this.name);
  }

  at(version = this.version, file = this.file): string {
    return `https://dev.jspm.io/npm:${this.name}@${version}${file}`;
  }
}
