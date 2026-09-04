import { Eye, ImageOff, Save, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { CharacterPicker, type CharacterOption } from "../components/CharacterPicker";
import { PageHeader } from "../components/PageHeader";
import { LoadingBlock } from "../components/StateBlock";
import { entryPath, entryTypeLabels, initials, mediaUrl } from "../lib/entry";
import type { CharacterRelationshipsPayload, EntryPayload, EntryType, PublicationStatus, Relation } from "../types";

const entryTypes = Object.keys(entryTypeLabels) as EntryType[];

const emptyForm = (type: EntryType): EntryPayload => ({
  title: "", slug: "", type, status: "DRAFT", summary: "", content: "", aliases: [], tags: [], infobox: {}, isFeatured: false,
  birthYear: null, deathYear: null, reignStartYear: null, reignEndYear: null, changeNote: "",
});

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageSize = 10 * 1024 * 1024;
type RelationshipEditor = {
  father: CharacterOption[]; mother: CharacterOption[]; parents: CharacterOption[];
  siblings: Array<CharacterOption & { type: "sibling" | "twin" }>;
  spouses: CharacterOption[]; children: CharacterOption[]; predecessor: CharacterOption[]; successor: CharacterOption[];
};
const emptyRelationships = (): RelationshipEditor => ({ father: [], mother: [], parents: [], siblings: [], spouses: [], children: [], predecessor: [], successor: [] });

function relationsToEditor(relations: Relation[]): RelationshipEditor {
  const next = emptyRelationships();
  for (const relation of relations) {
    if (!relation.target) continue;
    const option = { slug: relation.target.slug, title: relation.target.title };
    if (relation.type === "father" || relation.type === "mother" || relation.type === "parent" || relation.type === "spouse" || relation.type === "child" || relation.type === "predecessor" || relation.type === "successor") {
      const key = relation.type === "parent" ? "parents" : relation.type === "spouse" ? "spouses" : relation.type === "child" ? "children" : relation.type;
      (next[key] as CharacterOption[]).push(option);
    } else if (relation.type === "sibling" || relation.type === "twin") next.siblings.push({ ...option, type: relation.type });
  }
  return next;
}

function infoboxToText(value: Record<string, string | number | boolean | null>): string {
  return Object.entries(value).map(([key, item]) => `${key}: ${item ?? ""}`).join("\n");
}

function textToInfobox(value: string): Record<string, string> {
  return Object.fromEntries(value.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const splitAt = line.indexOf(":");
    return splitAt === -1 ? [line, "Brak danych"] : [line.slice(0, splitAt).trim(), line.slice(splitAt + 1).trim()];
  }));
}

export function EditorPage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const initialType = (params.get("type") as EntryType) || "CHARACTER";
  const [form, setForm] = useState<EntryPayload>(() => emptyForm(initialType));
  const [infoboxText, setInfoboxText] = useState("");
  const [token, setToken] = useState(() => localStorage.getItem("imperium-admin-token") || "");
  const [loading, setLoading] = useState(Boolean(slug));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
  const [relationships, setRelationships] = useState<RelationshipEditor>(emptyRelationships);
  const navigate = useNavigate();
  const draftKey = useMemo(() => `imperium-draft-${slug || "new"}`, [slug]);

  useEffect(() => {
    if (!slug) {
      const draft = localStorage.getItem(draftKey);
      if (draft) {
        try {
          const parsed = JSON.parse(draft) as { form: EntryPayload; infoboxText: string };
          setForm(parsed.form);
          setInfoboxText(parsed.infoboxText);
        } catch { /* pomiń uszkodzony szkic */ }
      }
      return;
    }
    api.get(slug, token).then((entry) => {
      setForm({
        title: entry.title, slug: entry.slug, type: entry.type, status: entry.status, summary: entry.summary,
        content: entry.content, aliases: entry.aliases, tags: entry.tags, infobox: {}, isFeatured: entry.isFeatured,
        birthYear: entry.birthYear, deathYear: entry.deathYear, reignStartYear: entry.reignStartYear,
        reignEndYear: entry.reignEndYear, changeNote: "",
      });
      setInfoboxText(infoboxToText(entry.infobox));
      setImagePath(entry.imagePath);
      setRelationships(relationsToEditor(entry.outgoing));
    }).catch((error: Error) => setMessage(error.message)).finally(() => setLoading(false));
  }, [slug, draftKey]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  useEffect(() => {
    const timer = window.setTimeout(() => localStorage.setItem(draftKey, JSON.stringify({ form, infoboxText })), 500);
    return () => window.clearTimeout(timer);
  }, [draftKey, form, infoboxText]);

  const set = <K extends keyof EntryPayload>(key: K, value: EntryPayload[K]) => setForm((current) => ({ ...current, [key]: value }));
  const split = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);
  const setYear = (key: "birthYear" | "deathYear" | "reignStartYear" | "reignEndYear", value: string) => set(key, value === "" ? null : Number(value));
  const supportsImage = form.type === "CHARACTER" || form.type === "PROVINCE";
  const displayedImage = imagePreview || (!removeCurrentImage ? mediaUrl(imagePath) : null);

  const selectImage = (file: File | undefined) => {
    if (!file) return;
    if (!allowedImageTypes.has(file.type)) {
      setMessage("Wybierz obraz JPG, JPEG, PNG albo WEBP.");
      return;
    }
    if (file.size > maxImageSize) {
      setMessage("Zdjęcie przekracza limit 10 MB.");
      return;
    }
    setMessage("");
    setImageFile(file);
    setRemoveCurrentImage(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    localStorage.setItem("imperium-admin-token", token);
    try {
      const payload = { ...form, infobox: textToInfobox(infoboxText) };
      const result = slug ? await api.update(slug, payload, token) : await api.create(payload, token);
      if (result.type === "CHARACTER") {
        const relationPayload: CharacterRelationshipsPayload = {
          father: relationships.father[0]?.slug ?? null,
          mother: relationships.mother[0]?.slug ?? null,
          parents: relationships.parents.map((item) => item.slug),
          siblings: relationships.siblings.map((item) => ({ target: item.slug, type: item.type })),
          spouses: relationships.spouses.map((item) => item.slug),
          children: relationships.children.map((item) => item.slug),
          predecessor: relationships.predecessor[0]?.slug ?? null,
          successor: relationships.successor[0]?.slug ?? null,
        };
        await api.updateCharacterRelationships(result.slug, relationPayload, token);
      }
      if (supportsImage && imageFile) {
        await api.uploadImage(result.slug, imageFile, token);
      } else if (supportsImage && removeCurrentImage && imagePath) {
        await api.removeImage(result.slug, token);
      }
      localStorage.removeItem(draftKey);
      navigate(entryPath(result.type, result.slug));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nie udało się zapisać wpisu.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!slug || !window.confirm("Usunąć ten wpis wraz z historią zmian?")) return;
    try { await api.remove(slug, token); navigate("/"); } catch (error) { setMessage(error instanceof Error ? error.message : "Nie udało się usunąć wpisu."); }
  };

  if (loading) return <LoadingBlock label="Otwieranie edytora…" />;

  return (
    <>
      <PageHeader eyebrow="Panel administracyjny" title={slug ? "Edytuj wpis" : "Nowy wpis"} description="Treść jest zapisywana lokalnie jako szkic podczas pisania. Publikacja zapisuje wpis oraz wersję w bazie." />
      <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="surface space-y-5 p-5 md:p-7">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block"><span className="mb-2 block text-sm text-white/60">Tytuł *</span><input className="field" value={form.title} onChange={(e) => set("title", e.target.value)} required /></label>
            <label className="block"><span className="mb-2 block text-sm text-white/60">Slug</span><input className="field" value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="generowany z tytułu" /></label>
          </div>
          {form.type === "CHARACTER" && (
            <div className="rounded-xl border border-white/[0.07] bg-black/10 p-4">
              <h2 className="font-serif text-lg text-cream">Chronologia postaci</h2>
              <p className="mt-1 text-xs leading-5 text-white/35">Nieuzupełnione dane pozostają puste. Wiek osoby żyjącej jest liczony względem roku 607.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block"><span className="mb-2 block text-sm text-white/60">Rok urodzenia</span><input type="number" className="field" value={form.birthYear ?? ""} onChange={(e) => setYear("birthYear", e.target.value)} /></label>
                <label className="block"><span className="mb-2 block text-sm text-white/60">Rok śmierci</span><input type="number" className="field" value={form.deathYear ?? ""} onChange={(e) => setYear("deathYear", e.target.value)} /></label>
              </div>
            </div>
          )}
          {form.type === "CHARACTER" && (
            <div className="rounded-xl border border-white/[0.07] bg-black/10 p-4">
              <h2 className="font-serif text-lg text-cream">Rodzina</h2>
              <p className="mt-1 text-xs leading-5 text-white/35">Wyszukuj postacie po nazwie. Relacje odwrotne są aktualizowane automatycznie przez API.</p>
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <CharacterPicker label="Ojciec" value={relationships.father} onChange={(father) => setRelationships((current) => ({ ...current, father }))} token={token} excludeSlug={slug} />
                <CharacterPicker label="Matka" value={relationships.mother} onChange={(mother) => setRelationships((current) => ({ ...current, mother }))} token={token} excludeSlug={slug} />
                <CharacterPicker label="Rodzeństwo" multiple value={relationships.siblings} onChange={(items) => setRelationships((current) => ({ ...current, siblings: items.map((item) => current.siblings.find((old) => old.slug === item.slug) ?? { ...item, type: "sibling" }) }))} token={token} excludeSlug={slug} />
                <CharacterPicker label="Małżonkowie" multiple value={relationships.spouses} onChange={(spouses) => setRelationships((current) => ({ ...current, spouses }))} token={token} excludeSlug={slug} />
                <CharacterPicker label="Dzieci" multiple value={relationships.children} onChange={(children) => setRelationships((current) => ({ ...current, children }))} token={token} excludeSlug={slug} />
              </div>
              {relationships.siblings.length > 0 && <div className="mt-4 space-y-2 rounded-lg border border-white/[0.06] p-3"><p className="text-xs uppercase tracking-wider text-white/35">Oznaczenie bliźniąt</p>{relationships.siblings.map((item) => <label key={item.slug} className="flex items-center gap-3 text-sm text-cream"><input type="checkbox" checked={item.type === "twin"} onChange={(event) => setRelationships((current) => ({ ...current, siblings: current.siblings.map((sibling) => sibling.slug === item.slug ? { ...sibling, type: event.target.checked ? "twin" : "sibling" } : sibling) }))} className="h-4 w-4 accent-[#c9a55d]" />{item.title} — bliźnięta</label>)}</div>}
            </div>
          )}
          {form.type === "CHARACTER" && (
            <div className="rounded-xl border border-gold/15 bg-gold/[0.025] p-4">
              <h2 className="font-serif text-lg text-cream">Sukcesja</h2>
              <p className="mt-1 text-xs leading-5 text-white/35">Sukcesja polityczna jest zapisywana niezależnie od genealogii.</p>
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <CharacterPicker label="Poprzednik" value={relationships.predecessor} onChange={(predecessor) => setRelationships((current) => ({ ...current, predecessor }))} token={token} excludeSlug={slug} />
                <CharacterPicker label="Następca" value={relationships.successor} onChange={(successor) => setRelationships((current) => ({ ...current, successor }))} token={token} excludeSlug={slug} />
                <label className="block"><span className="mb-2 block text-sm text-white/60">Początek panowania</span><input type="number" className="field" value={form.reignStartYear ?? ""} onChange={(e) => setYear("reignStartYear", e.target.value)} /></label>
                <label className="block"><span className="mb-2 block text-sm text-white/60">Koniec panowania / puste = obecnie</span><input type="number" className="field" value={form.reignEndYear ?? ""} onChange={(e) => setYear("reignEndYear", e.target.value)} /></label>
              </div>
            </div>
          )}
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block"><span className="mb-2 block text-sm text-white/60">Typ wpisu</span><select className="field" value={form.type} onChange={(e) => set("type", e.target.value as EntryType)}>{entryTypes.map((type) => <option key={type} value={type}>{entryTypeLabels[type]}</option>)}</select></label>
            <label className="block"><span className="mb-2 block text-sm text-white/60">Status</span><select className="field" value={form.status} onChange={(e) => set("status", e.target.value as PublicationStatus)}><option value="DRAFT">Szkic</option><option value="PUBLISHED">Opublikowany</option></select></label>
          </div>
          <label className="block"><span className="mb-2 block text-sm text-white/60">Krótkie podsumowanie *</span><textarea className="field min-h-24 resize-y" value={form.summary} onChange={(e) => set("summary", e.target.value)} required /></label>
          <div>
            <div className="mb-2 flex items-center justify-between"><span className="text-sm text-white/60">Pełna treść — Markdown *</span><button type="button" onClick={() => setPreview(!preview)} className="inline-flex items-center gap-2 text-xs text-gold/75"><Eye className="h-3.5 w-3.5" /> {preview ? "Edytor" : "Podgląd"}</button></div>
            {preview ? <div className="article-copy min-h-[360px] rounded-lg border border-white/10 bg-black/20 p-5"><ReactMarkdown>{form.content || "*Brak treści podglądu.*"}</ReactMarkdown></div> : <textarea className="field min-h-[360px] resize-y font-mono !text-sm leading-6" value={form.content} onChange={(e) => set("content", e.target.value)} required placeholder="## Nagłówek&#10;&#10;Treść artykułu…" />}
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block"><span className="mb-2 block text-sm text-white/60">Aliasy, po przecinku</span><input className="field" value={form.aliases.join(", ")} onChange={(e) => set("aliases", split(e.target.value))} /></label>
            <label className="block"><span className="mb-2 block text-sm text-white/60">Tagi, po przecinku</span><input className="field" value={form.tags.join(", ")} onChange={(e) => set("tags", split(e.target.value))} /></label>
          </div>
        </div>

        <aside className="space-y-5">
          {supportsImage && (
            <div className="surface p-5">
              <h2 className="font-serif text-xl">{form.type === "CHARACTER" ? "Zdjęcie postaci" : "Zdjęcie główne prowincji"}</h2>
              <p className="mt-1 text-xs leading-5 text-white/35">JPG, JPEG, PNG lub WEBP. Maksymalnie 10 MB.</p>
              <div className={`mt-4 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-imperial/15 to-black/30 ${form.type === "PROVINCE" ? "aspect-video" : "aspect-[4/3]"}`}>
                {displayedImage ? (
                  <img src={displayedImage} alt="Podgląd wybranego zdjęcia" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-gold/45"><ImageOff className="h-10 w-10" /><span className="mt-2 text-xs tracking-wider">{form.type === "CHARACTER" ? initials(form.title || "Postać") : "Brak zdjęcia"}</span></div>
                )}
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                <label className="button-secondary cursor-pointer"><Upload className="h-4 w-4" /> {displayedImage ? "Zmień zdjęcie" : "Dodaj zdjęcie"}<input type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" className="sr-only" onChange={(e) => { selectImage(e.target.files?.[0]); e.target.value = ""; }} /></label>
                {(displayedImage || imagePath) && <button type="button" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-red-400/20 bg-red-500/[0.05] px-4 text-sm text-red-200/75 hover:bg-red-500/10" onClick={() => { setImageFile(null); setRemoveCurrentImage(Boolean(imagePath)); }}><ImageOff className="h-4 w-4" /> Usuń zdjęcie</button>}
              </div>
            </div>
          )}
          <div className="surface p-5"><h2 className="font-serif text-xl">Infobox</h2><p className="mt-1 text-xs leading-5 text-white/35">Jedno pole w wierszu, format: nazwa: wartość</p><textarea className="field mt-4 min-h-64 resize-y font-mono !text-sm leading-6" value={infoboxText} onChange={(e) => setInfoboxText(e.target.value)} placeholder="status: Żyje&#10;ród: de la Cruz&#10;prowincja: Brak danych" /></div>
          <div className="surface space-y-4 p-5">
            <label className="flex items-start gap-3"><input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} className="mt-1 h-4 w-4 accent-[#c9a55d]" /><span><span className="block text-sm text-cream">Wyróżnij na stronie głównej</span><span className="block text-xs leading-5 text-white/35">Wpis pojawi się w sekcjach głównych.</span></span></label>
            <label className="block"><span className="mb-2 block text-sm text-white/60">Opis zmiany</span><input className="field" value={form.changeNote} onChange={(e) => set("changeNote", e.target.value)} placeholder="np. Uzupełnienie biografii" /></label>
            <label className="block"><span className="mb-2 block text-sm text-white/60">Klucz API administratora</span><input className="field" type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Wartość ADMIN_API_KEY" /></label>
            {message && <p className="rounded-lg border border-red-500/20 bg-red-500/[0.08] p-3 text-sm text-red-200">{message}</p>}
            <button type="submit" disabled={saving} className="button-primary w-full disabled:cursor-wait disabled:opacity-60"><Save className="h-4 w-4" /> {saving ? "Zapisywanie…" : "Zapisz wpis"}</button>
            {slug && <button type="button" onClick={remove} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-red-400/20 bg-red-500/[0.05] px-4 text-sm text-red-200/75 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /> Usuń wpis</button>}
          </div>
        </aside>
      </form>
    </>
  );
}
