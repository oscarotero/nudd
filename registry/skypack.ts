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
  get version(): string {
    return defaultInfo(this).version;
  }

  get name(): string {
    const { scope, packageName } = defaultInfo(this);
    return `${scope}/${packageName}`;
  }

  regexp =
    /https?:\/\/cdn\.skypack\.dev(\/\_)?\/@[^\/\"\']*?\/[^\/\"\']*?\@[^\'\"]*/;

  async all(): Promise<string[]> {
    return await unpkgVersions(this.name);
  }

  at(version: string): RegistryUrl {
    const url = defaultScopeAt(this, version);
    return new SkypackScope(url);
  }
}

export class Skypack extends RegistryUrl {
  get version(): string {
    return defaultVersion(this);
  }

  get name(): string {
    return defaultName(this);
  }

  regexp = /https?:\/\/cdn.skypack.dev(\/\_)?\/[^\/\"\']*?\@[^\'\"]*/;

  async all(): Promise<string[]> {
    return await unpkgVersions(this.name);
  }

  at(version: string): RegistryUrl {
    const url = defaultAt(this, version);
    return new Skypack(url);
  }
}
