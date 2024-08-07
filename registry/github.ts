import { Package, readJson } from "./utils.ts";

export class GithubRaw extends Package {
  static type = "github";
  static regexp = [
    /https?:\/\/raw\.githubusercontent\.com\/[^/"']+\/[^/"']+\/(?!master)[^/"']+\/[^'"\s]*/,
  ];

  static create(name: string): Promise<GithubRaw> {
    return new GithubRaw({ name, version: "0.0.0", type: this.type })
      .toLatestVersion();
  }

  static parse(url: string): GithubRaw {
    const match = url.match(
      /https?:\/\/raw\.githubusercontent\.com\/([^/]+\/[^/]+)\/([^/]+)(.*)/,
    );

    if (match === null) {
      throw new Error(`Unable to parse ${url}`);
    }
    return new GithubRaw({
      name: match[1],
      version: match[2],
      file: match[3],
      type: GithubRaw.type,
    });
  }

  get packageUrl(): string {
    return `https://github.com/${this.name}`;
  }

  versions(): Promise<string[]> {
    return githubVersions(this.name);
  }

  at(version = this.version, file = this.file): string {
    return `https://raw.githubusercontent.com/${this.name}/${version}${file}`;
  }
}

export async function githubVersions(repo: string): Promise<string[]> {
  const url = `https://api.github.com/repos/${repo}/tags?per_page=100`;
  return await readJson(url, (json) =>
    // deno-lint-ignore no-explicit-any
    json.map((x: any) => x.name));
}
