import { parse, RegistryUrl } from "./utils.ts";
import { npmVersions } from "./npm.ts";

export class Skypack extends RegistryUrl {
  static regexp = [
    /https?:\/\/cdn.skypack.dev(\/\_)?\/[^/"']*?\@[^'"]*/,
    /https?:\/\/cdn\.skypack\.dev(\/\_)?\/@[^/"']*?\/[^/"']*?\@[^'"]*/,
    /https?:\/\/cdn.pika.dev(\/\_)?\/[^/"']*?\@[^'"]*/,
    /https?:\/\/cdn\.pika\.dev(\/\_)?\/@[^/"']*?\/[^/"']*?\@[^'"]*/,
  ];

  static parse(url: string): Skypack {
    return parse(Skypack, url);
  }

  async versions(): Promise<string[]> {
    return await npmVersions(this.name);
  }

  at(version = this.version, file = this.file): string {
    return `https://cdn.skypack.dev/${this.name}@${version}${file}`;
  }
}
