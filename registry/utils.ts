import { getLatestVersion } from "../deps.ts";

export abstract class Package {
  readonly type: string;
  readonly name: string;
  version: string;
  file: string;

  constructor(data: PackageData) {
    this.version = data.version;
    this.name = data.name;
    this.file = data.file || "";
    this.type = data.type;
  }

  get id(): string {
    return `${this.type}:${this.name}@${this.version}`;
  }

  get url() {
    return this.at();
  }

  async latestVersion(): Promise<string> {
    const versions = await this.versions();
    return getLatestVersion(versions);
  }

  async toLatestVersion(): Promise<this> {
    this.version = await this.latestVersion();
    return this;
  }

  abstract get packageUrl(): string;

  /** Returns all available versions */
  abstract versions(): Promise<string[]>;

  /** Returns a URL with a specific version/file */
  abstract at(version?: string, file?: string): string;
}

export function parse(
  Registry: Registry,
  url: string,
  atScope = true,
): Package {
  // Scoped
  let match = atScope
    ? url.match(/[/:](@[^/:]+)\/([^/:]+)@([^/]+)(.*)$/)
    : url.match(/[/:]([^/:]+)\/([^/:]+)@([^/]+)(.*)$/);

  if (match) {
    return new Registry({
      version: match[3],
      name: `${match[1]}/${match[2]}`,
      file: match[4],
      type: Registry.type,
    });
  }

  // Unscoped
  match = url.match(/[/:]([^/:]+)@([^/]+)(.*)$/);

  if (match) {
    return new Registry({
      version: match[2],
      name: match[1],
      file: match[3],
      type: Registry.type,
    });
  }

  throw new Error(`Unable to parse ${url}`);
}

export interface Registry {
  new (data: PackageData): Package;
  create(name: string): Promise<Package>;
  parse(url: string): Package;
  regexp: RegExp[];
  type: string;
}

export interface PackageData {
  version: string;
  name: string;
  file?: string;
  type: string;
}

export const cache: Map<string, Promise<string[]>> = new Map();

export function readJson(
  url: string,
  // deno-lint-ignore no-explicit-any
  cb: (json: any) => string[],
): Promise<string[]> {
  if (cache.has(url)) {
    return cache.get(url)!;
  }

  const item = fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}`);
    }
    return response.json();
  }).then(cb);

  cache.set(url, item);
  return item;
}
