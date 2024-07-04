import { Package, readJson } from "./utils.ts";

export class GitlabRaw extends Package {
  static type = "gitlab";
  static regexp = [
    /https?:\/\/gitlab\.com\/[^/"']+\/[^/"']+\/-\/raw\/(?!master)[^/"']+\/[^'"\s]*/,
  ];

  static parse(url: string): GitlabRaw {
    const match = url.match(
      /https?:\/\/gitlab\.com\/([^/]+\/[^/]+)\/-\/raw\/([^/]+)(.*)/,
    );

    if (match === null) {
      throw new Error(`Unable to parse ${url}`);
    }

    return new GitlabRaw({
      url,
      name: match[1],
      version: match[2],
      file: match[3],
      type: GitlabRaw.type,
    });
  }

  get packageUrl(): string {
    return `https://gitlab.com/${this.name}`;
  }

  async versions(): Promise<string[]> {
    const id = this.name.replaceAll("/", "%2F");

    return await readJson(
      `https://gitlab.com/api/v4/projects/${id}/repository/tags`,
      (json) => json.map((tag: { name: string }) => tag.name),
    );
  }

  at(version = this.version, file = this.file): string {
    return `https://gitlab.com/${this.name}/-/raw/${version}${file}`;
  }
}
