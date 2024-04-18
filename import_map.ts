export interface ImportMap {
  imports?: Record<string, string>;
  scopes?: Record<string, Record<string, string>>;
}

export interface DenoConfig extends ImportMap {
  importMap?: string;
}

export async function loadDenoConfig(): Promise<DenoConfig> {
  const content = await Deno.readTextFile("deno.json");
  return JSON.parse(content) as DenoConfig;
}

export async function loadImportMap(): Promise<ImportMap> {
  const config = await loadDenoConfig();

  if (config.importMap) {
    return await JSON.parse(
      await Deno.readTextFile(config.importMap),
    ) as ImportMap;
  }

  const map = {} as ImportMap;

  if (config.imports) {
    map.imports = config.imports;
  }
  if (config.scopes) {
    map.scopes = config.scopes;
  }

  return map;
}

export async function saveImportMap(map: ImportMap): Promise<void> {
  const config = await loadDenoConfig();

  if (config.importMap) {
    await Deno.writeTextFile(config.importMap, JSON.stringify(map, null, 2));
  }

  config.imports = map.imports;
  config.scopes = map.scopes;
  await Deno.writeTextFile("deno.json", JSON.stringify(config, null, 2));
}
