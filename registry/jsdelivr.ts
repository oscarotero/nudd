import { parse, RegistryUrl } from "./utils.ts";
import { githubVersions } from "./github.ts";

export class JsDelivr extends RegistryUrl {
  static regexp = [
    /https?:\/\/cdn\.jsdelivr\.net\/gh\/[^/"']+\/[^/"']+@(?!master)[^/"']+\/[^'"]*/,
  ];

  static parse(url: string): JsDelivr {
    return parse(JsDelivr, url, false);
  }

  versions(): Promise<string[]> {
    return githubVersions(this.name);
  }

  at(version = this.version, file = this.file): string {
    return `https://cdn.jsdelivr.net/gh/${this.name}@${version}${file}`;
  }
}
