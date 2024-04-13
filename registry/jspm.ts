import {
  defaultAt,
  defaultName,
  defaultVersion,
  RegistryUrl,
} from "./utils.ts";
import { unpkgVersions } from "./unpkg.ts";

export class Jspm extends RegistryUrl {
  async all(): Promise<string[]> {
    return await unpkgVersions(defaultName(this));
  }

  at(version: string): RegistryUrl {
    const url = defaultAt(this, version);
    return new Jspm(url);
  }

  version(): string {
    return defaultVersion(this);
  }

  regexp = /https?:\/\/dev.jspm.io\/[^\/\"\']*?\@[^\'\"]*/;
}
