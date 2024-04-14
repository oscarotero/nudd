import { allVersions } from "./npm.ts";
import {
  defaultAt,
  defaultInfo,
  defaultName,
  defaultScopeAt,
  defaultVersion,
  RegistryUrl,
} from "./utils.ts";

export class UnpkgScope extends RegistryUrl {
  static regexp = /https?:\/\/unpkg\.com\/@[^\/\"\']*?\/[^\/\"\']*?\@[^\'\"]*/;

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
    return new UnpkgScope(url);
  }
}

export class Unpkg extends RegistryUrl {
  static regexp = /https?:\/\/unpkg.com\/[^\/\"\']*?\@[^\'\"]*/;

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
    return new Unpkg(url);
  }
}
