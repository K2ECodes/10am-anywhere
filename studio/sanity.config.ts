import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "../sanity/schemas";

// 10am Studio. The schema is shared with the website (../sanity/schemas) so the
// CMS and the site never drift. Set the project id below (or via env) after you
// create the Sanity project in 10am's name.
export default defineConfig({
  name: "default",
  title: "10am",
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || "REPLACE_WITH_PROJECT_ID",
  dataset: process.env.SANITY_STUDIO_DATASET || "production",
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes as never },
});
