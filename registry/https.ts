import { Package } from "./utils.ts";
import { join } from "../deps.ts";

export class Https extends Package {
  static type = "https";
  static regexp = [/https?:\/\/*/];

  static create(name: string): Promise<Https> {
    return new Https({ name, version: "0.0.0", type: this.type })
      .toLatestVersion();
  }

  static parse(url: string): Https {
    return new Https({
      version: "0.0.0",
      name: url,
      file: "",
      type: Https.type,
    })
  }

  get packageUrl(): string {
    return this.name;
  }

  versions(): Promise<string[]> {
    return Promise.resolve(["0.0.0"]);
  }

  at(_ = this.version, file = this.file): string {
    const url = new URL(this.name);
    url.pathname = join(url.pathname, file);
    return url.toString();
  }
}
