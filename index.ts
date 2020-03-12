export * from "./component";
export * from "./tempseal-document";
export * from "./components/components";

export * as SideEffects from "./side-effect/side-effects";
export * from "./side-effect/css"
export * from "./side-effect/scss"
export * from "./side-effect/title";
export * from "./side-effect/html-chunk";
export * from "./side-effect/file";

export { SideEffect, MetaSideEffect } from "./side-effect/side-effect";
export * as CompilePipeline from "./compile-pipeline";

export * as Config from "./config/config";
export * from "./embed-component";
export * from "./render-to-file";

export type THeaderLevel = 1|2|3|4|5|6;
