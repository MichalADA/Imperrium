export type EntryType =
  | "CHARACTER"
  | "PROVINCE"
  | "CITY"
  | "LANGUAGE"
  | "COMPANY"
  | "EVENT"
  | "HOUSE"
  | "INSTITUTION"
  | "UNIVERSITY"
  | "TECHNOLOGY"
  | "GEOGRAPHY"
  | "MILITARY"
  | "DYNASTY"
  | "ARTICLE";

export type PublicationStatus = "DRAFT" | "PUBLISHED";

export type RelationType = "father" | "mother" | "parent" | "child" | "sibling" | "twin" | "spouse" | "predecessor" | "successor" | "other";

export type EntryCard = {
  id: string;
  slug: string;
  title: string;
  type: EntryType;
  status: PublicationStatus;
  summary: string;
  aliases: string[];
  tags: string[];
  infobox: Record<string, string | number | boolean | null>;
  isFeatured: boolean;
  imagePath: string | null;
  birthYear: number | null;
  deathYear: number | null;
  reignStartYear: number | null;
  reignEndYear: number | null;
  updatedAt: string;
};

export type Relation = {
  id: string;
  type: RelationType;
  description: string;
  isTwin: boolean;
  target?: EntryCard;
  source?: EntryCard;
};

export type Entry = EntryCard & {
  content: string;
  searchText: string;
  createdAt: string;
  outgoing: Relation[];
  incoming: Relation[];
};

export type Dashboard = {
  stats: {
    total: number;
    characters: number;
    provinces: number;
    languages: number;
    officialLanguages: number;
    companies: number;
    events: number;
    houses: number;
  };
  worldScale: { provinces: number; languages: number; officialLanguages: number };
  recent: EntryCard[];
  featured: EntryCard[];
  random: EntryCard | null;
};

export type EntryPayload = {
  title: string;
  slug?: string;
  type: EntryType;
  status: PublicationStatus;
  summary: string;
  content: string;
  aliases: string[];
  tags: string[];
  infobox: Record<string, string>;
  isFeatured: boolean;
  birthYear?: number | null;
  deathYear?: number | null;
  reignStartYear?: number | null;
  reignEndYear?: number | null;
  changeNote?: string;
};

export type CharacterChoice = { id: string; slug: string; displayName: string; type: "CHARACTER"; imagePath: string | null };

export type CharacterRelationshipsPayload = {
  father: string | null;
  mother: string | null;
  parents: string[];
  siblings: Array<{ target: string; type: "sibling" | "twin" }>;
  spouses: string[];
  children: string[];
  predecessor: string | null;
  successor: string | null;
};
