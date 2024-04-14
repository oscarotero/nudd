import { ParseResult, readJson, RegistryUrl } from "./utils.ts";

export class GitlabRaw extends RegistryUrl {
  static regexp = [
    /https?:\/\/gitlab\.com\/[^/"']+\/[^/"']+\/-\/raw\/(?!master)[^/"']+\/[^'"]*/,
  ];

  parse(): ParseResult {
    const match = this.url.match(
      /https?:\/\/gitlab\.com\/([^/]+\/[^/]+)\/-\/raw\/([^/]+)(.*)/,
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

  async versions(): Promise<string[]> {
    const id = this.name.replaceAll("/", "%2F");

    return await readJson(
      `https://gitlab.com/api/v4/projects/${id}/repository/tags`,
      (json) => json.map((tag: { name: string }) => tag.name),
    );
  }

  at(version: string): string {
    return `https://gitlab.com/${this.name}/-/raw/${version}${this.file}`;
  }
}
