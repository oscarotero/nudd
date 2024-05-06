import { colors, getLatestVersion } from "../deps.ts";
import { Package, Registry } from "../registry/utils.ts";
import { DenoLand } from "../registry/denoland.ts";
import { JsDelivr } from "../registry/jsdelivr.ts";
import { Npm } from "../registry/npm.ts";
import { Jsr } from "../registry/jsr.ts";
import { loadImportMap, saveImportMap } from "../import_map.ts";

const registries: Registry[] = [
  DenoLand,
  JsDelivr,
  Jsr,
  Npm,
];

export default async function (names: string[]) {
  const importMap = await loadImportMap();

  pkg:
  for (const name of names) {
    for (const Registry of registries) {
      const pkg = await find(Registry, name);
      if (pkg) {
        console.log(
          `Adding ${
            colors.yellow(pkg.name + "@" + pkg.version)
          } from ${Registry.type}`,
        );
        importMap.imports ??= {};
        importMap.imports[pkg.name + pkg.file] = pkg.at();
        continue pkg;
      }
    }
    console.error(colors.red(`Unable to find ${name}`));
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
