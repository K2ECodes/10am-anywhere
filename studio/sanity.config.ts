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
  plugins: [
    structureTool({
      // "Homepage" is a single fixed document pinned to the top of the list.
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Homepage")
              .id("homepage")
              .child(S.document().schemaType("homepage").documentId("homepage")),
            S.divider(),
            ...S.documentTypeListItems().filter((item) => item.getId() !== "homepage"),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes as never,
    // No "new Homepage" button: there is only ever the one.
    templates: (templates) => templates.filter((t) => t.schemaType !== "homepage"),
  },
  document: {
    actions: (actions, ctx) =>
      ctx.schemaType === "homepage"
        ? actions.filter((a) => !["unpublish", "delete", "duplicate"].includes(a.action ?? ""))
        : actions,
  },
});
