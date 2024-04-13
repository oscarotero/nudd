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
  async all(): Promise<string[]> {
    const { scope, packageName } = defaultInfo(this);
    return await unpkgVersions(`${scope}/${packageName}`);
  }

  at(version: string): RegistryUrl {
    const url = defaultScopeAt(this, version);
    return new EsmShScope(url);
  }

  version(): string {
    return defaultInfo(this).version;
  }

  regexp = /https?:\/\/esm\.sh\/@[^\/\"\']*?\/[^\/\"\']*?\@[^\'\"]*/;
}

export class EsmSh implements RegistryUrl {
  url: string;

  name(): string {
    return defaultName(this);
  }

  constructor(url: string) {
    this.url = url;
  }

  async all(): Promise<string[]> {
    return await unpkgVersions(this.name());
  }

  at(version: string): RegistryUrl {
    const url = defaultAt(this, version);
    return new EsmSh(url);
  }

  version(): string {
    return defaultVersion(this);
  }

  regexp = /https?:\/\/esm.sh\/[^\/\"\']*?\@[^\'\"]*/;
}
