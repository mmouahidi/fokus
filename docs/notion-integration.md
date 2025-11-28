# Notion Integration Guide 

FOKUS allows you to export your processed items to Notion using the CSV import feature. This is perfect for maintaining a database of "Read" articles, "Watched" videos, or completed projects.

## How it Works
FOKUS exports your archived items as a **CSV (Comma Separated Values)** file. The columns are optimized to map automatically to Notion properties.

## CSV Columns
The exported CSV includes:
- **Title** (Name)
- **Type** (Select)
- **Summary** (Text)
- **Notes** (Text)
- **Tags** (Multi-select)
- **URL** (URL)
- **Date Archived** (Date)
- **Status** (Select - defaults to "Archived")

## Setup Workflow

### 1. Prepare Notion Database
1. Create a new **Database** in Notion (Table view is best).
2. Or use an existing database.
3. Ensure you have properties that match the CSV columns (Title, Type, URL, etc.).

### 2. Export from FOKUS
1. Go to **Settings** → **Export to Second Brain**.
2. Click **Notion / CSV**.
3. A `.csv` file will be downloaded (e.g., `fokus-notion-export-12345.csv`).

### 3. Import to Notion
1. Open your Notion page.
2. Click `...` (top right) → **Import**.
3. Select **CSV**.
4. Upload the file you downloaded from FOKUS.
5. Notion will create a **new database** with your items.
   - *Tip*: You can then move these items into your main "Second Brain" database by selecting them all and dragging them, or using "Move to".

### 4. Merge with Existing Database (Advanced)
If you want to import directly into an existing database:
1. Open your existing database.
2. Click `...` next to the `New` button → **Merge with CSV**.
3. Upload the file.
4. Map the columns if Notion doesn't detect them automatically.

## Tips
- **Notes Field**: The "Notes" you take in FOKUS will be imported as a text property. If you want them as page content, you might need to manually copy them, as Notion's CSV import has limitations on page body content.
