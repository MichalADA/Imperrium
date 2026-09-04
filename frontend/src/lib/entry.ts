import type { EntryType } from "../types";

export const entryTypeLabels: Record<EntryType, string> = {
  CHARACTER: "Postać",
  PROVINCE: "Prowincja",
  CITY: "Miasto",
  LANGUAGE: "Język",
  COMPANY: "Firma",
  EVENT: "Wydarzenie",
  HOUSE: "Ród",
  INSTITUTION: "Instytucja",
  UNIVERSITY: "Uczelnia",
  TECHNOLOGY: "Technologia",
  GEOGRAPHY: "Geografia",
  MILITARY: "Wojsko",
  DYNASTY: "Dynastia",
  ARTICLE: "Artykuł",
};

export function entryPath(type: EntryType, slug: string): string {
  if (type === "CHARACTER") return `/postacie/${slug}`;
  if (type === "PROVINCE") return `/prowincje/${slug}`;
  return `/wpis/${slug}`;
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export function mediaUrl(imagePath: string | null | undefined): string | null {
  return imagePath ? `/uploads/${encodeURIComponent(imagePath)}` : null;
}

export function initials(title: string): string {
  return title.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?";
}
