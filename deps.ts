export { parseArgs } from "https://deno.land/std@0.224.0/cli/parse_args.ts";
export { expandGlob } from "https://deno.land/std@0.224.0/fs/expand_glob.ts";
export * as colors from "https://deno.land/std@0.224.0/fmt/colors.ts";
export { dirname } from "https://deno.land/std@0.224.0/path/dirname.ts";
export { join } from "https://deno.land/std@0.224.0/path/posix/join.ts";
export { Spinner } from "https://deno.land/std@0.224.0/cli/spinner.ts";
import { parse as parseVersion } from "https://deno.land/std@0.224.0/semver/parse.ts";
import { compare } from "https://deno.land/std@0.224.0/semver/compare.ts";
import { type SemVer } from "https://deno.land/std@0.224.0/semver/types.ts";

export interface Version extends SemVer {
  name: string;
}

export function parse(version: string): Version {
  const name = version;
  if (version.startsWith("v")) {
    return {
      ...parse(version.slice(1)),
      name,
    };
  }
  if (version.match(/^\d+\.\d+$/)) {
    version += ".0";
  } else if (version.match(/^\d+$/)) {
    version += ".0.0";
  }
  return {
    name,
    ...parseVersion(version),
  };
}

export function getLatestVersion(
  versions: [string, string | undefined][],
  minimumAge?: string,
): string {
  const validVersions: Version[] = [];

  for (const [version, age] of versions) {
    try {
      const parsed = parse(version);

      if (parsed.prerelease?.length) {
        continue;
      }
      if (minimumAge && age && age > minimumAge) {
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

  return latest.name;
}
