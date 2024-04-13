import { RegistryUrl } from "./utils.ts";
import { GithubRaw } from "./github.ts";

async function gitlabDownloadReleases(
  owner: string,
  repo: string,
  page: number,
): Promise<string[]> {
  const url =
    `https://gitlab.com/${owner}/${repo}/-/tags?format=atom&page=${page}`;

  const text = await (await fetch(url)).text();
  return [
    ...text.matchAll(
      /\<id\>https\:\/\/gitlab.com.+\/-\/tags\/(.+?)\<\/id\>/g,
    ),
  ].map((x) => x[1]);
}

// export for testing purposes
// FIXME this should really be lazy, we shouldn't always iterate everything...
export const GL_CACHE: Map<string, string[]> = new Map<string, string[]>();
async function gitlabReleases(
  owner: string,
  repo: string,
  cache: Map<string, string[]> = GL_CACHE,
): Promise<string[]> {
  const cacheKey = `${owner}/${repo}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }
  // to roughly match GitHub above (5 pages, 10 releases each), we'll
  // limit to 3 pages, 20 releases each
  let i = 1;
  const versions = await gitlabDownloadReleases(owner, repo, i);
  if (versions.length === 20) {
    let lastVersion: string | undefined = undefined;
    while (lastVersion !== versions[versions.length - 1] && i <= 3) {
      i++;
      lastVersion = versions[versions.length - 1];
      versions.push(...await gitlabDownloadReleases(owner, repo, i));
    }
  }
  cache.set(cacheKey, versions);
  return versions;
}

export class GitlabRaw extends RegistryUrl {
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

  regexp =
    /https?:\/\/gitlab\.com\/[^\/\"\']+\/[^\/\"\']+\/-\/raw\/(?!master)[^\/\"\']+\/[^\'\"]*/;

  all(): Promise<string[]> {
    const [user, repo] = this.name.split("/");
    return gitlabReleases(user, repo);
  }

  at(version: string): RegistryUrl {
    const parts = this.url.split("/");
    parts[7] = version;
    return new GithubRaw(parts.join("/"));
  }
}
