import { assertEquals } from "https://deno.land/std@0.222.1/assert/assert_equals.ts";
import { cache } from "../registry/utils.ts";
import { update } from "../commands/update.ts";
import { registries } from "../registries.ts";

const versions = Promise.resolve(["0.2.0"]);

cache.set("https://cdn.deno.land/foo_bar/meta/versions.json", versions);
cache.set("https://data.jsdelivr.com/v1/package/gh/foo/bar", versions);
cache.set("https://data.jsdelivr.com/v1/package/npm/foo-bar", versions);
cache.set("https://data.jsdelivr.com/v1/package/npm/@foo/bar", versions);
cache.set("https://registry.npmjs.org/foo-bar", versions);
cache.set("https://registry.npmjs.org/@foo/bar", versions);
cache.set("https://api.github.com/repos/foo/bar/tags?per_page=100", versions);
cache.set(
  "https://gitlab.com/api/v4/projects/foo%2Fbar/repository/tags",
  versions,
);
cache.set("https://x.nest.land/api/package/foo-bar", versions);
cache.set("https://jsr.io/@foo/bar/meta.json", versions);

Deno.test("Update dependencies in code", async () => {
  await Deno.copyFile("tests/code.txt", "tests/code-tmp.txt");

  await update("tests/code-tmp.txt", { dryRun: false });

  const result = await Deno.readTextFile("tests/code-tmp.txt");
  const expected = await Deno.readTextFile("tests/code-expected.txt");

  assertEquals(result, expected);
});

Deno.test("Update dependencies in import maps", async () => {
  await Deno.copyFile("tests/import-map.json", "tests/import-map-tmp.json");

  await update("tests/import-map-tmp.json", { dryRun: false });

  const result = await Deno.readTextFile("tests/import-map-tmp.json");
  const expected = await Deno.readTextFile("tests/import-map-expected.json");

  assertEquals(result, expected);
});

Deno.test("Create packages", async () => {
  for (const registry of registries) {
    let name = "";
    switch (registry.type) {
      case "denoland":
        name = "foo_bar";
        break;
      case "jspm":
      case "unpkg":
      case "nestland":
        name = "foo-bar";
        break;
      case "jsdelivr":
      case "github":
      case "gitlab":
      case "paxdeno":
      case "denopkg":
      case "denore":
        name = "foo/bar";
        break;
      case "npm":
      case "esm.sh":
      case "jsr":
      case "skypack":
        name = "@foo/bar";
        break;
    }

    const pkg = await registry.create(name);
    assertEquals(pkg.name, name);
    assertEquals(pkg.version, "0.2.0");
    assertEquals(pkg.file, "");
  }
});
