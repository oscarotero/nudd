import { assert, assertEquals } from "./test_deps.ts";
import { registry, REGISTRIES } from "./registry.ts";

Deno.test(function denolandStd() {
  const url = "https://deno.land/std@0.35.0/foo.ts";
  const v = registry(url, REGISTRIES);
  assert(v !== undefined);

  const vAt = v.at("0.1.0");
  assertEquals(vAt.url, "https://deno.land/std@0.1.0/foo.ts");
});

Deno.test(function denolandX() {
  const url = "https://deno.land/x/foo@0.1.0/foo.ts";
  const v = registry(url, REGISTRIES);
  assert(v !== undefined);

  const vAt = v.at("0.2.0");
  assertEquals(vAt.url, "https://deno.land/x/foo@0.2.0/foo.ts");
});