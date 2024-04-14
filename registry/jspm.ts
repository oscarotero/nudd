import {
  defaultAt,
  defaultName,
  defaultVersion,
  RegistryUrl,
} from "./utils.ts";
import { allVersions } from "./npm.ts";

export class Jspm extends RegistryUrl {
  static regexp = /https?:\/\/dev.jspm.io\/[^\/\"\']*?\@[^\'\"]*/;

  get version(): string {
    return defaultVersion(this);
  }

  get name(): string {
    return defaultName(this);
  }

  async all(): Promise<string[]> {
    return await allVersions(this.name);
  }

  at(version: string): RegistryUrl {
    const url = defaultAt(this, version);
    return new Jspm(url);
  }
}
