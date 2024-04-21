import { colors, getLatestVersion, Spinner } from "../deps.ts";
import type { Package as BasePackage, Registry } from "../registry/utils.ts";
import { DenoLand } from "../registry/denoland.ts";
import { JsDelivr } from "../registry/jsdelivr.ts";
import { Npm } from "../registry/npm.ts";
import { GithubRaw } from "../registry/github.ts";
import { GitlabRaw } from "../registry/gitlab.ts";
import { Unpkg } from "../registry/unpkg.ts";
import { Skypack } from "../registry/skypack.ts";
import { EsmSh } from "../registry/esm.ts";
import { NestLand } from "../registry/nestland.ts";
import { Jspm } from "../registry/jspm.ts";
import { Denopkg } from "../registry/denopkg.ts";
import { PaxDeno } from "../registry/paxdeno.ts";
import { Jsr } from "../registry/jsr.ts";
import { ImportMap, loadImportMap, saveImportMap } from "../import_map.ts";

const registries: Registry[] = [
  DenoLand,
  Unpkg,
  Denopkg,
  PaxDeno,
  Jspm,
  Skypack,
  EsmSh,
  GithubRaw,
  GitlabRaw,
  JsDelivr,
  NestLand,
  Npm,
  Jsr,
];

interface Package extends BasePackage {
  dependencies: Map<string, Package>;
  dependents: Map<string, Package>;
  imports?: ImportMap["imports"];
}

interface Info {
  roots: string[];
  modules: InfoModule[];
  redirects: string[];
  npmPackages: Record<string, InfoNmpPackage>;
}

interface InfoModule {
  kink: "esm";
  local: string;
  mediaType: string;
  specifier: string;
  dependencies?: InfoModuleDependency[];
}

interface InfoModuleDependency {
  specifier: string;
  code?: {
    specifier: string;
  };
  type?: {
    specifier: string;
  };
  npmPackage?: string;
}

interface InfoNmpPackage {
  name: string;
  version: string;
  dependencies: string[];
}

export interface DuplicatesOptions {
  // don't permanently edit files
  dryRun?: boolean;
}

export default async function (filename: string, options: DuplicatesOptions) {
  const spinner = new Spinner({ message: "Analyzing dependencies..." });
  spinner.start();

  const importMap = await loadImportMap();
  const info = await getInfo(filename);
  const graph = buildGraph(info, importMap.imports);
  spinner.stop();

  const before = JSON.stringify(importMap);
  fixDuplicates(graph, importMap);

  if (before === JSON.stringify(importMap)) {
    console.log(colors.green("No duplicates found"));
    return;
  }

  if (!options.dryRun) {
    saveImportMap(importMap);
    console.log(colors.green("Updated import map"));
  } else {
    console.log();
    console.log(
      "To fix duplicates, update the import map with the code below:",
    );
    console.log();
    console.log(colors.gray(JSON.stringify(importMap, null, 2)));
    console.log();
    console.log(
      "Or run with --no-dry-run to update the import map automatically.",
    );
  }
}

/** Inspect a graph and detect duplicated versions of the same package */
function fixDuplicates(graph: Graph, importMap: ImportMap) {
  const versions = new Map<string, Map<string, Package>>();

  // Map all packages by type:name and version
  for (const pkg of graph.packages.values()) {
    const key = `${pkg.type}:${pkg.name}`;

    if (!versions.has(key)) {
      versions.set(key, new Map());
    }

    versions.get(key)!.set(pkg.version, pkg);
  }

  // Map dependents to the latest version
  for (const [key, version] of versions.entries()) {
    if (version.size > 1) {
      console.log();
      console.log(colors.yellow(key));
      const latestVersion = getLatestVersion(Array.from(version.keys()));

      for (const [semver, pkg] of version) {
        if (semver === latestVersion) {
          console.log("  ", colors.green(semver));
          pkg.dependents.forEach((dep) => {
            console.log("    ", colors.dim(dep.id));
          });
          continue;
        }

        console.log("  ", colors.red(semver));
        pkg.dependents.forEach((dep) => {
          console.log("    ", colors.dim(dep.id));
          dep.imports ??= {};
          dep.imports[pkg.url] = pkg.at(latestVersion);
        });
      }
    }
  }

  // Remove old versions of duplicates
  for (const version of versions.values()) {
    if (version.size > 1) {
      const latestVersion = getLatestVersion(Array.from(version.keys()));

      for (const [semver, pkg] of version) {
        if (semver === latestVersion) {
          continue;
        }

        graph.packages.delete(pkg.id);
      }
    }
  }

  // Get all scopes
  const scopes = importMap.scopes ??= {};
  for (const pkg of graph.packages.values()) {
    if (!pkg.imports) {
      continue;
    }

    scopes[pkg.at()] = pkg.imports;
  }
}

async function getInfo(name: string): Promise<Info> {
  const command = new Deno.Command(Deno.execPath(), {
    args: ["info", name, "--json", "--no-lock"],
  });

  const result = await command.output();
  return JSON.parse(new TextDecoder().decode(result.stdout)) as Info;
}

function findInImports(
  specifier: string,
  imports: Record<string, string>,
): string | undefined {
  for (const key of Object.keys(imports)) {
    if (specifier.startsWith(key)) {
      return key;
    }
  }
}

interface Graph {
  packages: Map<string, Package>;
  local: Map<string, Map<string, Package>>;
}

/** Build the dependency tree of all packages */
function buildGraph(info: Info, imports: Record<string, string> = {}): Graph {
  const local = new Map<string, Map<string, Package>>();
  const packages = new Map<string, Package>();

  for (const module of info.modules) {
    // Local modules
    if (module.specifier.startsWith("file:")) {
      module.dependencies?.filter((d) => !d.specifier.startsWith("."))
        .forEach((d) => {
          const pkg = getPackage(d.code?.specifier || d.type?.specifier!);
          if (!pkg) {
            return;
          }

          if (!packages.has(pkg.id)) {
            packages.set(pkg.id, pkg);
          }

          if (!local.has(module.specifier)) {
            local.set(module.specifier, new Map());
          }

          local.get(module.specifier)!.set(
            findInImports(d.specifier, imports) || pkg.id,
            pkg,
          );
        });
      continue;
    }

    const pkg = getPackage(module.specifier);

    if (!pkg) {
      continue;
    }

    if (!packages.has(pkg.id)) {
      packages.set(pkg.id, pkg);
    }

    module.dependencies
      ?.filter((d) => !d.specifier.startsWith("."))
      .forEach((d) => {
        const dep = getPackage(d.code?.specifier || d.type?.specifier!);
        if (!dep) {
          return;
        }

        if (!packages.has(dep.id)) {
          packages.set(dep.id, dep);
        }
        packages.get(pkg.id)!.dependencies.set(dep.id, packages.get(dep.id)!);
        packages.get(dep.id)!.dependents.set(pkg.id, packages.get(pkg.id)!);
      });
  }

  for (const npmPackage of Object.values(info.npmPackages)) {
    const pkg = getPackage(`npm:${npmPackage.name}@${npmPackage.version}`);

    if (!pkg) {
      throw new Error(`Unable to parse NPM package ${npmPackage.name}`);
    }

    if (!packages.has(pkg.id)) {
      packages.set(pkg.id, pkg);
    }

    for (const dependency of npmPackage.dependencies) {
      const dep = getPackage(`npm:${dependency}`);

      if (!dep) {
        throw new Error(`Unable to parse NPM package ${dependency}`);
      }

      if (!packages.has(dep.id)) {
        packages.set(dep.id, dep);
      }
      packages.get(pkg.id)!.dependencies.set(dep.id, packages.get(dep.id)!);
      packages.get(dep.id)!.dependents.set(pkg.id, packages.get(pkg.id)!);
    }
  }

  return { packages, local };
}

/** Parse an URL and create a package instance */
function getPackage(url: string): Package | undefined {
  if (url.startsWith("file:")) {
    return;
  }

  for (const R of registries) {
    if (R.regexp.some((r) => r.test(url))) {
      const pkg = R.parse(url) as Package;
      pkg.file = pkg.file ? "/" : "";
      pkg.url = pkg.at();
      pkg.dependencies = new Map();
      pkg.dependents = new Map();
      return pkg;
    }
  }

  // console.log("Unable to find registry for " + url);
}
