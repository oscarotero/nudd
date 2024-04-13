export abstract class RegistryUrl {
  url: string;

  constructor(url: string) {
    this.url = url;
  }

  /** Returns all available versions */
  abstract all(): Promise<string[]>;

  /** Returns a new instance with a specific version */
  abstract at(version: string): RegistryUrl;

  /** Returns the package version */
  abstract version(): string;

  /** A valid regexp for this RegistryUrl */
  abstract regexp: RegExp;
}

export interface VersionsJson {
  latest?: string;
  versions?: string[];
}

export interface PackageInfo {
  parts: string[];
  scope: string;
  packageName: string;
  version: string;
}

export type RegistryCtor = new (url: string) => RegistryUrl;
export function lookup(url: string, registries: RegistryCtor[]):
  | RegistryUrl
  | undefined {
  for (const R of registries) {
    const u = new R(url);
    if (u.regexp.test(url)) {
      return u;
    }
  }
}

export function defaultAt(that: RegistryUrl, version: string): string {
  return that.url.replace(/@(.*?)(\/|$)/, `@${version}/`);
}

export function defaultVersion(that: RegistryUrl): string {
  const v = that.url.match(/\@([^\/]+)[\/$]?/);
  if (v === null) {
    throw Error(`Unable to find version in ${that.url}`);
  }
  return v[1];
}

export function defaultName(that: RegistryUrl): string {
  const n = that.url.match(/([^\/\"\']*?)\@[^\'\"]*/);
  if (n === null) {
    throw new Error(`Package name not found in ${that.url}`);
  }
  return n[1];
}

export function defaultInfo(that: RegistryUrl): PackageInfo {
  const parts = that.url.split("/");
  const [packageName, version] = parts[4].split("@");
  if (parts[3] === undefined) {
    throw new Error(`Package scope not found in ${that.url}`);
  }
  if (packageName === undefined) {
    throw new Error(`Package name not found in ${that.url}`);
  }
  if (version === undefined) {
    throw new Error(`Unable to find version in ${that.url}`);
  }
  return {
    scope: parts[3],
    packageName,
    version,
    parts,
  };
}

export function defaultScopeAt(that: RegistryUrl, version: string): string {
  const { parts, packageName } = defaultInfo(that);
  parts[4] = `${packageName}@${version}`;
  return parts.join("/");
}
