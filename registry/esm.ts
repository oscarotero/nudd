import {
  defaultAt,
  defaultInfo,
  defaultName,
  defaultScopeAt,
  defaultVersion,
  RegistryUrl,
} from "./utils.ts";
import { unpkgVersions } from "./unpkg.ts";

export class EsmShScope extends RegistryUrl {
  static regexp = /https?:\/\/esm\.sh\/@[^\/\"\']*?\/[^\/\"\']*?\@[^\'\"]*/;

  get version(): string {
    return defaultInfo(this).version;
  }

  get name(): string {
    const { scope, packageName } = defaultInfo(this);
    return `${scope}/${packageName}`;
  }

  async all(): Promise<string[]> {
    return await unpkgVersions(this.name);
  }

  at(version: string): RegistryUrl {
    const url = defaultScopeAt(this, version);
    return new EsmShScope(url);
  }
}

export class EsmSh extends RegistryUrl {
  static regexp = /https?:\/\/esm.sh\/[^\/\"\']*?\@[^\'\"]*/;

  get version(): string {
    return defaultVersion(this);
  }

  get name(): string {
    return defaultName(this);
  }

  async all(): Promise<string[]> {
    return await unpkgVersions(this.name);
  }

  at(version: string): RegistryUrl {
    const url = defaultAt(this, version);
    return new EsmSh(url);
  }
}
