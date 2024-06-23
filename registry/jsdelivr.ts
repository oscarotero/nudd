import { Package, parse, readJson } from "./utils.ts";

export class JsDelivr extends Package {
  static type = "jsdelivr";
  static regexp = [
    /https?:\/\/cdn\.jsdelivr\.net\/gh\/[^/"']+\/[^/"']+@(?!master)[^/"']+\/[^'"\s]*/,
    /https?:\/\/cdn\.jsdelivr\.net\/npm\/@[^/"']+\/[^/"']+@[^'"\s]*/,
    /https?:\/\/cdn\.jsdelivr\.net\/npm\/[^/"']+@[^'"\s]*/,
  ];

  static parse(url: string): JsDelivr {
    if (url.includes("cdn.jsdelivr.net/npm/")) {
      return parse(JsDelivr, url, true);
    }
    return parse(JsDelivr, url, false);
  }

  versions(): Promise<string[]> {
    const url = getOrigin(this.name) === "npm"
      ? `https://data.jsdelivr.com/v1/package/npm/${this.name}`
      : `https://data.jsdelivr.com/v1/package/gh/${this.name}`;

    return readJson(url, (data) => data.versions);
  }

  at(version = this.version, file = this.file): string {
    const origin = getOrigin(this.name);

    return `https://cdn.jsdelivr.net/${origin}/${this.name}@${version}${file}`;
  }
}

function getOrigin(name: string): "npm" | "gh" {
  return name.startsWith("@") || !name.includes("/") ? "npm" : "gh";
}
