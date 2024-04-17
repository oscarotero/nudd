import { readJson, RegistryUrl } from "./utils.ts";

export class NestLand extends RegistryUrl {
  static regexp = [
    /https?:\/\/x\.nest\.land\/[^/"']+@(?!master)[^/"']+\/[^'"]*/,
  ];

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
