import { Package, parse } from "./utils.ts";
import { npmVersions } from "./npm.ts";

export class Skypack extends Package {
  static type = "skypack";
  static regexp = [
    /https?:\/\/cdn.skypack.dev(\/\_)?\/[^/"']*?\@[^'"\s]*/,
    /https?:\/\/cdn\.skypack\.dev(\/\_)?\/@[^/"']*?\/[^/"']*?\@[^'"\s]*/,
    /https?:\/\/cdn.pika.dev(\/\_)?\/[^/"']*?\@[^'"\s]*/,
    /https?:\/\/cdn\.pika\.dev(\/\_)?\/@[^/"']*?\/[^/"']*?\@[^'"\s]*/,
  ];

  static parse(url: string): Skypack {
    return parse(Skypack, url);
  }

  get packageUrl(): string {
    return `https://www.skypack.dev/view/${this.name}`;
  }

  async versions(): Promise<string[]> {
    return await npmVersions(this.name);
  }

  at(version = this.version, file = this.file): string {
    return `https://cdn.skypack.dev/${this.name}@${version}${file}`;
  }
}
