import { defaultAt, defaultVersion, readJson, RegistryUrl } from "./utils.ts";

export class NestLand extends RegistryUrl {
  static regexp =
    /https?:\/\/x\.nest\.land\/[^\/\"\']+@(?!master)[^\/\"\']+\/[^\'\"]*/;

  get version(): string {
    return defaultVersion(this);
  }

  get name(): string {
    return this.url.split("/")[3].split("@")[0];
  }

  async all(): Promise<string[]> {
    const url = `https://x.nest.land/api/package/${this.name}`;

    return await readJson(
      url,
      (json) =>
        (json.packageUploadNames || []).map((name: string) =>
          name.split("@")[1]
        ),
    );
  }

  at(version: string): RegistryUrl {
    const url = defaultAt(this, version);
    return new NestLand(url);
  }
}
