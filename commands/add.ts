import { getLatestVersion } from "../deps.ts";
import { Package, Registry } from "../registry/utils.ts";
import { DenoLand } from "../registry/denoland.ts";
import { JsDelivr } from "../registry/jsdelivr.ts";
import { Npm } from "../registry/npm.ts";
import { NestLand } from "../registry/nestland.ts";
import { Jsr } from "../registry/jsr.ts";
import { loadImportMap, saveImportMap } from "../import_map.ts";

const registries: Registry[] = [
  DenoLand,
  JsDelivr,
  Jsr,
  Npm,
  NestLand,
];

export default async function (names: string[]) {
  const importMap = await loadImportMap();

  for (const name of names) {
    for (const Registry of registries) {
      const pkg = await find(Registry, name);
      if (pkg) {
        console.log(`Adding ${pkg.name}@${pkg.version} from ${Registry.type}`);
        importMap.imports ??= {};
        importMap.imports[pkg.name + pkg.file] = pkg.at();
        break;
      }
    }
  }

  await saveImportMap(importMap);
}

async function find(
  Registry: Registry,
  name: string,
): Promise<Package | undefined> {
  try {
    const version = getLatestVersion(
      await new Registry({
        name,
        version: "",
        type: Registry.type,
      }).versions(),
    );

    const { type } = Registry;
    const file = type === "npm" || type === "jsr" ? "" : "/";

    return new Registry({
      name,
      version,
      type,
      file,
    });
  } catch {
    // Ignore
  }
}
