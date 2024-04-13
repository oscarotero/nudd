import {
  defaultAt,
  defaultName,
  defaultVersion,
  RegistryUrl,
} from "./utils.ts";
import { unpkgVersions } from "./unpkg.ts";

export class Jspm extends RegistryUrl {
  get version(): string {
    return defaultVersion(this);
  }

  get name(): string {
    return defaultName(this);
  }

  regexp = /https?:\/\/dev.jspm.io\/[^\/\"\']*?\@[^\'\"]*/;

  async all(): Promise<string[]> {
    return await unpkgVersions(this.name);
  }

  at(version: string): RegistryUrl {
    const url = defaultAt(this, version);
    return new Jspm(url);
  }
}
