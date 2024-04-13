import { RegistryUrl } from "./utils.ts";

export class GithubRaw extends RegistryUrl {
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

  regexp =
    /https?:\/\/raw\.githubusercontent\.com\/[^\/\"\']+\/[^\/\"\']+\/(?!master)[^\/\"\']+\/[^\'\"]*/;

  all(): Promise<string[]> {
    const [user, repo] = this.name.split("/");
    return githubReleases(user, repo);
  }

  at(version: string): RegistryUrl {
    const parts = this.url.split("/");
    parts[5] = version;
    return new GithubRaw(parts.join("/"));
  }
}

export async function githubDownloadReleases(
  owner: string,
  repo: string,
  lastVersion: string | undefined = undefined,
): Promise<string[]> {
  let url = `https://github.com/${owner}/${repo}/releases.atom`;
  if (lastVersion) {
    url += `?after=${lastVersion}`;
  }
  // FIXME do we need to handle 404?

  const page = await fetch(url);
  const text = await page.text();
  return [
    ...text.matchAll(
      /\<id\>tag\:github\.com\,2008\:Repository\/\d+\/(.*?)\<\/id\>/g,
    ),
  ].map((x) => x[1]);
}

// export for testing purposes
// FIXME this should really be lazy, we shouldn't always iterate everything...
export const GR_CACHE: Map<string, string[]> = new Map<string, string[]>();
export async function githubReleases(
  owner: string,
  repo: string,
  cache: Map<string, string[]> = GR_CACHE,
): Promise<string[]> {
  const cacheKey = `${owner}/${repo}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }
  const versions = await githubDownloadReleases(owner, repo);
  if (versions.length === 10) {
    let lastVersion: string | undefined = undefined;
    // arbitrarily we're going to limit to 5 pages...?
    let i = 0;
    while (lastVersion !== versions[versions.length - 1] && i < 5) {
      i++;
      lastVersion = versions[versions.length - 1];
      versions.push(...await githubDownloadReleases(owner, repo, lastVersion));
    }
  }
  cache.set(cacheKey, versions);
  return versions;
}
