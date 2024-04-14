import { RegistryUrl } from "./utils.ts";
import { npmVersions } from "./npm.ts";

export class Unpkg extends RegistryUrl {
  static regexp = [
    /https?:\/\/unpkg.com\/[^/"']*?\@[^'"]*/,
  ];

  async versions(): Promise<string[]> {
    return await npmVersions(this.name);
  }

  at(version: string): string {
    return `https://unpkg.com/${this.name}@${version}${this.file}`;
  }
}
