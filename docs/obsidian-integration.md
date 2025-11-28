# Obsidian Integration Guide 💎

FOKUS is designed to be the "capture frontend" for Obsidian. Use FOKUS to capture and process raw inputs, then export polished notes to your Obsidian vault.

## How it Works
FOKUS exports your archived items as individual Markdown (`.md`) files. These files are formatted with **YAML Frontmatter** and standard Markdown syntax, making them instantly usable in Obsidian.

## Export Format
Each exported file looks like this:

```markdown
---
title: "The Future of AI"
type: article
tags: [ai, tech, future]
url: https://example.com/article
created: 2023-10-27T10:00:00.000Z
completed: 2023-10-28T14:30:00.000Z
---

# The Future of AI

## Summary
An interesting article about how AI agents will evolve...

## 📝 Key Takeaways
- Agents will become more autonomous
- Context windows are the new RAM
- ...

## Metadata
- **Type**: article
- **Time Estimate**: 5 min
- **Tags**: #ai #tech #future

[Open Link](https://example.com/article)
```

## Setup Workflow

1. **Create an Inbox Folder in Obsidian**
   - In your Obsidian vault, create a folder named `Inbox` or `FOKUS Imports`.

2. **Export from FOKUS**
   - Go to **Settings** → **Export to Second Brain**.
   - Click **Obsidian / Markdown**.
   - A `.md` file (or zip of files) will be downloaded.

3. **Move to Obsidian**
   - Drag and drop the downloaded file(s) into your Obsidian `Inbox` folder.

4. **(Optional) Use "Obsidian Local REST API"**
   - For advanced users, you can script the movement of files directly if you set up a local server, but the manual drag-and-drop is the simplest reliable method.

## Tips
- **Dataview Plugin**: The exported frontmatter works perfectly with the Obsidian Dataview plugin. You can query your FOKUS items like this:
  ```dataview
  TABLE type, completed
  FROM "Inbox"
  WHERE type = "article"
  ```
- **Templates**: You can customize the export format in `src/lib/exporters.ts` if you want to match your specific Obsidian templates.
