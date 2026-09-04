import { AlertTriangle, Archive } from "lucide-react";

export function LoadingBlock({ label = "Otwieranie archiwum…" }: { label?: string }) {
  return (
    <div className="surface-muted flex min-h-48 items-center justify-center p-8 text-sm text-white/50" role="status">
      <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />
      {label}
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="surface-muted flex min-h-48 flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="mb-3 h-6 w-6 text-[#c96868]" />
      <p className="text-cream">Nie udało się otworzyć zasobu</p>
      <p className="mt-1 max-w-md text-sm text-white/45">{message}</p>
      {onRetry && <button className="button-secondary mt-5" onClick={onRetry}>Spróbuj ponownie</button>}
    </div>
  );
}

export function EmptyBlock({ label = "Brak wpisów w tej sekcji." }: { label?: string }) {
  return (
    <div className="surface-muted flex min-h-48 flex-col items-center justify-center p-8 text-center text-white/45">
      <Archive className="mb-3 h-6 w-6 text-gold/70" />
      <p>{label}</p>
    </div>
  );
}

