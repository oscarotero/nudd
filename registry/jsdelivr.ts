import { npmVersions } from "./npm.ts";
import { Package, parse, readJson, Version } from "./utils.ts";

export class JsDelivr extends Package {
  static type = "jsdelivr";
  static regexp = [
    /https?:\/\/cdn\.jsdelivr\.net\/gh\/[^/"']+\/[^/"']+@(?!master)[^/"']+\/[^'"\s]*/,
    /https?:\/\/cdn\.jsdelivr\.net\/npm\/@[^/"']+\/[^/"']+@[^'"\s]*/,
    /https?:\/\/cdn\.jsdelivr\.net\/npm\/[^/"']+@[^'"\s]*/,
  ];

  static create(name: string): Promise<JsDelivr> {
    return new JsDelivr({ name, version: "0.0.0", type: this.type })
      .toLatestVersion();
  }

  static parse(url: string): JsDelivr {
    if (url.includes("cdn.jsdelivr.net/npm/")) {
      return parse(JsDelivr, url, true);
    }
    return parse(JsDelivr, url, false);
  }

  get packageUrl(): string {
    return getOrigin(this.name) === "npm"
      ? `https://www.jsdelivr.com/package/npm/${this.name}`
      : `https://www.jsdelivr.com/package/gh/${this.name}`;
  }

  versions(): Promise<Version[]> {
    if (getOrigin(this.name) === "npm") {
      return npmVersions(this.name);
    }

    return readJson(
      `https://data.jsdelivr.com/v1/package/gh/${this.name}`,
      (data) => data.versions.map((v: string) => [v, undefined]),
    );
  }

  at(version = this.version, file = this.file): string {
    const origin = getOrigin(this.name);

    return `https://cdn.jsdelivr.net/${origin}/${this.name}@${version}${file}`;
  }
}

function getOrigin(name: string): "npm" | "gh" {
  return name.startsWith("@") || !name.includes("/") ? "npm" : "gh";
}
