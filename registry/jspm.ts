import { parse, RegistryUrl } from "./utils.ts";
import { npmVersions } from "./npm.ts";

export class Jspm extends RegistryUrl {
  static regexp = [
    /https?:\/\/dev.jspm.io\/npm:[^/"']*?\@[^'"]*/,
    /https?:\/\/jspm.dev\/[^/"']*?\@[^'"]*/,
  ];

  static parse(url: string): Jspm {
    return parse(Jspm, url);
  }

  async versions(): Promise<string[]> {
    return await npmVersions(this.name);
  }

  at(version = this.version, file = this.file): string {
    return `https://dev.jspm.io/npm:${this.name}@${version}${file}`;
  }
}
