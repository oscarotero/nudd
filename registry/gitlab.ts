import { readJson, RegistryUrl } from "./utils.ts";

async function gitlabReleases(
  owner: string,
  repo: string,
): Promise<string[]> {
  const url =
    `https://gitlab.com/api/v4/projects/${owner}%2F${repo}/repository/tags`;
  return await readJson(url, (json) => {
    return json.map((tag: { name: string }) => tag.name);
  });
}

export class GitlabRaw extends RegistryUrl {
  static regexp =
    /https?:\/\/gitlab\.com\/[^\/\"\']+\/[^\/\"\']+\/-\/raw\/(?!master)[^\/\"\']+\/[^\'\"]*/;

  get version(): string {
    const v = this.url.split("/")[7];
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
    const [user, repo] = this.name.split("/");
    return gitlabReleases(user, repo);
  }

  at(version: string): RegistryUrl {
    const parts = this.url.split("/");
    parts[7] = version;
    return new GitlabRaw(parts.join("/"));
  }
}
