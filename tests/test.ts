import { assertEquals } from "https://deno.land/std@0.222.1/assert/assert_equals.ts";
import { cache } from "../registry/utils.ts";
import { up } from "../mod.ts";

const versions = Promise.resolve(["0.2.0"]);

cache.set("https://registry.deno.land/x/foo-bar/versions", versions);
cache.set("https://registry.npmjs.org/foo-bar", versions);
cache.set("https://registry.npmjs.org/@foo/bar", versions);
cache.set("https://api.github.com/repos/foo/bar/tags", versions);
cache.set(
  "https://gitlab.com/api/v4/projects/foo%2Fbar/repository/tags",
  versions,
);
cache.set("https://x.nest.land/api/package/foo-bar", versions);

Deno.test("Update dependencies", async () => {
  await Deno.copyFile("tests/imports.txt", "tests/imports-tmp.txt");

  await up("tests/imports-tmp.txt", { dryRun: false });

  const result = await Deno.readTextFile("tests/imports-tmp.txt");
  const expected = await Deno.readTextFile("tests/expected.txt");

  assertEquals(result, expected);
});
