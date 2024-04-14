export abstract class RegistryUrl {
  url: string;
  version: string;
  name: string;
  file: string;

  constructor(url: string) {
    this.url = url;

    const { version, name, file } = this.parse();

    this.version = version;
    this.name = name;
    this.file = file;
  }

  parse(atScope = true): ParseResult {
    // Scoped
    let match = atScope
      ? this.url.match(/[/:](@[^/:]+)\/([^/:]+)@([^/]+)(.*)$/)
      : this.url.match(/[/:]([^/:]+)\/([^/:]+)@([^/]+)(.*)$/);

    if (match) {
      return {
        version: match[3],
        name: `${match[1]}/${match[2]}`,
        file: match[4],
      };
    }

    // Unscoped
    match = this.url.match(/[/:]([^/:]+)@([^/]+)(.*)$/);

    if (match) {
      return {
        version: match[2],
        name: match[1],
        file: match[3],
      };
    }

    throw new Error(`Unable to parse version in ${this.url}`);
  }

  /** Returns all available versions */
  abstract versions(): Promise<string[]>;

  /** Returns a URL with a specific version */
  abstract at(version: string): string;
}

export interface RegistryCtor {
  new (url: string): RegistryUrl;
  regexp: RegExp[];
}

export interface ParseResult {
  version: string;
  name: string;
  file: string;
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

export function importUrls(
  content: string,
  registries: RegistryCtor[],
): RegistryUrl[] {
  const urls: RegistryUrl[] = [];

  for (const R of registries) {
    const allRegexp = R.regexp.map((r) =>
      new RegExp(`['"]${r.source}['"]`, "g")
    );

    for (const regexp of allRegexp) {
      const match = content.match(regexp);
      match?.forEach((url) =>
        urls.push(new R(url.replace(/['"]/g, "") as string))
      );
    }
  }

  return urls;
}
