import type { CharacterChoice, CharacterRelationshipsPayload, Dashboard, Entry, EntryCard, EntryPayload, EntryType, Relation } from "../types";

const API_BASE = "/api";
const auth = (token: string): Record<string, string> => token ? { Authorization: `Bearer ${token}` } : {};

type EntryListResponse = {
  items: EntryCard[];
  total: number;
  page: number;
  pages: number;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, options);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Błąd połączenia z archiwum." }));
    const issues = Array.isArray(error.errors) ? error.errors.map((issue: { message?: string }) => issue.message).filter(Boolean).join("; ") : "";
    throw new Error(error.message || issues || "Błąd połączenia z archiwum.");
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

async function listEntries(type?: EntryType): Promise<{ items: EntryCard[]; total: number }> {
  const limit = 100;
  const typeQuery = type ? `&type=${encodeURIComponent(type)}` : "";
  const first = await request<EntryListResponse>(`/entries?page=1&limit=${limit}${typeQuery}`);

  if (first.pages <= 1) return { items: first.items, total: first.total };

  const remaining = await Promise.all(
    Array.from({ length: first.pages - 1 }, (_, index) =>
      request<EntryListResponse>(`/entries?page=${index + 2}&limit=${limit}${typeQuery}`),
    ),
  );

  return {
    items: [first, ...remaining].flatMap((page) => page.items),
    total: first.total,
  };
}

export const api = {
  dashboard: () => request<Dashboard>("/dashboard"),
  list: listEntries,
  get: (slug: string, token = "") => request<Entry>(`/entries/${encodeURIComponent(slug)}`, {
    headers: auth(token),
  }),
  search: (query: string) =>
    request<{ query: string; results: EntryCard[] }>(`/search?q=${encodeURIComponent(query)}`),
  timeline: (category?: string) =>
    request<{ events: EntryCard[] }>(`/timeline${category ? `?category=${encodeURIComponent(category)}` : ""}`),
  create: (payload: EntryPayload, token: string) =>
    request<Entry>("/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...auth(token) },
      body: JSON.stringify(payload),
    }),
  update: (slug: string, payload: EntryPayload, token: string) =>
    request<Entry>(`/entries/${encodeURIComponent(slug)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...auth(token) },
      body: JSON.stringify(payload),
    }),
  remove: (slug: string, token: string) =>
    request<void>(`/entries/${encodeURIComponent(slug)}`, {
      method: "DELETE",
      headers: auth(token),
    }),
  uploadImage: (slug: string, file: File, token: string) => {
    const body = new FormData();
    body.append("image", file);
    return request<{ imagePath: string; imageUrl: string }>(`/entries/${encodeURIComponent(slug)}/image`, {
      method: "POST",
      headers: auth(token),
      body,
    });
  },
  removeImage: (slug: string, token: string) =>
    request<void>(`/entries/${encodeURIComponent(slug)}/image`, {
      method: "DELETE",
      headers: auth(token),
    }),
  findCharacters: (search: string, token = "") => request<{ items: CharacterChoice[] }>(`/characters?search=${encodeURIComponent(search)}&limit=12`, { headers: auth(token) }),
  getCharacterRelationships: (slug: string, token = "") => request<{ relationships: Relation[] }>(`/characters/${encodeURIComponent(slug)}/relationships`, { headers: auth(token) }),
  updateCharacterRelationships: (slug: string, payload: CharacterRelationshipsPayload, token: string) =>
    request<{ relationships: Relation[] }>(`/characters/${encodeURIComponent(slug)}/relationships`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...auth(token) },
      body: JSON.stringify(payload),
    }),
};
