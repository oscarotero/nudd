import { RegistryUrl } from "./utils.ts";
import { githubVersions } from "./github.ts";

export class JsDelivr extends RegistryUrl {
  static regexp = [
    /https?:\/\/cdn\.jsdelivr\.net\/gh\/[^/"']+\/[^/"']+@(?!master)[^/"']+\/[^'"]*/,
  ];

  parse() {
    return super.parse(false);
  }

  versions(): Promise<string[]> {
    return githubVersions(this.name);
  }

  at(version: string): string {
    return `https://cdn.jsdelivr.net/gh/${this.name}@${version}${this.file}`;
  }
}
