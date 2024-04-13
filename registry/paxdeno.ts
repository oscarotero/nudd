import {
  defaultAt,
  defaultName,
  defaultVersion,
  RegistryUrl,
} from "./utils.ts";
import { githubReleases } from "./github.ts";

export class PaxDeno extends RegistryUrl {
  async all(): Promise<string[]> {
    const owner = this.url.split("/")[3];
    return await githubReleases(owner, defaultName(this));
  }

  at(version: string): RegistryUrl {
    const url = defaultAt(this, version);
    return new PaxDeno(url);
  }

  version(): string {
    return defaultVersion(this);
  }

  regexp = /https?:\/\/pax.deno.dev\/[^\/\"\']*?\/[^\/\"\']*?\@[^\'\"]*/;
}
