export { parseArgs } from "https://deno.land/std@0.224.0/cli/parse_args.ts";
export { expandGlob } from "https://deno.land/std@0.224.0/fs/expand_glob.ts";
export * as colors from "https://deno.land/std@0.224.0/fmt/colors.ts";
export { dirname } from "https://deno.land/std@0.224.0/path/dirname.ts";
export { Spinner } from "https://deno.land/std@0.224.0/cli/spinner.ts";
import { parse as parseVersion } from "https://deno.land/std@0.224.0/semver/parse.ts";
import { format } from "https://deno.land/std@0.224.0/semver/format.ts";
import { compare } from "https://deno.land/std@0.224.0/semver/compare.ts";
import { type SemVer } from "https://deno.land/std@0.224.0/semver/types.ts";

export interface Version extends SemVer {
  prefix?: string;
}

export function parse(version: string): Version {
  if (version.startsWith("v")) {
    return {
      prefix: "v",
      ...parseVersion(version.slice(1)),
    };
  }
  return parseVersion(version);
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
    throw new Error(`No valid versions found: ${versions.join(", ")}`);
  }

  const toString = format(latest);

  return latest.prefix ? latest.prefix + toString : toString;
}
