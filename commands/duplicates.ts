import { colors, getLatestVersion, Spinner } from "../deps.ts";
import { RegistryCtor, RegistryUrl } from "../registry/utils.ts";
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
import { loadImportMap, saveImportMap } from "../import_map.ts";

const registries: RegistryCtor[] = [
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

interface Duplicates {
  registry: string;
  name: string;
  versions: DuplicatedVersion[];
}

interface DuplicatedVersion {
  version: string;
  specifier: string;
  dependents: string[];
}

export default async function (filename: string, options: DuplicatesOptions) {
  const spinner = new Spinner({ message: "Analyzing dependencies..." });
  spinner.start();

  const info = await getInfo(filename);
  const graph = buildGraph(info);

  spinner.stop();
  const duplicates: Duplicates[] = [];

  for (const [regName, registry] of Object.entries(graph.remote)) {
    for (const [pkgName, pkg] of Object.entries(registry)) {
      if (Object.keys(pkg).length === 1) {
        continue;
      }

      const versions: DuplicatedVersion[] = [];

      for (const [verName, version] of Object.entries(pkg)) {
        const dependents = findDependent(version.specifier, graph);
        versions.push({
          version: verName,
          specifier: version.specifier,
          dependents,
        });
      }

      duplicates.push({ registry: regName, name: pkgName, versions });
    }
  }

  if (duplicates.length === 0) {
    console.log("No duplicates found.");
    return;
  }

  console.log("Duplicates found:");

  const importMap = await loadImportMap();
  const scopes = importMap.scopes ??= {};

  for (const duplicate of duplicates) {
    const latest = getLatestVersion(duplicate.versions.map((v) => v.version));
    const specifier = duplicate.versions.find((v) =>
      v.version === latest
    )!.specifier;

    console.log();
    console.log(
      `${colors.yellow(duplicate.name)} ${
        colors.dim(`(${duplicate.registry.toLocaleLowerCase()})`)
      }`,
    );

    for (const version of duplicate.versions) {
      if (version.version === latest) {
        console.log(" -", colors.green(version.version));
      } else {
        console.log(" -", colors.red(version.version));
      }

      for (const dependent of version.dependents) {
        console.log(`   ${colors.dim(dependent)}`);
      }

      if (version.version === latest) {
        continue;
      }

      for (const dep of version.dependents) {
        const scope = scopes[dep] ??= {};
        scope[version.specifier] = specifier;
      }
    }
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

function findDependent(id: string, graph: Graph): string[] {
  const dependents: string[] = [];

  for (const registry of Object.values(graph.remote)) {
    for (const pkg of Object.values(registry)) {
      for (const version of Object.values(pkg)) {
        if (version.dependencies.has(id)) {
          dependents.push(version.specifier);
        }
      }
    }
  }

  for (const [specifier, dependencies] of Object.entries(graph.local)) {
    if (dependencies.includes(id)) {
      dependents.push(specifier);
    }
  }

  return dependents;
}

async function getInfo(name: string): Promise<Info> {
  const command = new Deno.Command(Deno.execPath(), {
    args: ["info", name, "--json", "--no-lock"],
  });

  const result = await command.output();
  return JSON.parse(new TextDecoder().decode(result.stdout)) as Info;
}
interface Graph {
  remote: Record<string, Registry>;
  local: Record<string, string[]>;
}
type Registry = Record<string, Package>;
type Package = Record<string, Version>;
interface Version {
  specifier: string;
  dependencies: Set<string>;
}

function buildGraph(info: Info): Graph {
  const graph: Graph = {
    remote: {},
    local: {},
  };

  for (const module of info.modules) {
    // Local modules
    if (module.specifier.startsWith("file:")) {
      module.dependencies?.filter((d) => !d.specifier.startsWith("."))
        .forEach((d) => {
          const specifier = getRegistry(
            d.code?.specifier || d.type?.specifier!,
          );
          if (specifier) {
            graph.local[module.specifier] ??= [];
            graph.local[module.specifier].push(getId(specifier));
          }
        });
      continue;
    }

    const reg = getRegistry(module.specifier);

    if (!reg) {
      continue;
    }

    const registryId = reg.constructor.name;
    const registry = graph.remote[registryId] ??= {};
    const pkg = registry[reg.name] ??= {};

    const version = pkg[reg.version] ??= {
      specifier: getId(reg),
      dependencies: new Set(),
    };

    module.dependencies
      ?.filter((d) => !d.specifier.startsWith("."))
      .forEach((d) => {
        const specifier = getRegistry(d.code?.specifier || d.type?.specifier!);
        if (specifier) {
          version.dependencies.add(getId(specifier));
        }
      });
  }

  for (const npmPackage of Object.values(info.npmPackages)) {
    const reg = new Npm({
      name: npmPackage.name,
      version: npmPackage.version,
    });
    const registry = graph.remote.Npm ??= {};
    const pkg = registry[reg.name] ??= {};
    const version = pkg[reg.version] ??= {
      specifier: getId(reg),
      dependencies: new Set(),
    };

    for (const dependency of npmPackage.dependencies) {
      version.dependencies.add(getNpmCanonical(dependency));
    }
  }

  return graph;
}

function getId(url: RegistryUrl): string {
  return url.at(undefined, url.file ? "/" : "");
}

function getRegistry(url: string): RegistryUrl | undefined {
  if (url.startsWith("file:")) {
    return;
  }

  for (const R of registries) {
    if (R.regexp.some((r) => r.test(url))) {
      return R.parse(url);
    }
  }

  // console.log("Unable to find registry for " + url);
}

function getNpmCanonical(url: string): string {
  const spec = Npm.parse(`npm:${url}`);
  return getId(spec);
}
