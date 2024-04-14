import { defaultAt, defaultVersion, RegistryUrl } from "./registry/utils.ts";
import { DenoLand } from "./registry/denoland.ts";

export {
  assert,
  assertEquals,
  assertThrows,
  assertThrowsAsync,
} from "https://deno.land/std@0.80.0/testing/asserts.ts";

export class FakeRegistry implements RegistryUrl {
  url: string;

  constructor(url: string) {
    this.url = url;
  }

  // deno-lint-ignore require-await
  async all(): Promise<string[]> {
    return ["0.0.2", "0.0.1"];
  }

  at(version: string): RegistryUrl {
    const url = defaultAt(this, version);
    return new FakeRegistry(url);
  }

  get version(): string {
    return defaultVersion(this);
  }

  get name(): string {
    return this.url.split("/")[3];
  }

  regexp = /https?:\/\/fakeregistry.com\/[^\/\"\']*?\@[^\'\"]*/;
}

export class FakeDenoLand extends DenoLand {
  // deno-lint-ignore require-await
  async all(): Promise<string[]> {
    return ["0.35.0", "0.34.0"];
  }
}
