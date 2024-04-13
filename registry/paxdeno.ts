import {
  defaultAt,
  defaultName,
  defaultVersion,
  RegistryUrl,
} from "./utils.ts";
import { githubReleases } from "./github.ts";

export class PaxDeno extends RegistryUrl {
  static regexp = /https?:\/\/pax.deno.dev\/[^\/\"\']*?\/[^\/\"\']*?\@[^\'\"]*/;

  get version(): string {
    return defaultVersion(this);
  }

  get name(): string {
    const owner = this.url.split("/")[3];
    const name = defaultName(this);

    return `${owner}/${name}`;
  }

  async all(): Promise<string[]> {
    const [owner, name] = this.name.split("/");
    return await githubReleases(owner, name);
  }

  at(version: string): RegistryUrl {
    const url = defaultAt(this, version);
    return new PaxDeno(url);
  }
}
