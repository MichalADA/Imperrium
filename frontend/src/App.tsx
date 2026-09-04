import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { Layout } from "./components/Layout";
import { CatalogPage } from "./pages/CatalogPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DynastyPage } from "./pages/DynastyPage";
import { EditorPage } from "./pages/EditorPage";
import { EntryDetailPage } from "./pages/EntryDetailPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { SearchPage } from "./pages/SearchPage";
import { TimelinePage } from "./pages/TimelinePage";
import type { EntryType } from "./types";

const catalogCopy: Record<EntryType, { title: string; eyebrow: string; description: string }> = {
  CHARACTER: { title: "Postacie", eyebrow: "Kartoteka osobowa", description: "Cesarze, wojskowi, przedsiębiorcy oraz osoby, które ukształtowały sześć stuleci historii Imperium." },
  PROVINCE: { title: "Prowincje", eyebrow: "Atlas administracyjny", description: "Nieformalnie dzielone na prestiżowe, neutralne i „wrogie”. Podział nie ma statusu urzędowego." },
  CITY: { title: "Miasta", eyebrow: "Atlas miejski", description: "Stolice, metropolie finansowe i ośrodki lokalnych kultur Imperium." },
  LANGUAGE: { title: "Języki Imperium", eyebrow: "Atlas językowy", description: "Piętnaście języków, w tym osiem urzędowych. Latin pozostaje najważniejszą lingua franca." },
  COMPANY: { title: "Firmy i marki", eyebrow: "Rejestr gospodarczy", description: "Banki, technologie i producenci kształtujący codzienne życie setek milionów mieszkańców." },
  EVENT: { title: "Historia", eyebrow: "Archiwum historyczne", description: "Epoki, wojny i przełomy polityczne od przybycia ludzi z Ziemi do dynastii de la Cruz." },
  HOUSE: { title: "Wielkie rody", eyebrow: "Rejestr neofeudalny", description: "Rody wasalne, ich gałęzie, majątki oraz zależności wobec cesarza." },
  INSTITUTION: { title: "Instytucje", eyebrow: "Ustrój państwa", description: "Organy państwa, administracja oraz system neofeudalnych zależności." },
  UNIVERSITY: { title: "Uczelnie", eyebrow: "Rejestr akademicki", description: "Elitarne akademie i specjalistyczne ośrodki nauki od Lacjum po Montes." },
  TECHNOLOGY: { title: "Technologie", eyebrow: "Rejestr rozwoju", description: "Systemy i wynalazki wykorzystywane przez mieszkańców Imperium." },
  GEOGRAPHY: { title: "Geografia", eyebrow: "Atlas fizyczny", description: "Góry, jeziora, ekstremalne klimaty i inne elementy geografii Imperium." },
  MILITARY: { title: "Siły Zbrojne", eyebrow: "Archiwum wojskowe", description: "Hierarchie wojsk lądowych, Marynarki, Lotnictwa i Sił Orbitalnych." },
  DYNASTY: { title: "Dynastie", eyebrow: "Domy panujące", description: "Linie sukcesji oraz historia dynastii Imperium." },
  ARTICLE: { title: "Artykuły", eyebrow: "Archiwum ogólne", description: "Pozostałe artykuły lore, które nie należą do katalogów dziedzinowych." },
};

function DynamicCatalog() {
  const { type = "CHARACTER" } = useParams();
  const normalized = type.toUpperCase() as EntryType;
  if (!catalogCopy[normalized]) return <NotFoundPage />;
  return <CatalogPage type={normalized} {...catalogCopy[normalized]} />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="postacie" element={<CatalogPage type="CHARACTER" {...catalogCopy.CHARACTER} />} />
        <Route path="postacie/:slug" element={<EntryDetailPage />} />
        <Route path="prowincje" element={<CatalogPage type="PROVINCE" {...catalogCopy.PROVINCE} />} />
        <Route path="prowincje/:slug" element={<EntryDetailPage />} />
        <Route path="jezyki" element={<CatalogPage type="LANGUAGE" {...catalogCopy.LANGUAGE} />} />
        <Route path="firmy" element={<CatalogPage type="COMPANY" {...catalogCopy.COMPANY} />} />
        <Route path="dynastia" element={<DynastyPage />} />
        <Route path="chronologia" element={<TimelinePage />} />
        <Route path="szukaj" element={<SearchPage />} />
        <Route path="katalog/:type" element={<DynamicCatalog />} />
        <Route path="wpis/:slug" element={<EntryDetailPage />} />
        <Route path="admin/nowy" element={<EditorPage />} />
        <Route path="admin/edytuj/:slug" element={<EditorPage />} />
        <Route path="historia" element={<Navigate to="/katalog/EVENT" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
