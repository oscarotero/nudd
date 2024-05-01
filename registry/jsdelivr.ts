import { Package, parse } from "./utils.ts";
import { githubVersions } from "./github.ts";

export class JsDelivr extends Package {
  static type = "jsdelivr";
  static regexp = [
    /https?:\/\/cdn\.jsdelivr\.net\/gh\/[^/"']+\/[^/"']+@(?!master)[^/"']+\/[^'"\s]*/,
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
