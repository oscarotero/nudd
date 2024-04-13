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
    return await unpkgVersions(this.name);
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
    return await unpkgVersions(this.name);
  }

  at(version: string): RegistryUrl {
    const url = defaultAt(this, version);
    return new Unpkg(url);
  }
}

export async function unpkgVersions(name: string): Promise<string[]> {
  const page = await fetch(`https://unpkg.com/browse/${name}/`);
  const text = await page.text();
  // naively, we grab all the options
  const m = [...text.matchAll(/\<option[^\<\>]* value\=\"(.*?)\"\>/g)];
  m.reverse();
  return m.map((x) => x[1]);
}
