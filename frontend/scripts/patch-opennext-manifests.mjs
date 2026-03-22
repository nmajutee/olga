import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const handlerPath = resolve(
  process.cwd(),
  ".open-next/server-functions/default/handler.mjs",
);

const missingManifestGuard = "if(handleMissing)return;";
const throwMarker = 'throw new Error(`Unexpected loadManifest(${path2}) call!`)}function evalManifest';

async function patchHandler() {
  const handlerSource = await readFile(handlerPath, "utf8");

  if (handlerSource.includes(missingManifestGuard)) {
    console.log("OpenNext manifest patch already applied.");
    return;
  }

  if (!handlerSource.includes(throwMarker)) {
    throw new Error(
      "Unable to find the OpenNext loadManifest marker in the generated handler.",
    );
  }

  const patchedSource = handlerSource.replace(
    throwMarker,
    `${missingManifestGuard}${throwMarker}`,
  );

  await writeFile(handlerPath, patchedSource, "utf8");
  console.log("Patched OpenNext manifest loader to respect handleMissing.");
}

patchHandler().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});