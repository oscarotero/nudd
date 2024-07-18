import { Package, parse, readJson } from "./utils.ts";

export class NestLand extends Package {
  static type = "nestland";
  static regexp = [
    /https?:\/\/x\.nest\.land\/[^/"']+@(?!master)[^/"']+\/[^'"\s]*/,
  ];

  static create(name: string): Promise<NestLand> {
    return new NestLand({ name, version: "0.0.0", type: this.type })
      .toLatestVersion();
  }

  static parse(url: string): NestLand {
    return parse(NestLand, url);
  }

  get packageUrl(): string {
    return `https://nest.land/package/${this.name}`;
  }

  async versions(): Promise<string[]> {
    const url = `https://x.nest.land/api/package/${this.name}`;

    return await readJson(
      url,
      (json) =>
        (json.packageUploadNames || []).map((name: string) =>
          name.split("@")[1]
        ),
    );
  }

  at(version = this.version, file = this.file): string {
    return `https://x.nest.land/${this.name}@${version}${file}`;
  }
}
