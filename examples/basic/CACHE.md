# Section Hash Cache Demo

This demo includes `.docsync-cache.json` to show how a committed section hash baseline can make stale source sections visible.

The cache records a previous hash for the `Quick Start` section in `README.md`:

```json
{
  "version": 1,
  "sources": {
    "README.md": {
      "sections": {
        "quick-start": "old-hash"
      }
    }
  }
}
```

Because the current `Quick Start` section no longer matches `old-hash`, the demo report includes one `outdated_section` issue.

In a real project, maintainers should commit `.docsync-cache.json` only after the source and translated docs are intentionally in sync. When the source docs change, DocSync Guard reports stale section risks against that committed baseline. After the translated docs are updated, refresh and recommit the cache baseline in the same documentation PR.

DocSync Guard v0.1 reads this cache but does not automatically generate, update, or commit it. Projects that do not maintain a cache baseline should set `rules.section_hash: false`.
