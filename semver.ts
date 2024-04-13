import { parse as parseSemVer } from "https://deno.land/std@0.222.1/semver/parse.ts";
import { format } from "https://deno.land/std@0.222.1/semver/format.ts";
import { compare } from "https://deno.land/std@0.222.1/semver/compare.ts";
import { type SemVer } from "https://deno.land/std@0.222.1/semver/types.ts";

export interface Version extends SemVer {
  prefix?: string;
}

export function parse(version: string): Version {
  if (version.startsWith("v")) {
    return {
      prefix: "v",
      ...parseSemVer(version.slice(1)),
    };
  }
  return parseSemVer(version);
}

export function getLatestVersion(versions: string[]): string {
  const validVersions: Version[] = [];

  for (const version of versions) {
    try {
      const parsed = parse(version);

      if (parsed.prerelease?.length) {
        continue;
      }
      validVersions.push(parsed);
    } catch {
      // ignore invalid versions
    }
  }

  validVersions.sort(compare);
  const latest = validVersions.pop();

  if (!latest) {
    throw new Error("No valid versions found");
  }

  const toString = format(latest);

  return latest.prefix ? latest.prefix + toString : toString;
}
