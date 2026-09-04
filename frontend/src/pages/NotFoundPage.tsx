import { ArchiveX } from "lucide-react";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return <div className="surface flex min-h-[60vh] flex-col items-center justify-center p-8 text-center"><ArchiveX className="h-10 w-10 text-gold/60" /><p className="eyebrow mt-5">Błąd 404</p><h1 className="mt-2 font-serif text-3xl">Nie odnaleziono dokumentu</h1><p className="mt-3 text-white/40">Ten zasób nie istnieje albo został przeniesiony.</p><Link to="/" className="button-primary mt-7">Wróć do archiwum</Link></div>;
}

