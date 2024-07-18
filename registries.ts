import type { Registry } from "./registry/utils.ts";
import { DenoLand } from "./registry/denoland.ts";
import { DenoRe } from "./registry/denore.ts";
import { JsDelivr } from "./registry/jsdelivr.ts";
import { Npm } from "./registry/npm.ts";
import { GithubRaw } from "./registry/github.ts";
import { GitlabRaw } from "./registry/gitlab.ts";
import { Unpkg } from "./registry/unpkg.ts";
import { Skypack } from "./registry/skypack.ts";
import { EsmSh } from "./registry/esm.ts";
import { NestLand } from "./registry/nestland.ts";
import { Jspm } from "./registry/jspm.ts";
import { Denopkg } from "./registry/denopkg.ts";
import { PaxDeno } from "./registry/paxdeno.ts";
import { Jsr } from "./registry/jsr.ts";

export const registries: Registry[] = [
  DenoLand,
  Unpkg,
  Denopkg,
  DenoRe,
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
