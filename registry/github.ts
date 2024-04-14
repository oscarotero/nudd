import { ParseResult, readJson, RegistryUrl } from "./utils.ts";

export class GithubRaw extends RegistryUrl {
  static regexp = [
    /https?:\/\/raw\.githubusercontent\.com\/[^/"']+\/[^/"']+\/(?!master)[^/"']+\/[^'"]*/,
  ];

  parse(): ParseResult {
    const match = this.url.match(
      /https?:\/\/raw\.githubusercontent\.com\/([^/]+\/[^/]+)\/([^/]+)(.*)/,
    );

    if (match === null) {
      throw new Error(`Unable to parse ${this.url}`);
    }
    return {
      name: match[1],
      version: match[2],
      file: match[3],
    };
  }

  versions(): Promise<string[]> {
    return githubVersions(this.name);
  }

  at(version: string): string {
    return `https://raw.githubusercontent.com/${this.name}/${version}${this.file}`;
  }
}

export async function githubVersions(repo: string): Promise<string[]> {
  const url = `https://api.github.com/repos/${repo}/tags`;
  return await readJson(url, (json) =>
    // deno-lint-ignore no-explicit-any
    json.map((x: any) => x.name));
}
