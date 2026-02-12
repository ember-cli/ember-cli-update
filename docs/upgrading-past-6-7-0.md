# Upgrading your Ember project past 6.7

`ember-cli@6.7.0` is the first release to publish the default app blueprint as
its own package [@ember-tooling/classic-build-app-blueprint][npm].

[npm]: https://www.npmjs.com/package/@ember-tooling/classic-build-app-blueprint

Starting with `ember@6.8`, creating an Ember application will use the new
Vite-based blueprint and build process.

## Moving to the new classic app blueprint

If you want to stay with the classic build process, you will need to update
`config/ember-cli-update.json` and replace the base blueprint:

```diff
@@ -2,13 +2,11 @@
{
  "schemaVersion": "1.0.0",
  "packages": [
    {
-      "name": "ember-cli",
-      "version": "6.7.0",
+      "name": "@ember-tooling/classic-build-app-blueprint",
+      "version": "6.7.1",
        "blueprints": [
          {
-          "name": "app",
-          "outputRepo": "https://github.com/ember-cli/ember-new-output",
-          "codemodsSource": "ember-app-codemods-manifest@1",
+          "name": "@ember-tooling/classic-build-app-blueprint",
          "isBaseBlueprint": true,
          "options": [
            "--ci-provider=github"
          ]
        }
      ]
    }
  ]
}
```

Re-run `ember-cli-update` after that.

## Moving to Vite

Use [ember-vite-codemod][mod] to upgrade your project. Then see [Already on Vite].

## Already on Vite

[Already on Vite]: #already-on-vite

You will also need to update
`config/ember-cli-update.json` and replace the base blueprint:

```diff
@@ -2,13 +2,11 @@
{
  "schemaVersion": "1.0.0",
  "packages": [
    {
-      "name": "ember-cli",
-      "version": "6.7.0",
+      "name": "@ember/app-blueprint",
+      "version": "6.7.1",
        "blueprints": [
          {
-          "name": "app",
-          "outputRepo": "https://github.com/ember-cli/ember-new-output",
-          "codemodsSource": "ember-app-codemods-manifest@1",
+          "name": "@ember/app-blueprint",
          "isBaseBlueprint": true,
          "options": [
            "--ci-provider=github"
          ]
        }
      ]
    }
  ]
}
```

Re-run `ember-cli-update` after that.

[mod]: https://github.com/mainmatter/ember-vite-codemod/
