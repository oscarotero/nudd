import {
  defaultAt,
  defaultInfo,
  defaultName,
  defaultScopeAt,
  defaultVersion,
  RegistryUrl,
} from "./utils.ts";
import { allVersions } from "./npm.ts";

export class SkypackScope extends RegistryUrl {
  static regexp =
    /https?:\/\/cdn\.skypack\.dev(\/\_)?\/@[^\/\"\']*?\/[^\/\"\']*?\@[^\'\"]*/;

  get version(): string {
    return defaultInfo(this).version;
  }

  get name(): string {
    const { scope, packageName } = defaultInfo(this);
    return `${scope}/${packageName}`;
  }

  async all(): Promise<string[]> {
    return await allVersions(this.name);
  }

  at(version: string): RegistryUrl {
    const url = defaultScopeAt(this, version);
    return new SkypackScope(url);
  }
}

export class Skypack extends RegistryUrl {
  static regexp = /https?:\/\/cdn.skypack.dev(\/\_)?\/[^\/\"\']*?\@[^\'\"]*/;

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
    return new Skypack(url);
  }
}
