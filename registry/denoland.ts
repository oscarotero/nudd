import { Package, parse, readJson } from "./utils.ts";

export class DenoLand extends Package {
  static type = "denoland";
  static regexp = [
    /https?:\/\/deno.land\/(?:std\@[^'"]*|x\/[^/"']*?\@[^'"\s]*)/,
  ];

  static create(name: string): Promise<DenoLand> {
    return new DenoLand({ name, version: "0.0.0", type: this.type })
      .toLatestVersion();
  }

  static parse(url: string): DenoLand {
    return parse(DenoLand, url);
  }

  get packageUrl(): string {
    return `https://deno.land/x/${this.name}`;
  }

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

  at(version = this.version, file = this.file): string {
    if (this.name === "std") {
      return `https://deno.land/${this.name}@${version}${file}`;
    }

    return `https://deno.land/x/${this.name}@${version}${file}`;
  }
}
