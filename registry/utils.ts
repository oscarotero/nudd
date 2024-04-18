export abstract class RegistryUrl {
  url?: string;
  version: string;
  name: string;
  file: string;

  constructor(data: ParseResult) {
    this.url = data.url;
    this.version = data.version;
    this.name = data.name;
    this.file = data.file || "";
  }

  /** Returns all available versions */
  abstract versions(): Promise<string[]>;

  /** Returns a URL with a specific version/file */
  abstract at(version?: string, file?: string): string;
}

export function parse(
  ctor: RegistryCtor,
  url: string,
  atScope = true,
): RegistryUrl {
  // Scoped
  let match = atScope
    ? url.match(/[/:](@[^/:]+)\/([^/:]+)@([^/]+)(.*)$/)
    : url.match(/[/:]([^/:]+)\/([^/:]+)@([^/]+)(.*)$/);

  if (match) {
    return new ctor({
      url,
      version: match[3],
      name: `${match[1]}/${match[2]}`,
      file: match[4],
    });
  }

  // Unscoped
  match = url.match(/[/:]([^/:]+)@([^/]+)(.*)$/);

  if (match) {
    return new ctor({
      url,
      version: match[2],
      name: match[1],
      file: match[3],
    });
  }

  throw new Error(`Unable to parse ${url}`);
}

export interface RegistryCtor {
  new (data: ParseResult): RegistryUrl;
  parse(url: string): RegistryUrl;
  regexp: RegExp[];
}

export interface ParseResult {
  url?: string;
  version: string;
  name: string;
  file?: string;
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
