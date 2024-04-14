import { readJson, RegistryUrl } from "./utils.ts";

export class DenoLand extends RegistryUrl {
  static regexp = [
    /https?:\/\/deno.land\/(?:std\@[^'"]*|x\/[^/"']*?\@[^'"]*)/,
  ];

  async versions(): Promise<string[]> {
    const name = this.name;
    const url = `https://cdn.deno.land/${name}/meta/versions.json`;

    return await readJson(url, (json) => {
      if (!json.versions) {
        throw new Error(`versions.json for ${name} has incorrect format`);
      }
      return json.versions;
    });
  }

  at(version: string): string {
    if (this.name === "std") {
      return `https://deno.land/${this.name}@${version}${this.file}`;
    }

    return `https://deno.land/x/${this.name}@${version}${this.file}`;
  }
}
