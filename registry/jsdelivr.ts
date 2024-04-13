import { RegistryUrl } from "./utils.ts";
import { GithubRaw, githubReleases } from "./github.ts";

export class JsDelivr extends RegistryUrl {
  static regexp =
    /https?:\/\/cdn\.jsdelivr\.net\/gh\/[^\/\"\']+\/[^\/\"\']+@(?!master)[^\/\"\']+\/[^\'\"]*/;

  get version(): string {
    const { version } = this.parts();
    if (version === undefined) {
      throw Error(`Unable to find version in ${this.url}`);
    }
    return version;
  }

  get name(): string {
    const { user, repo } = this.parts();
    return `${user}/${repo}`;
  }

  parts(): { parts: string[]; repo: string; user: string; version: string } {
    const parts = this.url.split("/");
    const [repo, version] = parts[5].split("@");
    return {
      user: parts[4],
      repo,
      version,
      parts,
    };
  }

  all(): Promise<string[]> {
    const [user, repo] = this.name.split("/");
    return githubReleases(user, repo);
  }

  at(version: string): RegistryUrl {
    const { parts, repo } = this.parts();
    parts[5] = `${repo}@${version}`;
    return new GithubRaw(parts.join("/"));
  }
}
