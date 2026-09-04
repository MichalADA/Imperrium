import { EntryType, Prisma, PrismaClient, PublicationStatus } from "@prisma/client";
import { pathToFileURL } from "node:url";

const prisma = new PrismaClient();

type SeedEntry = {
  slug: string;
  title: string;
  type: EntryType;
  summary: string;
  content: string;
  infobox?: Record<string, string | number | boolean | null>;
  aliases?: string[];
  tags?: string[];
  featured?: boolean;
  birthYear?: number;
  deathYear?: number;
  reignStartYear?: number;
  reignEndYear?: number;
  firstName?: string;
  lastName?: string;
  honorific?: string;
};

const noData = "Brak danych.";

export const characters: SeedEntry[] = [
  {
    slug: "michalus",
    title: "Michalus",
    type: EntryType.CHARACTER,
    summary: "Przywódca rewolucji technokratycznej i jedna z postaci założycielskich Imperium.",
    content: "## Rewolucja\n\nW Roku 0 miał 25 lat. Dowodził armią nazywaną „Patyczkami” i wykorzystywał technologię Lucio. Wojna rewolucyjna zakończyła się w Roku 10.\n\n## Rodzina\n\nMiał czworo dzieci. Jego syn Dominique został królem.\n\n## Śmierć\n\nZmarł w wieku 79 lat.",
    infobox: { status: "Nie żyje", "wiek w Roku 0": "25 lat", "wiek w chwili śmierci": "79 lat", dzieci: "4", rola: "Przywódca rewolucji" },
    aliases: ["Michalus Wielki"],
    tags: ["dynastia", "polityka", "rewolucja"],
    featured: true,
  },
  {
    slug: "juan",
    title: "Juan",
    type: EntryType.CHARACTER,
    summary: "Organizator policji rewolucyjnej i jedna z najbardziej kontrowersyjnych postaci początków Imperium.",
    content: "## Rewolucja\n\nW Roku 0 miał 14 lat. Zorganizował policję rewolucyjną. Podczas „krwawej nocy” zginęło około 150 osób, a liczba wielkich rodów została zredukowana z 20 do 7.\n\n## Śmierć\n\nW wieku 72 lat został rozstrzelany przez adoptowanego syna, Lucę Berraniego. Oficjalnie ogłoszono zawał.",
    infobox: { status: "Nie żyje", "wiek w Roku 0": "14 lat", "wiek w chwili śmierci": "72 lata", stanowisko: "Szef policji rewolucyjnej", "oficjalna przyczyna śmierci": "Zawał" },
    tags: ["polityka", "rewolucja", "policja"],
    featured: true,
  },
  {
    slug: "izabela-de-la-cruz",
    title: "Izabela de la Cruz",
    firstName: "Izabela",
    lastName: "de la Cruz",
    type: EntryType.CHARACTER,
    summary: "Matka bliźniąt Octaviana Wielkiego i Octavii de la Cruz.",
    content: "## Rodzina\n\nIzabela urodziła bliźnięta w wieku 19 lat. Octavian i Octavia przyszli na świat w roku 428.\n\n## Śmierć\n\nZmarła śmiercią samobójczą w roku 449, w wieku 40 lat. Octavian i Octavia mieli wtedy po 21 lat. Motyw i okoliczności samobójstwa: brak danych.",
    infobox: { status: "Nie żyje", ród: "de la Cruz", urodzenie: 409, śmierć: 449, "wiek w chwili śmierci": "40 lat", dzieci: "Octavian Wielki, Octavia de la Cruz", "przyczyna śmierci": "Samobójstwo" },
    tags: ["dynastia", "de la Cruz"],
    birthYear: 409,
    deathYear: 449,
    featured: true,
  },
  {
    slug: "octavian-wielki",
    title: "Octavian Wielki",
    firstName: "Octavian",
    lastName: "Wielki",
    honorific: "Cesarz Imperium",
    type: EntryType.CHARACTER,
    summary: "Cesarz, który objął władzę po obaleniu Trybuna i zapoczątkował dynastię de la Cruz.",
    content: "## Panowanie\n\nObjął tron po obaleniu Trybuna i zapoczątkował dynastię de la Cruz. Jego następcą został Teodozjusz I.\n\n## Rodzina\n\nJego matką była Izabela de la Cruz. Octavia de la Cruz była jego siostrą bliźniaczką, a Teodozjusz I — synem.\n\n## Śmierć\n\nZmarł w roku 514 w wieku 86 lat.",
    infobox: { status: "Nie żyje", tytuł: "Cesarz Imperium", dynastia: "de la Cruz", urodzenie: 428, śmierć: 514, "wiek w chwili śmierci": "86 lat", matka: "Izabela de la Cruz", rodzeństwo: "Octavia de la Cruz — siostra bliźniaczka" },
    aliases: ["Octavian de la Cruz"],
    tags: ["dynastia", "cesarz"],
    birthYear: 428,
    deathYear: 514,
    featured: true,
  },
  {
    slug: "octavia-de-la-cruz",
    title: "Octavia de la Cruz",
    firstName: "Octavia",
    lastName: "de la Cruz",
    type: EntryType.CHARACTER,
    summary: "Siostra bliźniaczka Octaviana Wielkiego i córka Izabeli de la Cruz.",
    content: "## Rodzina\n\nOctavia była córką Izabeli de la Cruz i siostrą bliźniaczką Octaviana Wielkiego.\n\n## Śmierć\n\nZmarła w roku 548 w wieku 120 lat. Przeżyła swojego brata o 34 lata.",
    infobox: { status: "Nie żyje", ród: "de la Cruz", urodzenie: 428, śmierć: 548, "wiek w chwili śmierci": "120 lat", matka: "Izabela de la Cruz", rodzeństwo: "Octavian Wielki — brat bliźniak" },
    tags: ["dynastia"],
    birthYear: 428,
    deathYear: 548,
  },
  {
    slug: "teodozjusz-i",
    title: "Teodozjusz I",
    firstName: "Teodozjusz",
    lastName: "I",
    honorific: "Cesarz Imperium",
    type: EntryType.CHARACTER,
    summary: "Syn Octaviana Wielkiego, cesarz Imperium w latach 514–521.",
    content: "## Rodzina\n\nTeodozjusz I był synem Octaviana Wielkiego oraz ojcem Francesco i Teodozjusza II.\n\n## Panowanie\n\nObjął tron w roku 514, mając 68 lat. Panował siedem lat, do śmierci w roku 521.",
    infobox: { status: "Nie żyje", tytuł: "Cesarz Imperium", dynastia: "de la Cruz", urodzenie: 446, śmierć: 521, "wiek w chwili śmierci": "75 lat", "wiek objęcia tronu": "68 lat", panowanie: "514–521" },
    tags: ["dynastia", "cesarz"],
    birthYear: 446,
    deathYear: 521,
    reignStartYear: 514,
    reignEndYear: 521,
  },
  {
    slug: "francesco-de-la-cruz",
    title: "Francesco de la Cruz",
    firstName: "Francesco",
    lastName: "de la Cruz",
    honorific: "Cesarz Imperium",
    type: EntryType.CHARACTER,
    summary: "Syn Teodozjusza I i cesarz Imperium w latach 521–556.",
    content: "## Rodzina\n\nFrancesco był synem Teodozjusza I, wnukiem Octaviana Wielkiego i starszym bratem Teodozjusza II. Zmarł bezdzietnie.\n\n## Panowanie\n\nObjął tron po Teodozjuszu I w roku 521, mając 50 lat. Panował 35 lat. Po jego śmierci tron objął młodszy brat, Teodozjusz II.\n\n## Śmierć\n\nZmarł w roku 556 w wieku 85 lat.",
    infobox: { status: "Nie żyje", tytuł: "Cesarz Imperium", dynastia: "de la Cruz", urodzenie: 471, śmierć: 556, "wiek w chwili śmierci": "85 lat", "wiek objęcia tronu": "50 lat", panowanie: "521–556", dzieci: "Brak" },
    tags: ["dynastia", "cesarz"],
    birthYear: 471,
    deathYear: 556,
    reignStartYear: 521,
    reignEndYear: 556,
  },
  {
    slug: "teodozjusz-ii",
    title: "Teodozjusz II",
    firstName: "Teodozjusz",
    lastName: "II",
    honorific: "Cesarz Imperium",
    type: EntryType.CHARACTER,
    summary: "Młodszy brat Francesco i cesarz Imperium w latach 556–591.",
    content: "## Rodzina\n\nTeodozjusz II był synem Teodozjusza I, wnukiem Octaviana Wielkiego i młodszym o 30 lat bratem Francesco. Miał między innymi dwóch synów: Octaviana i Ignaciusa.\n\n## Panowanie\n\nObjął tron po bezdzietnej śmierci Francesco w roku 556, mając 55 lat. Panował do śmierci w roku 591.\n\n## Śmierć\n\nZmarł w wieku 90 lat.",
    infobox: { status: "Nie żyje", tytuł: "Cesarz Imperium", dynastia: "de la Cruz", urodzenie: 501, śmierć: 591, "wiek w chwili śmierci": "90 lat", "wiek objęcia tronu": "55 lat", panowanie: "556–591" },
    tags: ["dynastia", "cesarz"],
    birthYear: 501,
    deathYear: 591,
    reignStartYear: 556,
    reignEndYear: 591,
  },
  {
    slug: "ignacius-de-la-cruz",
    title: "Ignacius de la Cruz",
    firstName: "Ignacius",
    lastName: "de la Cruz",
    honorific: "Cesarz Imperium",
    type: EntryType.CHARACTER,
    summary: "Obecny cesarz Imperium, panujący od roku 591.",
    content: "## Rodzina\n\nIgnacius jest synem Teodozjusza II, młodszym bratem Octaviana i ojcem Konstancji. Urodził się w roku 559, gdy jego ojciec miał 58 lat.\n\n## Panowanie\n\nObjął tron po śmierci Teodozjusza II w roku 591. Miał wtedy 32 lata. W obecnym roku 607 ma 48 lat i panuje od 16 lat.",
    infobox: { status: "Żyje", tytuł: "Cesarz Imperium", dynastia: "de la Cruz", urodzenie: 559, "obecny wiek": "48 lat", "wiek objęcia tronu": "32 lata", panowanie: "591–obecnie", "długość panowania": "16 lat" },
    tags: ["dynastia", "cesarz", "obecne czasy"],
    birthYear: 559,
    reignStartYear: 591,
    featured: true,
  },
  {
    slug: "konstancja-de-la-cruz",
    title: "Konstancja de la Cruz",
    firstName: "Konstancja",
    lastName: "de la Cruz",
    type: EntryType.CHARACTER,
    summary: "Członkini dynastii de la Cruz; obecnie nie jest cesarzową.",
    content: "## Rodzina\n\nKonstancja jest córką Ignaciusa. Miała trzy lata, gdy jej ojciec objął tron.\n\n## Status dynastyczny\n\nW obecnym roku 607 ma 19 lat. Nie jest obecnie cesarzową.\n\n## Relacje\n\nWychowywała się z Michałem de la Cruz jak z rodzeństwem, choć łączy ich kuzynostwo.",
    infobox: { status: "Żyje", ród: "de la Cruz", urodzenie: 588, "obecny wiek": "19 lat", ojciec: "Ignacius de la Cruz", tytuł: "Brak danych", "czy jest cesarzową": "Nie" },
    tags: ["dynastia", "obecne czasy"],
    birthYear: 588,
    featured: true,
  },
  {
    slug: "liliana-de-la-cruz",
    title: "Liliana de la Cruz",
    type: EntryType.CHARACTER,
    summary: "Członkini dynastii de la Cruz, blisko związana z Michałem de la Cruz.",
    content: "Liliana i Michał de la Cruz wychowywali się jak rodzeństwo. Pozostałe dane nie zostały jeszcze ustalone.",
    infobox: { status: "Żyje", ród: "de la Cruz", tytuł: "Brak danych" },
    tags: ["dynastia", "obecne czasy"],
  },
  {
    slug: "michal-de-la-cruz",
    title: "Michał de la Cruz",
    type: EntryType.CHARACTER,
    summary: "Najwyższy Książę Imperium i Najwyższy Generał Armii Południa.",
    content: "## Tytuł dynastyczny\n\nMichał nosi wyjątkowy tytuł „Najwyższy Książę Imperium”, ponieważ jest synem Octaviana, który był przewidywanym następcą Teodozjusza II.\n\n## Służba wojskowa\n\nJest Najwyższym Generałem Armii Południa oraz Strażnikiem Imperium Technokratycznego. Preferuje tytuł wojskowy zamiast dynastycznego.\n\n## Relacje\n\nZ Konstancją i Lilianą wychowywał się jak z siostrami.",
    infobox: { status: "Żyje", ród: "de la Cruz", ojciec: "Octavian, syn Teodozjusza II", tytuł: "Najwyższy Książę Imperium", stopień: "Najwyższy Generał Armii Południa", funkcja: "Strażnik Imperium Technokratycznego" },
    tags: ["dynastia", "wojsko", "obecne czasy"],
    featured: true,
  },
  {
    slug: "octavian-syn-teodozjusza-ii",
    title: "Octavian, syn Teodozjusza II",
    type: EntryType.CHARACTER,
    summary: "Przewidywany następca Teodozjusza II i ojciec Michała de la Cruz.",
    content: "## Rodzina\n\nOctavian był synem Teodozjusza II i starszym bratem Ignaciusa. Urodził się w roku 556, gdy jego ojciec miał 55 lat. Był ojcem Michała de la Cruz.\n\n## Sukcesja\n\nBył przewidywanym następcą tronu, ale zmarł przed swoim ojcem i nigdy nie został cesarzem.\n\n## Śmierć\n\nZmarł w roku 586 w wieku 30 lat.",
    infobox: { status: "Nie żyje", ród: "de la Cruz", urodzenie: 556, śmierć: 586, ojciec: "Teodozjusz II", rodzeństwo: "Ignacius de la Cruz", dziecko: "Michał de la Cruz", "wiek w chwili śmierci": "30 lat", "był cesarzem": "Nie" },
    aliases: ["Octavian młodszy"],
    tags: ["dynastia", "sukcesja"],
    birthYear: 556,
    deathYear: 586,
  },
  {
    slug: "teodora",
    title: "Teodora",
    type: EntryType.CHARACTER,
    summary: "Postać należąca do kanonu Imperium Technokratycznego.",
    content: noData,
    infobox: { status: "Brak danych", ród: "Brak danych", stanowisko: "Brak danych" },
    tags: ["postać"],
  },
  {
    slug: "fideniasz",
    title: "Fideniasz",
    type: EntryType.CHARACTER,
    summary: "Postać należąca do kanonu Imperium Technokratycznego.",
    content: noData,
    infobox: { status: "Brak danych", ród: "Brak danych", stanowisko: "Brak danych" },
    tags: ["postać"],
  },
  {
    slug: "cassian-virow",
    title: "Cassian Virow",
    type: EntryType.CHARACTER,
    summary: "Długowieczny przedstawiciel rodu Virow, pamiętający czasy Octaviana Wielkiego.",
    content: "Cassian Virow dożył 150 lat i pamiętał Octaviana Wielkiego.",
    infobox: { status: "Brak danych", ród: "Virow", "wiek wskazany w kanonie": "150 lat" },
    tags: ["ród Virow", "historia"],
  },
  {
    slug: "sophie-delan",
    title: "Sophie Delan",
    type: EntryType.CHARACTER,
    summary: "Przedstawicielka elit o mocno ograniczonej dostępności w PrivXen.",
    content: "Dostęp do Sophie Delan w PrivXen jest mocno ograniczony. Pozostałe dane nie zostały jeszcze ustalone.",
    infobox: { status: "Brak danych", dostępność: "Ograniczona w PrivXen", ród: "Brak danych" },
    tags: ["elity", "PrivXen"],
  },
  {
    slug: "fryderyk-von-honhold",
    title: "Turon Xen / Fryderyk von Honhold",
    type: EntryType.CHARACTER,
    summary: "Założyciel Xen, publicznie znany pod celowo stworzonym pseudonimem Turon Xen.",
    content: "## Pseudonim\n\n„Turon” pochodzi z języka hańskiego i oznacza mniej więcej człowieka inteligentnego. „Xen” pochodzi od hańskiego „xennsus”, czyli gadatliwy lub rozmowny.\n\n## Xen\n\nFryderyk von Honhold założył Xen i posiada około 18% udziałów platformy.",
    infobox: { status: "Żyje", imię: "Fryderyk von Honhold", pseudonim: "Turon Xen", zawód: "Założyciel Xen", "udziały w Xen": "około 18%" },
    aliases: ["Turon Xen", "Fryderyk von Honhold"],
    tags: ["Xen", "biznes"],
    featured: true,
  },
  {
    slug: "julia-de-naraho",
    title: "Julia de Naraho",
    type: EntryType.CHARACTER,
    summary: "Dyrektor generalna Parvah Di Banco.",
    content: "Julia de Naraho pełni funkcję dyrektor generalnej Parvah Di Banco. W kanonie wskazano wiek 26 lat.",
    infobox: { status: "Żyje", stanowisko: "CEO Parvah Di Banco", "wiek wskazany w kanonie": "26 lat" },
    tags: ["bankowość", "Profan", "biznes"],
  },
  {
    slug: "lucjan-tauron",
    title: "Lucjan Tauron",
    type: EntryType.CHARACTER,
    summary: "Założyciel Taurona, producenta niedrogich samochodów i motocykli.",
    content: "## Pochodzenie\n\nJego matką jest Jadwiga Berrani, babcią Hanna Berrani, a ojciec był mechanikiem i nosił nazwisko Tauron. Lucjan jest spokrewniony z wielkim rodem Berrani, lecz nosi nazwisko ojca.\n\n## Styl życia\n\nMieszka w Bernie w prowincji Berrani. Nie ma jachtu ani rezydencji w Octavii, nie mieszka w Profan, unika zdjęć i nie ma publicznego konta Xen. Sam jeździ Tauronem. Otwarcie mówi o pomocy rodziny Berrani.",
    infobox: { status: "Żyje", matka: "Jadwiga Berrani", babcia: "Hanna Berrani", miejsce: "Berno, Berrani", zawód: "Założyciel Taurona" },
    tags: ["Tauron", "Berrani", "biznes"],
    featured: true,
  },
  {
    slug: "nasir-nagiedi",
    title: "Nasir Nagiedi",
    type: EntryType.CHARACTER,
    summary: "Twórca XAir, który po przejęciu firmy otrzymał udziały w Xen.",
    content: "Nasir Nagiedi stworzył XAir. Po przejęciu spółki przez Xen otrzymał między innymi około 0,09% udziałów Xen, wycenianych przy wartości firmy 6 bln orenów na około 5,4 mld orenów.",
    infobox: { status: "Żyje", zawód: "Twórca XAir", "udziały w Xen": "około 0,09%", "wartość udziałów": "około 5,4 mld orenów" },
    tags: ["XAir", "Xen", "AI"],
  },
];

const provinces: SeedEntry[] = [
  {
    slug: "ldei",
    title: "Ldei",
    type: EntryType.PROVINCE,
    summary: "Prowincja stołeczna Imperium, w której znajduje się Cita de la Luce.",
    content: "Ldei jest prowincją stołeczną. Znajduje się w niej Cita de la Luce, nazywana złotym miastem. Dominującym językiem jest Latin.",
    infobox: { status: "Prestiżowa", stolica: "Cita de la Luce", język: "Latin", populacja: "Brak danych", klimat: "Brak danych" },
    tags: ["prowincja stołeczna", "Latin"],
    featured: true,
  },
  {
    slug: "lacjum",
    title: "Lacjum",
    type: EntryType.PROVINCE,
    summary: "Prowincja granicząca z Ldei i jedno z najważniejszych centrów akademickich.",
    content: "Lacjum graniczy z Ldei. Superszybka kolej pozwala dotrzeć do Cita de la Luce w około 15 minut. Prowincja jest dużym centrum akademickim.",
    infobox: { status: "Brak danych", stolica: "Brak danych", język: "Brak danych", sąsiedztwo: "Ldei", "czas kolei do stolicy": "około 15 minut" },
    tags: ["nauka", "kolej"],
    featured: true,
  },
  {
    slug: "profan",
    title: "Profan",
    type: EntryType.PROVINCE,
    summary: "Miasto-prowincja bez wsi, najważniejsze centrum finansowe Imperium.",
    content: "## Charakter\n\nProfan jest jedyną prowincją bez wsi. Używa się tu języka hańskiego w odmianie profańskiej.\n\n## Finanse i przestrzeń\n\nTo wielkie centrum finansowe z jeziorami Muetersee i Bluesee. Przy Bluesee stoją bardzo wysokie wieżowce, a ceny nieruchomości należą do ekstremalnych.",
    infobox: { typ: "Miasto-prowincja", wsie: "Brak", język: "Hański — odmiana profańska", jeziora: "Muetersee, Bluesee", gospodarka: "Finanse" },
    tags: ["finanse", "hański", "miasto-prowincja"],
    featured: true,
  },
  {
    slug: "delanium",
    title: "Delanium",
    type: EntryType.PROVINCE,
    summary: "Prowincja, w której używa się języka Delan.",
    content: noData,
    infobox: { język: "Delan", stolica: "Brak danych", populacja: "Brak danych", klimat: "Brak danych" },
    tags: ["Delan"],
  },
  {
    slug: "montes",
    title: "Montes",
    type: EntryType.PROVINCE,
    summary: "Ekstremalnie zimna, górska prowincja o silnej kulturze wysokogórskiej.",
    content: "Temperatury w Montes mogą spadać do około -70°C. Prowincja ma silną kulturę wysokogórską, elitarne środowisko wspinaczkowe oraz ośrodki biologii środowisk ekstremalnych.",
    infobox: { klimat: "Ekstremalnie zimny", "temperatura minimalna": "około -70°C", teren: "Góry", język: "Montes" },
    tags: ["góry", "zimno", "Montes"],
    featured: true,
  },
  {
    slug: "vir",
    title: "Vir",
    type: EntryType.PROVINCE,
    summary: "Prowincja zamieszkana przez bardzo zamkniętą społeczność posługującą się tonalnym językiem Vir.",
    content: "Społeczność Vir jest bardzo zamknięta. Jej język jest tonalny, melodyjny i bardzo trudny dla obcych.",
    infobox: { język: "Vir", społeczność: "Bardzo zamknięta", stolica: "Brak danych", populacja: "Brak danych" },
    tags: ["Vir", "język tonalny"],
  },
  {
    slug: "berrani",
    title: "Berrani",
    type: EntryType.PROVINCE,
    summary: "Prowincja związana z wielkim rodem Berrani i miastem Berno.",
    content: "W Bernie w prowincji Berrani mieszka Lucjan Tauron. Pozostałe dane nie zostały jeszcze ustalone.",
    infobox: { stolica: "Brak danych", miasto: "Berno", język: "Berrani", wielki_ród: "Berrani" },
    tags: ["Berrani", "Berno"],
  },
  {
    slug: "montreli",
    title: "Montreli",
    type: EntryType.PROVINCE,
    summary: "Prowincja rozwijająca szkoły marynarskie i szkolenie oficerów Marynarki.",
    content: "Montreli jest związane ze szkołami marynarskimi i szkoleniem oficerów Marynarki Imperium.",
    infobox: { język: "Montreli", specjalizacja: "Szkolnictwo marynarskie", stolica: "Brak danych", populacja: "Brak danych" },
    tags: ["marynarka", "Montreli"],
  },
  {
    slug: "mauretania",
    title: "Mauretania",
    type: EntryType.PROVINCE,
    summary: "Jedna z prowincji potocznie określanych jako „wrogie”, zamieszkana przez użytkowników Mauru.",
    content: "Nieformalnie Mauretania jest zaliczana do dziesięciu „wrogich” prowincji. Mediana wynagrodzenia wynosi około 2000 orenów miesięcznie. Podział na prowincje prestiżowe, neutralne i wrogie nie ma statusu oficjalnego.",
    infobox: { "status nieformalny": "Wroga", język: "Mauru", "mediana wynagrodzenia": "około 2000 orenów/mies.", stolica: "Brak danych" },
    tags: ["Mauru", "prowincja wroga"],
    featured: true,
  },
];

const languages: SeedEntry[] = [
  {
    slug: "imperial-latin",
    title: "Imperial Latin",
    type: EntryType.LANGUAGE,
    summary: "Archaiczny, melodyjny język elit i domowy język dynastii de la Cruz.",
    content: "Imperial Latin zachowuje ciągłość pozwalającą współczesnemu użytkownikowi porozumieć się z człowiekiem sprzed około 600 lat. Jest obowiązkowy na Uniwersytecie Michalusa i używany przez Spezzi.",
    infobox: { status: "Urzędowy", charakter: "Archaiczny, melodyjny, długi", użytkownicy: "Elity, dynastia de la Cruz, Spezzi", uczelnia: "Obowiązkowy na Uniwersytecie Michalusa" },
    tags: ["język urzędowy", "elity", "dynastia"],
    featured: true,
  },
  {
    slug: "latin",
    title: "Latin",
    type: EntryType.LANGUAGE,
    summary: "Najważniejsza lingua franca Imperium, z około 450 mln rodzimych użytkowników.",
    content: "Bez znajomości Latin bardzo trudno funkcjonować poza własną prowincją. Język dominuje w codziennym życiu oraz na platformie Xen.",
    infobox: { status: "Urzędowy", rola: "Główna lingua franca", "native speakerzy": "około 450 mln", platforma: "Dominuje w Xen" },
    tags: ["język urzędowy", "lingua franca", "Xen"],
    featured: true,
  },
  {
    slug: "hanski",
    title: "Hański",
    type: EntryType.LANGUAGE,
    summary: "Język pochodzący z prowincji Han, używany także w Profan.",
    content: "Hański ma klimat niemiecko-szwajcarsko-austriacki z wpływami włoskimi. W Profan występuje odmiana profańska.",
    infobox: { status: "Urzędowy", pochodzenie: "Han", odmiana: "Profańska", inspiracje: "Niemiecki, szwajcarski, austriacki, włoski" },
    tags: ["język urzędowy", "Han", "Profan"],
  },
  {
    slug: "delan",
    title: "Delan",
    type: EntryType.LANGUAGE,
    summary: "Melodyjny język najbliżej spokrewniony z Latin.",
    content: "Delan łączy inspiracje portugalskie i włoskie. Jest bardziej melodyjny niż Latin i ma wiele false friends.",
    infobox: { status: "Urzędowy", pokrewieństwo: "Najbliższy Latin", inspiracje: "Portugalski i włoski", cecha: "Liczne false friends" },
    tags: ["język urzędowy", "Delanium", "false friends"],
  },
  {
    slug: "montes-jezyk",
    title: "Montes — język",
    type: EntryType.LANGUAGE,
    summary: "Język prowincji Montes, inspirowany szwedzkim i językami uralskimi.",
    content: noData,
    infobox: { status: "Urzędowy", prowincja: "Montes", inspiracje: "Szwedzki i języki uralskie" },
    aliases: ["Język Montes"],
    tags: ["język urzędowy", "Montes"],
  },
  {
    slug: "berrani-jezyk",
    title: "Berrani — język",
    type: EntryType.LANGUAGE,
    summary: "Język inspirowany francuskim i angielskim.",
    content: noData,
    infobox: { status: "Urzędowy", prowincja: "Berrani", inspiracje: "Francuski i angielski" },
    aliases: ["Język Berrani"],
    tags: ["język urzędowy", "Berrani"],
  },
  {
    slug: "montreli-jezyk",
    title: "Montreli — język",
    type: EntryType.LANGUAGE,
    summary: "Język inspirowany holenderskim i włoskim.",
    content: noData,
    infobox: { status: "Urzędowy", prowincja: "Montreli", inspiracje: "Holenderski i włoski" },
    aliases: ["Język Montreli"],
    tags: ["język urzędowy", "Montreli"],
  },
  {
    slug: "vir-jezyk",
    title: "Vir — język",
    type: EntryType.LANGUAGE,
    summary: "Bardzo melodyjny, tonalny język trudny dla osób z zewnątrz.",
    content: "Język Vir jest tonalny i fonetycznie podobny do kantońskiego. Zamknięty charakter społeczności Vir dodatkowo utrudnia naukę osobom obcym.",
    infobox: { status: "Urzędowy", prowincja: "Vir", typ: "Tonalny", podobieństwo: "Fonetycznie podobny do kantońskiego", trudność: "Bardzo wysoka dla obcych" },
    aliases: ["Język Vir"],
    tags: ["język urzędowy", "Vir", "język tonalny"],
  },
];

const companies: SeedEntry[] = [
  {
    slug: "xen",
    title: "Xen",
    type: EntryType.COMPANY,
    summary: "Ogromna platforma społecznościowa, płatnicza i usługowa, praktycznie too big to fail.",
    content: "## Skala\n\nXen ma około 970 mln zarejestrowanych użytkowników. Większość treści jest w Latin.\n\n## Usługi\n\nEkosystem obejmuje Scan Xen, płatności QR z integracją bankową i KYC, OnlyXen, Turon$ex 19+, XAir AI oraz PrivXen.\n\n## PrivXen\n\nPrivXen ma około 5 mln użytkowników, działa wyłącznie na zaproszenie i stosuje wewnętrzny ranking dostępu.",
    infobox: { założyciel: "Fryderyk von Honhold / Turon Xen", użytkownicy: "około 970 mln", wycena: "około 6 bln orenów", "udział Turona": "około 18%", "udział Parvah Di Banco": "około 10%", status: "Too big to fail" },
    tags: ["technologia", "finanse", "Latin", "too big to fail"],
    featured: true,
  },
  {
    slug: "xair",
    title: "XAir",
    type: EntryType.COMPANY,
    summary: "Spółka AI dla ludzi, kupiona przez Xen i zachowana jako osobna spółka zależna.",
    content: "XAir zostało stworzone przez Nasira Nagiediego. Po przejęciu przez Xen firma nadal działa jako osobna spółka zależna.",
    infobox: { twórca: "Nasir Nagiedi", właściciel: "Xen", status: "Spółka zależna", specjalizacja: "AI dla ludzi" },
    tags: ["AI", "Xen"],
    featured: true,
  },
  {
    slug: "parvah-di-banco",
    title: "Parvah Di Banco",
    type: EntryType.COMPANY,
    summary: "Największy bank Imperium, z siedzibą w najwyższym budynku Profan.",
    content: "## Siedziba\n\nBank mieści się w 110-piętrowym, najwyższym budynku Profan.\n\n## Udziały\n\nParvah Di Banco posiada około 10% Xen i około 6% Taurona. Bank jest uważany za too big to fail.\n\n## Ród\n\nLeoniddus V Parvah dysponuje majątkiem około 1,3 bln orenów, największym prywatnym majątkiem w Imperium.",
    infobox: { branża: "Bankowość", siedziba: "Profan", budynek: "110 pięter", CEO: "Julia de Naraho", "udział w Xen": "około 10%", "udział w Tauron": "około 6%", status: "Too big to fail" },
    tags: ["bank", "Profan", "too big to fail"],
    featured: true,
  },
  {
    slug: "sicario-bank",
    title: "Sicario Bank",
    type: EntryType.COMPANY,
    summary: "Bank z siedzibą w Profan, noszący nazwę w Latin.",
    content: "Sicario Bank ma siedzibę w Profan. Majątek Siccario wynosi około 500 mld orenów.",
    infobox: { branża: "Bankowość", siedziba: "Profan", "majątek Siccario": "około 500 mld orenów", "język nazwy": "Latin" },
    aliases: ["Siccario", "Sicario"],
    tags: ["bank", "Profan"],
  },
  {
    slug: "tauron",
    title: "Tauron",
    type: EntryType.COMPANY,
    summary: "Producent niedrogich samochodów i motocykli dla masowego rynku.",
    content: "Tauron produkuje samochody od około 15 tys. orenów i motocykle od około 1–2 tys. orenów. Marka jest szczególnie popularna w dziesięciu biedniejszych prowincjach, zamieszkanych łącznie przez około 500 mln ludzi.",
    infobox: { założyciel: "Lucjan Tauron", segment: "Masowy rynek", "samochody od": "około 15 tys. orenów", "motocykle od": "około 1–2 tys. orenów", "udział Parvah Di Banco": "około 6%" },
    tags: ["motoryzacja", "masowy rynek"],
    featured: true,
  },
  {
    slug: "candelabrum",
    title: "Candelabrum",
    type: EntryType.COMPANY,
    summary: "Producent luksusowych zegarków i samochodów, powstały po konflikcie z Lusso.",
    content: "## Początki motoryzacji\n\nOkoło 180 lat temu CEO Maxim Cande jeździł Lusso i krytykował jego rozwiązania techniczne. Po wyśmianiu przez Lusso postanowił zbudować własny samochód.\n\n## Serie\n\nMin, B, S oraz XC. Seria XC kosztuje około 400–800 tys. orenów i więcej. Jest popularna w Profan wśród młodych przedsiębiorców i nowych pieniędzy.",
    infobox: { branża: "Zegarki i motoryzacja", CEO: "Maxim Cande (około 180 lat temu)", serie: "Min, B, S, XC", "cena XC": "około 400–800 tys. orenów i więcej" },
    tags: ["motoryzacja", "luksus", "zegarki"],
  },
  {
    slug: "lusso",
    title: "Lusso",
    type: EntryType.COMPANY,
    summary: "Stary producent luksusowych samochodów, kojarzony z prestiżem elit.",
    content: "Ceny Lusso zaczynają się od około 400 tys. orenów. Firma planowała wejść w tańszy segment, ale rozwój Candelabrum utrudnił ten plan i przedsięwzięcie porzucono.",
    infobox: { branża: "Motoryzacja luksusowa", "ceny od": "około 400 tys. orenów", wizerunek: "Stary prestiż i elity" },
    tags: ["motoryzacja", "luksus", "stare pieniądze"],
  },
  {
    slug: "caugh",
    title: "Caugh",
    type: EntryType.COMPANY,
    summary: "Prestiżowa marka wyścigowa założona przez byłego inżyniera Candelabrum.",
    content: "Fryderyk von Caugh odpowiadał w Candelabrum za segment sportowy. Gdy chciał zmienić sprzęgło, Maxim Cande odpowiedział: „To mój samochód”. Caugh odszedł i założył własną markę. Samochody kosztują około 500 tys. orenów i więcej.",
    infobox: { założyciel: "Fryderyk von Caugh", branża: "Motorsport i samochody sportowe", "ceny od": "około 500 tys. orenów", skala: "Mniejsza od Lusso i Candelabrum" },
    tags: ["motoryzacja", "motorsport", "luksus"],
  },
  {
    slug: "solaris",
    title: "Solaris",
    type: EntryType.COMPANY,
    summary: "Firma związana z siecią uczelni Solaris Di Uni w Lacjum.",
    content: "Do Solaris należą uczelnie Solaris Di Uni, specjalizujące się w energetyce, atomistyce, geologii i wulkanologii.",
    infobox: { branża: "Brak danych", uczelnie: "Solaris Di Uni", prowincja: "Lacjum" },
    tags: ["nauka", "energetyka", "Lacjum"],
  },
];

const events: SeedEntry[] = [
  { slug: "przybycie-ludzi-z-ziemi", title: "Przybycie ludzi z Ziemi", type: EntryType.EVENT, summary: "Najwcześniejsza z wymienionych epok historii świata.", content: noData, infobox: { rok: "Brak danych", epoka: "Przed Imperium", kategoria: "Społeczne", kolejnosc: -5 }, tags: ["społeczne"] },
  { slug: "katastrofa", title: "Katastrofa", type: EntryType.EVENT, summary: "Katastrofa należąca do najstarszej historii osadnictwa.", content: noData, infobox: { rok: "Brak danych", epoka: "Przed Imperium", kategoria: "Katastrofy", kolejnosc: -4 }, tags: ["katastrofy"] },
  { slug: "krolestwo-mazuri", title: "Królestwo Mazuri", type: EntryType.EVENT, summary: "Epoka Królestwa Mazuri.", content: noData, infobox: { rok: "Brak danych", epoka: "Przed Imperium", kategoria: "Polityka", kolejnosc: -3 }, tags: ["polityka"] },
  { slug: "powstanie-hekanii", title: "Powstanie Hekanii", type: EntryType.EVENT, summary: "Migracja części ludności za ocean i utworzenie Hekanii.", content: noData, infobox: { rok: "Brak danych", epoka: "Przed Imperium", kategoria: "Społeczne", kolejnosc: -2 }, tags: ["społeczne", "polityka"] },
  { slug: "krolestwo-maura", title: "Królestwo Maura", type: EntryType.EVENT, summary: "Epoka Królestwa Maura.", content: noData, infobox: { rok: "Brak danych", epoka: "Przed Imperium", kategoria: "Polityka", kolejnosc: -1 }, tags: ["polityka"] },
  { slug: "rewolucja-michalusa", title: "Rewolucja Michalusa", type: EntryType.EVENT, summary: "Zryw w Tsana i Lacjum przeciw królowej Puixi; początek rachuby lat Imperium.", content: "Rok 0 oznacza powstanie Partii Technokratycznej i początek rewolucji. Wojna zakończyła się w Roku 10.", infobox: { rok: 0, zakończenie: "Rok 10", miejsca: "Tsana, Lacjum", kategoria: "Wojny / polityka", kolejnosc: 0 }, tags: ["wojny", "polityka"], featured: true },
  { slug: "bitwa-mauretanii", title: "Bitwa Mauretanii", type: EntryType.EVENT, summary: "Wielka bitwa Roku 7, stoczona przez siły liczące około 40 tys. i 70 tys. ludzi.", content: noData, infobox: { rok: 7, siły: "około 40 tys. przeciw około 70 tys.", kategoria: "Wojny", kolejnosc: 7 }, tags: ["wojny", "Mauretania"], featured: true },
  { slug: "eksplozja-w-rnt", title: "Eksplozja w RNT", type: EntryType.EVENT, summary: "Eksplozja Roku 13, która doprowadziła do eliminacji Frontu.", content: noData, infobox: { rok: 13, skutek: "Eliminacja Frontu", kategoria: "Polityka / katastrofy", kolejnosc: 13 }, tags: ["polityka", "katastrofy"] },
  { slug: "konstytucja-roku-13", title: "Konstytucja Roku 13", type: EntryType.EVENT, summary: "Ustanowienie systemu jednej Partii Technokratycznej oraz nowego porządku wyborczego.", content: "Konstytucja ustanowiła jedną Partię Technokratyczną. W wyborach sześć prowincji poparło PT, a cztery NWF.", infobox: { rok: 13, kategoria: "Polityka", system: "Jedna partia — PT", kolejnosc: 13.1 }, tags: ["polityka"] },
  { slug: "era-trybunow", title: "Era Trybunów", type: EntryType.EVENT, summary: "Okres obejmujący około 200 lat trybunatu Berrani i 170 lat trybunatu Montes.", content: "Trybunat Berrani rozpoczął się po śmierci Juana. Trwał około 200 lat, po czym nastąpił trwający około 170 lat trybunat Montes.", infobox: { rok: "Brak dokładnej daty", okres: "Berrani: około 200 lat; Montes: około 170 lat", kategoria: "Polityka", kolejnosc: 20 }, tags: ["polityka", "dynastia"] },
  { slug: "poczatek-dynastii-de-la-cruz", title: "Początek dynastii de la Cruz", type: EntryType.EVENT, summary: "Objęcie tronu przez Octaviana Wielkiego po obaleniu Trybuna.", content: noData, infobox: { rok: "Brak dokładnej daty", postać: "Octavian Wielki", kategoria: "Dynastia", kolejnosc: 30 }, tags: ["dynastia", "polityka"], featured: true },
];

const otherEntries: SeedEntry[] = [
  {
    slug: "dynastia-de-la-cruz",
    title: "Dynastia de la Cruz",
    type: EntryType.DYNASTY,
    summary: "Panująca dynastia Imperium, zapoczątkowana przez Octaviana Wielkiego.",
    content: "## Główna linia sukcesji\n\nOctavian Wielki → Teodozjusz I → Francesco → Teodozjusz II → Ignacius.\n\n## Genealogia\n\nIzabela de la Cruz była matką bliźniąt Octaviana Wielkiego i Octavii de la Cruz. Teodozjusz I był synem Octaviana Wielkiego oraz ojcem braci Francesco i Teodozjusza II. Teodozjusz II był ojcem Octaviana i Ignaciusa.\n\nKonstancja jest córką Ignaciusa i nie jest obecnie cesarzową. Michał de la Cruz nosi tytuł Najwyższego Księcia Imperium.",
    infobox: { założyciel: "Octavian Wielki", obecny_cesarz: "Ignacius", obecny_rok: 607, język_domowy: "Imperial Latin", siedziba: "Brak danych" },
    tags: ["dynastia", "cesarze", "sukcesja"],
    featured: true,
  },
  {
    slug: "rod-berrani",
    title: "Ród Berrani",
    type: EntryType.HOUSE,
    summary: "Jeden z wielkich rodów Imperium, związany z prowincją Berrani.",
    content: "Z rodem Berrani spokrewniony jest Lucjan Tauron przez matkę Jadwigę Berrani i babcię Hannę Berrani. Pozostałe dane nie zostały jeszcze ustalone.",
    infobox: { prowincja: "Berrani", siedziba: "Brak danych", głowa_rodu: "Brak danych", wasale: "Brak danych" },
    tags: ["wielki ród", "Berrani"],
  },
  {
    slug: "rod-parvah",
    title: "Ród Parvah",
    type: EntryType.HOUSE,
    summary: "Ród bankierski związany z Parvah Di Banco.",
    content: "Leoniddus V Parvah dysponuje największym prywatnym majątkiem w Imperium, wycenianym na około 1,3 bln orenów.",
    infobox: { prowincja: "Profan", majątek: "Leoniddus V: około 1,3 bln orenów", firma: "Parvah Di Banco", wasale: "Brak danych" },
    tags: ["wielki ród", "bankowość", "Profan"],
  },
  {
    slug: "system-neofeudalny",
    title: "System neofeudalny Imperium",
    type: EntryType.INSTITUTION,
    summary: "Układ zależności, w którym cesarz ma około sześciu głównych rodów wasalnych.",
    content: "Każdy wielki ród może mieć własnych wasali. Obowiązuje zasada: „Wasal mojego wasala jest również moim wasalem”.",
    infobox: { zwierzchnik: "Cesarz", "główne rody wasalne": "około 6", zasada: "Wasal mojego wasala jest również moim wasalem" },
    tags: ["neofeudalizm", "rody", "cesarz"],
  },
  {
    slug: "rnt",
    title: "RNT",
    type: EntryType.INSTITUTION,
    summary: "Wyższa instytucja ustrojowa Imperium.",
    content: noData,
    infobox: { poziom: "Wyższa", typ: "Instytucja państwowa", siedziba: "Brak danych" },
    tags: ["państwo", "polityka"],
  },
  {
    slug: "nrnt",
    title: "NRNT",
    type: EntryType.INSTITUTION,
    summary: "Niższa instytucja ustrojowa Imperium.",
    content: noData,
    infobox: { poziom: "Niższa", typ: "Instytucja państwowa", siedziba: "Brak danych" },
    tags: ["państwo", "polityka"],
  },
  {
    slug: "uniwersytet-michalusa",
    title: "Uniwersytet Michalusa",
    type: EntryType.UNIVERSITY,
    summary: "Najbardziej prestiżowa uczelnia społeczno-polityczna Imperium.",
    content: "Kierunki często mają najwyżej około 50 miejsc. Uczelnia jest bardzo droga, a osoby spoza elit praktycznie potrzebują stypendium. Wymagane są ekstremalnie wysokie wyniki — często około pięciu testów na poziomie 98,9% — oraz wyjątkowe osiągnięcia. Imperial Latin jest obowiązkowy.\n\nUczelnia słynie z muzyki, dyplomacji, medycyny, językoznawstwa, historii, matematyki, fizyki teoretycznej, astronomii i astrofizyki.",
    infobox: { profil: "Społeczno-polityczny i naukowy", "miejsca na kierunku": "często do około 50", język_obowiązkowy: "Imperial Latin", czesne: "Bardzo wysokie" },
    tags: ["nauka", "elity", "Imperial Latin"],
    featured: true,
  },
  {
    slug: "puoh",
    title: "PUÖH",
    type: EntryType.UNIVERSITY,
    summary: "Profaner Universität für Ökonomie und Handel — uczelnia ekonomiczna w Profan.",
    content: "PUÖH specjalizuje się w ekonomii, handlu, zarządzaniu i bankowości.",
    infobox: { pełna_nazwa: "Profaner Universität für Ökonomie und Handel", prowincja: "Profan", specjalizacje: "Ekonomia, handel, zarządzanie, bankowość" },
    tags: ["Profan", "ekonomia", "bankowość"],
  },
  {
    slug: "solaris-di-uni",
    title: "Solaris Di Uni",
    type: EntryType.UNIVERSITY,
    summary: "Sieć uczelni firmy Solaris w Lacjum.",
    content: "Solaris Di Uni specjalizuje się w energetyce, atomistyce, geologii i wulkanologii.",
    infobox: { prowincja: "Lacjum", właściciel: "Solaris", specjalizacje: "Energetyka, atomistyka, geologia, wulkanologia" },
    tags: ["Lacjum", "energetyka", "nauka"],
  },
  {
    slug: "cesarska-akademia-lotnicza-w-lacjum",
    title: "Cesarska Akademia Lotnicza w Lacjum",
    type: EntryType.UNIVERSITY,
    summary: "Uczelnia przygotowująca do kariery pilota, w tym pilota Jugon 11X.",
    content: noData,
    infobox: { prowincja: "Lacjum", profil: "Lotnictwo", ścieżka: "Kariera pilota, m.in. Jugon 11X" },
    tags: ["Lacjum", "lotnictwo", "wojsko"],
  },
  {
    slug: "montes-hogsta-lagakademi",
    title: "Montes Högsta Lagakademi",
    type: EntryType.UNIVERSITY,
    summary: "Akademia prawa, prokuratury i sądownictwa w Montes.",
    content: noData,
    infobox: { prowincja: "Montes", specjalizacje: "Prawo, prokuratura, sądownictwo" },
    tags: ["Montes", "prawo"],
  },
  {
    slug: "hierarchia-wojsk-ladowych",
    title: "Hierarchia wojsk lądowych",
    type: EntryType.MILITARY,
    summary: "System stopni wojsk lądowych Imperium, zwieńczony urzędem Trybuna Generalskiego.",
    content: "1. Trybun Generalski — jedna osoba, szef Sił Zbrojnych i wojsk lądowych\n2. Najwyższy Generał — cztery osoby: Północ, Południe, Wschód i Zachód\n3. Generał Arbiter\n4. Generał\n5. Audiant\n6. Pułkownik\n7. Podpułkownik\n8. Sierżant\n9. Starszy Szeregowy\n10. Szeregowy",
    infobox: { zwierzchnik: "Trybun Generalski", "liczba Najwyższych Generałów": "4", armie: "Północ, Południe, Wschód, Zachód" },
    tags: ["wojsko", "stopnie"],
    featured: true,
  },
  {
    slug: "dowodztwo-sil-zbrojnych",
    title: "Dowództwo Sił Zbrojnych",
    type: EntryType.MILITARY,
    summary: "Struktura dowódcza wojsk lądowych, Marynarki, Lotnictwa i Sił Orbitalnych.",
    content: "Potrybun Marynarki, Potrybun Lotnictwa i Potrybun Sił Orbitalnych podlegają Trybunowi Generalskiemu, podobnie jak wojska lądowe.",
    infobox: { zwierzchnik: "Trybun Generalski", marynarka: "Potrybun Marynarki", lotnictwo: "Potrybun Lotnictwa", siły_orbitalne: "Potrybun Sił Orbitalnych" },
    tags: ["wojsko", "marynarka", "lotnictwo", "orbitalne"],
  },
  {
    slug: "gora-juan",
    title: "Góra Juan",
    type: EntryType.GEOGRAPHY,
    summary: "Najwyższy szczyt Imperium, liczący około 9400 metrów.",
    content: "Góra leży niedaleko Lacjum i Profan. Ma stosunkowo ciepły klimat jak na tę wysokość: zimą około -15°C na szczycie, latem nawet około +5°C. Główne zagrożenia to bardzo częste lawiny, wiatr przekraczający 300 km/h i choroba wysokościowa. Wejście bez tlenu jest elitarnym osiągnięciem.",
    infobox: { wysokość: "około 9400 m", położenie: "Niedaleko Lacjum / Profan", "zima na szczycie": "około -15°C", "lato na szczycie": "do około +5°C", wiatr: "300 km/h i więcej" },
    tags: ["góry", "wspinaczka", "Lacjum", "Profan"],
    featured: true,
  },
  {
    slug: "gora-smierci",
    title: "Góra Śmierci",
    type: EntryType.GEOGRAPHY,
    summary: "Ekstremalnie zimny i technicznie trudny sześciotysięcznik w Montes.",
    content: "Na Górze Śmierci temperatury mogą spadać do około -80°C. Występują ekstremalne wiatry, uskoki i trudne ściany. Specjalne kombinezony są konieczne.",
    infobox: { wysokość: "około 6000 m", prowincja: "Montes", temperatura: "do około -80°C", trudność: "Ekstremalna", wyposażenie: "Kombinezony konieczne" },
    tags: ["góry", "wspinaczka", "Montes"],
  },
  {
    slug: "cita-de-la-luce",
    title: "Cita de la Luce",
    type: EntryType.CITY,
    summary: "Stołeczne „złote miasto” położone w prowincji Ldei.",
    content: noData,
    infobox: { prowincja: "Ldei", status: "Stolica", przydomek: "Złote miasto", język: "Latin" },
    tags: ["stolica", "Ldei", "Latin"],
    featured: true,
  },
];

export const allEntries = [...characters, ...provinces, ...languages, ...companies, ...events, ...otherEntries];

export const relations: ReadonlyArray<readonly [string, string, string, string, boolean?]> = [
  ["izabela-de-la-cruz", "octavian-wielki", "child", "Octavian Wielki był synem Izabeli de la Cruz."],
  ["octavian-wielki", "izabela-de-la-cruz", "mother", "Izabela de la Cruz była matką Octaviana Wielkiego."],
  ["izabela-de-la-cruz", "octavia-de-la-cruz", "child", "Octavia de la Cruz była córką Izabeli de la Cruz."],
  ["octavia-de-la-cruz", "izabela-de-la-cruz", "mother", "Izabela de la Cruz była matką Octavii de la Cruz."],
  ["octavian-wielki", "octavia-de-la-cruz", "twin", "Octavia de la Cruz była siostrą bliźniaczką Octaviana Wielkiego.", true],
  ["octavia-de-la-cruz", "octavian-wielki", "twin", "Octavian Wielki był bratem bliźniakiem Octavii de la Cruz.", true],
  ["octavian-wielki", "teodozjusz-i", "child", "Teodozjusz I był synem Octaviana Wielkiego."],
  ["teodozjusz-i", "octavian-wielki", "father", "Octavian Wielki był ojcem Teodozjusza I."],
  ["teodozjusz-i", "francesco-de-la-cruz", "child", "Francesco był synem Teodozjusza I."],
  ["francesco-de-la-cruz", "teodozjusz-i", "father", "Teodozjusz I był ojcem Francesco."],
  ["teodozjusz-i", "teodozjusz-ii", "child", "Teodozjusz II był synem Teodozjusza I."],
  ["teodozjusz-ii", "teodozjusz-i", "father", "Teodozjusz I był ojcem Teodozjusza II."],
  ["francesco-de-la-cruz", "teodozjusz-ii", "sibling", "Teodozjusz II był młodszym bratem Francesco."],
  ["teodozjusz-ii", "francesco-de-la-cruz", "sibling", "Francesco był starszym bratem Teodozjusza II."],
  ["teodozjusz-ii", "octavian-syn-teodozjusza-ii", "child", "Octavian był synem Teodozjusza II."],
  ["octavian-syn-teodozjusza-ii", "teodozjusz-ii", "father", "Teodozjusz II był ojcem Octaviana."],
  ["teodozjusz-ii", "ignacius-de-la-cruz", "child", "Ignacius był synem Teodozjusza II."],
  ["ignacius-de-la-cruz", "teodozjusz-ii", "father", "Teodozjusz II był ojcem Ignaciusa."],
  ["octavian-syn-teodozjusza-ii", "ignacius-de-la-cruz", "sibling", "Ignacius był młodszym bratem Octaviana."],
  ["ignacius-de-la-cruz", "octavian-syn-teodozjusza-ii", "sibling", "Octavian był starszym bratem Ignaciusa."],
  ["ignacius-de-la-cruz", "konstancja-de-la-cruz", "child", "Konstancja była córką Ignaciusa."],
  ["konstancja-de-la-cruz", "ignacius-de-la-cruz", "father", "Ignacius był ojcem Konstancji."],
  ["octavian-syn-teodozjusza-ii", "michal-de-la-cruz", "child", "Michał de la Cruz był synem Octaviana."],
  ["michal-de-la-cruz", "octavian-syn-teodozjusza-ii", "father", "Octavian był ojcem Michała de la Cruz."],
  ["octavian-wielki", "teodozjusz-i", "successor", "Teodozjusz I objął tron po Octavianie Wielkim."],
  ["teodozjusz-i", "octavian-wielki", "predecessor", "Octavian Wielki był poprzednikiem Teodozjusza I."],
  ["teodozjusz-i", "francesco-de-la-cruz", "successor", "Francesco objął tron po Teodozjuszu I."],
  ["francesco-de-la-cruz", "teodozjusz-i", "predecessor", "Teodozjusz I był poprzednikiem Francesco."],
  ["francesco-de-la-cruz", "teodozjusz-ii", "successor", "Teodozjusz II objął tron po bezdzietnej śmierci Francesco."],
  ["teodozjusz-ii", "francesco-de-la-cruz", "predecessor", "Francesco był poprzednikiem Teodozjusza II."],
  ["teodozjusz-ii", "ignacius-de-la-cruz", "successor", "Ignacius objął tron po Teodozjuszu II."],
  ["ignacius-de-la-cruz", "teodozjusz-ii", "predecessor", "Teodozjusz II był poprzednikiem Ignaciusa."],
  ["michal-de-la-cruz", "konstancja-de-la-cruz", "other", "Kuzynostwo; wychowywali się jak rodzeństwo."],
  ["michal-de-la-cruz", "liliana-de-la-cruz", "other", "Wychowywali się jak rodzeństwo."],
  ["fryderyk-von-honhold", "xen", "other", "Fryderyk von Honhold założył Xen."],
  ["nasir-nagiedi", "xair", "other", "Nasir Nagiedi stworzył XAir."],
  ["julia-de-naraho", "parvah-di-banco", "other", "Julia de Naraho jest dyrektor generalną banku."],
  ["lucjan-tauron", "tauron", "other", "Lucjan Tauron założył markę Tauron."],
  ["xen", "xair", "other", "XAir działa jako osobna spółka zależna Xen."],
];

async function main(): Promise<void> {
  const entryIds = new Map<string, string>();

  for (const item of allEntries) {
    const searchText = [item.title, item.summary, item.content, ...(item.aliases ?? []), ...(item.tags ?? []), ...Object.values(item.infobox ?? {})]
      .filter(Boolean)
      .join(" ");

    const canonicalData = {
      title: item.title,
      firstName: item.firstName ?? null,
      lastName: item.lastName ?? null,
      honorific: item.honorific ?? null,
      type: item.type,
      status: PublicationStatus.PUBLISHED,
      summary: item.summary,
      content: item.content,
      searchText,
      aliases: item.aliases ?? [],
      tags: item.tags ?? [],
      infobox: (item.infobox ?? {}) as Prisma.InputJsonValue,
      isFeatured: item.featured ?? false,
      birthYear: item.birthYear ?? null,
      deathYear: item.deathYear ?? null,
      reignStartYear: item.reignStartYear ?? null,
      reignEndYear: item.reignEndYear ?? null,
    };

    const seeded = await prisma.entry.upsert({
      where: { slug: item.slug },
      update: canonicalData,
      create: {
        slug: item.slug,
        ...canonicalData,
        revisions: {
          create: {
            title: item.title,
            summary: item.summary,
            content: item.content,
            infobox: (item.infobox ?? {}) as Prisma.InputJsonValue,
            changeNote: "Dane demonstracyjne MVP",
          },
        },
      },
    });
    entryIds.set(item.slug, seeded.id);
  }

  const dynastySlugs = [
    "izabela-de-la-cruz",
    "octavian-wielki",
    "octavia-de-la-cruz",
    "teodozjusz-i",
    "francesco-de-la-cruz",
    "teodozjusz-ii",
    "octavian-syn-teodozjusza-ii",
    "ignacius-de-la-cruz",
    "konstancja-de-la-cruz",
    "michal-de-la-cruz",
    "liliana-de-la-cruz",
  ];
  const dynastyIds = dynastySlugs.map((slug) => entryIds.get(slug)).filter((id): id is string => Boolean(id));
  if (dynastyIds.length !== dynastySlugs.length) throw new Error("Nie udało się rozpoznać wszystkich członków dynastii de la Cruz.");
  const resolvedRelations = relations.map(([sourceSlug, targetSlug, type, description, isTwin = false]) => {
    const sourceId = entryIds.get(sourceSlug);
    const targetId = entryIds.get(targetSlug);
    if (!sourceId || !targetId) throw new Error(`Brak wpisu dla relacji ${sourceSlug} -> ${targetSlug}`);
    return { sourceId, targetId, type, description, isTwin };
  });

  await prisma.$transaction(async (transaction) => {
    // Usuń wyłącznie znane, dawne błędy i wcześniejsze warianty typów. Nie
    // kasuj relacji dodanych później przez administratora — muszą przetrwać restart.
    await transaction.relation.deleteMany({
      where: {
        OR: [
          ...resolvedRelations
            .filter(({ type }) => type === "father" || type === "mother")
            .map(({ sourceId, targetId }) => ({ sourceId, targetId, type: "parent" })),
          ...resolvedRelations
            .filter(({ type }) => type === "twin")
            .map(({ sourceId, targetId }) => ({ sourceId, targetId, type: "sibling" })),
          {
            sourceId: entryIds.get("francesco-de-la-cruz"),
            targetId: { in: [entryIds.get("octavian-wielki")!, entryIds.get("teodozjusz-ii")!] },
            type: { in: ["parent", "child", "father", "mother"] },
          },
          {
            targetId: entryIds.get("francesco-de-la-cruz"),
            sourceId: { in: [entryIds.get("octavian-wielki")!, entryIds.get("teodozjusz-ii")!] },
            type: { in: ["parent", "child", "father", "mother"] },
          },
        ],
      },
    });

    for (const relation of resolvedRelations) {
      await transaction.relation.upsert({
        where: { sourceId_targetId_type: { sourceId: relation.sourceId, targetId: relation.targetId, type: relation.type } },
        create: relation,
        update: { description: relation.description, isTwin: relation.isTwin },
      });
    }
  });

  // Kontrola dotyczy danych odczytanych ponownie z PostgreSQL, nie tylko tablic
  // wejściowych. Błąd zatrzymuje start backendu zamiast uruchamiać aplikację z
  // częściowo poprawioną genealogią.
  const persistedEntries = await prisma.entry.findMany({
    where: { slug: { in: dynastySlugs } },
    select: { id: true, slug: true, birthYear: true, deathYear: true, reignStartYear: true, reignEndYear: true },
  });
  if (persistedEntries.length !== dynastySlugs.length) throw new Error("Weryfikacja PostgreSQL: brakuje członków dynastii.");

  const canonicalBySlug = new Map(allEntries.filter((entry) => dynastySlugs.includes(entry.slug)).map((entry) => [entry.slug, entry]));
  for (const persisted of persistedEntries) {
    const canonical = canonicalBySlug.get(persisted.slug);
    if (!canonical) throw new Error(`Weryfikacja PostgreSQL: brak danych kanonicznych ${persisted.slug}.`);
    for (const field of ["birthYear", "deathYear", "reignStartYear", "reignEndYear"] as const) {
      if (persisted[field] !== (canonical[field] ?? null)) throw new Error(`Weryfikacja PostgreSQL: błędne ${field} dla ${persisted.slug}.`);
    }
  }

  const slugById = new Map(persistedEntries.map((entry) => [entry.id, entry.slug]));
  const persistedRelations = await prisma.relation.findMany({
    where: { sourceId: { in: dynastyIds }, targetId: { in: dynastyIds } },
    select: { sourceId: true, targetId: true, type: true, isTwin: true },
  });
  const relationKey = (source: string, target: string, type: string, isTwin: boolean) => `${source}|${target}|${type}|${isTwin}`;
  const expectedRelationKeys = new Set(
    relations
      .filter(([sourceSlug, targetSlug]) => dynastySlugs.includes(sourceSlug) && dynastySlugs.includes(targetSlug))
      .map(([sourceSlug, targetSlug, type, , isTwin = false]) => relationKey(sourceSlug, targetSlug, type, isTwin)),
  );
  const persistedRelationKeys = new Set(persistedRelations.map((relation) => {
    const sourceSlug = slugById.get(relation.sourceId);
    const targetSlug = slugById.get(relation.targetId);
    if (!sourceSlug || !targetSlug) throw new Error("Weryfikacja PostgreSQL: nierozpoznana relacja dynastii.");
    return relationKey(sourceSlug, targetSlug, relation.type, relation.isTwin);
  }));
  if ([...expectedRelationKeys].some((key) => !persistedRelationKeys.has(key))) {
    throw new Error("Weryfikacja PostgreSQL: relacje dynastii nie odpowiadają seedowi.");
  }

  console.log(`Seed complete and PostgreSQL verified: ${allEntries.length} entries.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
