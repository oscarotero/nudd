import {
  defaultAt,
  defaultInfo,
  defaultName,
  defaultScopeAt,
  defaultVersion,
  RegistryUrl,
} from "./utils.ts";
import { unpkgVersions } from "./unpkg.ts";

export class SkypackScope extends RegistryUrl {
  async all(): Promise<string[]> {
    const { scope, packageName } = defaultInfo(this);
    return await unpkgVersions(`${scope}/${packageName}`);
  }

  at(version: string): RegistryUrl {
    const url = defaultScopeAt(this, version);
    return new SkypackScope(url);
  }

  version(): string {
    return defaultInfo(this).version;
  }

  regexp =
    /https?:\/\/cdn\.skypack\.dev(\/\_)?\/@[^\/\"\']*?\/[^\/\"\']*?\@[^\'\"]*/;
}

export class Skypack extends RegistryUrl {
  async all(): Promise<string[]> {
    return await unpkgVersions(defaultName(this));
  }

  at(version: string): RegistryUrl {
    const url = defaultAt(this, version);
    return new Skypack(url);
  }

  version(): string {
    return defaultVersion(this);
  }

  regexp = /https?:\/\/cdn.skypack.dev(\/\_)?\/[^\/\"\']*?\@[^\'\"]*/;
}
