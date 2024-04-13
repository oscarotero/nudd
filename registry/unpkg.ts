import {
  defaultAt,
  defaultInfo,
  defaultName,
  defaultScopeAt,
  defaultVersion,
  RegistryUrl,
} from "./utils.ts";

export class UnpkgScope extends RegistryUrl {
  async all(): Promise<string[]> {
    const { scope, packageName } = defaultInfo(this);
    return await unpkgVersions(`${scope}/${packageName}`);
  }

  at(version: string): RegistryUrl {
    const url = defaultScopeAt(this, version);
    return new UnpkgScope(url);
  }

  version(): string {
    return defaultInfo(this).version;
  }

  regexp = /https?:\/\/unpkg\.com\/@[^\/\"\']*?\/[^\/\"\']*?\@[^\'\"]*/;
}

export class Unpkg extends RegistryUrl {
  async all(): Promise<string[]> {
    return await unpkgVersions(defaultName(this));
  }

  at(version: string): RegistryUrl {
    const url = defaultAt(this, version);
    return new Unpkg(url);
  }

  version(): string {
    return defaultVersion(this);
  }

  regexp = /https?:\/\/unpkg.com\/[^\/\"\']*?\@[^\'\"]*/;
}

export async function unpkgVersions(name: string): Promise<string[]> {
  const page = await fetch(`https://unpkg.com/browse/${name}/`);
  const text = await page.text();
  // naively, we grab all the options
  const m = [...text.matchAll(/\<option[^\<\>]* value\=\"(.*?)\"\>/g)];
  m.reverse();
  return m.map((x) => x[1]);
}
