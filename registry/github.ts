import { readJson, RegistryUrl } from "./utils.ts";

export class GithubRaw extends RegistryUrl {
  static regexp =
    /https?:\/\/raw\.githubusercontent\.com\/[^\/\"\']+\/[^\/\"\']+\/(?!master)[^\/\"\']+\/[^\'\"]*/;

  get version(): string {
    const v = this.url.split("/")[5];
    if (v === undefined) {
      throw Error(`Unable to find version in ${this.url}`);
    }
    return v;
  }

  get name(): string {
    const [, , , user, repo] = this.url.split("/");
    return `${user}/${repo}`;
  }

  all(): Promise<string[]> {
    return githubReleases(this.name);
  }

  at(version: string): RegistryUrl {
    const parts = this.url.split("/");
    parts[5] = version;
    return new GithubRaw(parts.join("/"));
  }
}

export async function githubReleases(repo: string): Promise<string[]> {
  const url = `https://api.github.com/repos/${repo}/releases`;
  return await readJson(url, (json) =>
    // deno-lint-ignore no-explicit-any
    json.map((x: any) => x.tag_name));
}
