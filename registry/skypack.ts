import { RegistryUrl } from "./utils.ts";
import { npmVersions } from "./npm.ts";

export class Skypack extends RegistryUrl {
  static regexp = [
    /https?:\/\/cdn.skypack.dev(\/\_)?\/[^/"']*?\@[^'"]*/,
    /https?:\/\/cdn\.skypack\.dev(\/\_)?\/@[^/"']*?\/[^/"']*?\@[^'"]*/,
    /https?:\/\/cdn.pika.dev(\/\_)?\/[^/"']*?\@[^'"]*/,
    /https?:\/\/cdn\.pika\.dev(\/\_)?\/@[^/"']*?\/[^/"']*?\@[^'"]*/,
  ];

  async versions(): Promise<string[]> {
    return await npmVersions(this.name);
  }

  at(version: string): string {
    return `https://cdn.skypack.dev/${this.name}@${version}${this.file}`;
  }
}
