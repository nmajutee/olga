import { getDb, newId } from "@/lib/db";

export type NavItem = {
  id: string;
  location: "header" | "footer";
  labelEn: string;
  labelFr: string;
  href: string;
  sortOrder: number;
  visible: boolean;
};

type Row = {
  id: string;
  location: "header" | "footer";
  label_en: string;
  label_fr: string;
  href: string;
  sort_order: number;
  visible: number;
};

const toItem = (row: Row): NavItem => ({
  id: row.id,
  location: row.location,
  labelEn: row.label_en,
  labelFr: row.label_fr,
  href: row.href,
  sortOrder: row.sort_order,
  visible: row.visible === 1,
});

export async function listNav(location?: "header" | "footer"): Promise<NavItem[]> {
  try {
    const db = await getDb();
    const statement = location
      ? db
          .prepare("SELECT * FROM nav_items WHERE location = ? ORDER BY sort_order ASC")
          .bind(location)
      : db.prepare("SELECT * FROM nav_items ORDER BY location ASC, sort_order ASC");

    const { results } = await statement.all<Row>();
    return (results ?? []).map(toItem);
  } catch (error) {
    console.error(
      `[navigation] ${error instanceof Error ? error.message : "Unknown error."}`,
    );
    return [];
  }
}

export async function replaceNav(location: "header" | "footer", items: Omit<NavItem, "id" | "location" | "sortOrder">[]): Promise<void> {
  const db = await getDb();

  // Replace wholesale: the editor sends the entire menu, so diffing rows would
  // only add a way for the stored order to drift from what was on screen.
  const statements = [
    db.prepare("DELETE FROM nav_items WHERE location = ?").bind(location),
    ...items.map((item, index) =>
      db
        .prepare(
          `INSERT INTO nav_items (id, location, label_en, label_fr, href, sort_order, visible)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          newId("nav"),
          location,
          item.labelEn,
          item.labelFr,
          item.href,
          index,
          item.visible ? 1 : 0,
        ),
    ),
  ];

  await db.batch(statements);
}
