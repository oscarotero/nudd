import {
  defaultAt,
  defaultInfo,
  defaultName,
  defaultScopeAt,
  defaultVersion,
  RegistryUrl,
} from "./utils.ts";
import { unpkgVersions } from "./unpkg.ts";

export class PikaScope extends RegistryUrl {
  get version(): string {
    return defaultInfo(this).version;
  }

  get name(): string {
    const { scope, packageName } = defaultInfo(this);
    return `${scope}/${packageName}`;
  }

  regexp =
    /https?:\/\/cdn\.pika\.dev(\/\_)?\/@[^\/\"\']*?\/[^\/\"\']*?\@[^\'\"]*/;

  async all(): Promise<string[]> {
    return await unpkgVersions(this.name);
  }

  at(version: string): RegistryUrl {
    const url = defaultScopeAt(this, version);
    return new PikaScope(url);
  }
}

export class Pika extends RegistryUrl {
  get version(): string {
    return defaultVersion(this);
  }

  get name(): string {
    return defaultName(this);
  }

  regexp = /https?:\/\/cdn.pika.dev(\/\_)?\/[^\/\"\']*?\@[^\'\"]*/;

  async all(): Promise<string[]> {
    return await unpkgVersions(this.name);
  }

  at(version: string): RegistryUrl {
    const url = defaultAt(this, version);
    return new Pika(url);
  }
}
