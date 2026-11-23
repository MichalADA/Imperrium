/** Genealogia dla roku 607. Oparta na najnowszych ustaleniach kanonu.
 * Nie dopisuj tytułów ani urzędów bez potwierdzenia.
 * Starsze rekordy seed/import zawierają sprzeczne daty; niniejszy rejestr
 * prezentuje bieżącą wersję fabuły, nie modyfikując archiwalnych wpisów.
 */
export type DynastyPerson = {
  id: string;
  name: string;
  life: string;
  status: "żyje" | "zmarł";
  role: string;
  note: string;
  parents?: string[];
  partners?: string[];
  portrait?: string;
  articleSlug?: string;
  rank?: number;
  reign?: string;
};

export type DynastyFamily = {
  title: string;
  era: string;
  parents: string[];
  children: string[];
  note?: string;
};

export const dynastyPeople: DynastyPerson[] = [
  { id: "izabela", name: "Izabela de la Cruz", life: "409–449", status: "zmarł", role: "Matka Octaviana Wielkiego i Octavii", note: "Najwcześniejsza wskazana w genealogii matka cesarskiej linii de la Cruz.", children: undefined, articleSlug: "izabela-de-la-cruz" } as DynastyPerson,
  { id: "octavian-wielki", name: "Octavian Wielki de la Cruz", life: "428–514", status: "zmarł", role: "Założyciel dynastii cesarskiej", note: "Obalił Trybuna. Pierwszy władca z rodu de la Cruz; ojciec Teodozjusza I, Florentina i Hiacynty.", parents: ["izabela"], partners: ["octavia"], portrait: "octavian-wielki-de-la-cruz.png", articleSlug: "octavian-wielki", reign: "do 514" },
  { id: "octavia", name: "Octavia de la Cruz", life: "428–560", status: "zmarł", role: "Siostra bliźniaczka i żona Octaviana Wielkiego", note: "Córka Izabeli. W najnowszych ustaleniach występuje także jako żona Octaviana Wielkiego i matka ich trojga dzieci.", parents: ["izabela"], partners: ["octavian-wielki"], portrait: "octavia-de-la-cruz.png", articleSlug: "octavia-de-la-cruz" },
  { id: "teodozjusz-i", name: "Teodozjusz I de la Cruz", life: "446–521", status: "zmarł", role: "Cesarz w latach 514–521", note: "Najstarszy syn Octaviana Wielkiego i Octavii; ojciec Francesco i Teodozjusza II, których matkami były różne kobiety.", parents: ["octavian-wielki", "octavia"], partners: ["geneovea", "lara"], portrait: "teodozjusz-i-de-la-cruz.png", articleSlug: "teodozjusz-i", reign: "514–521" },
  { id: "florentino", name: "Florentino de la Cruz", life: "456–578", status: "zmarł", role: "Syn Octaviana Wielkiego", note: "Młodszy brat Teodozjusza I. Zmarł bezdzietnie.", parents: ["octavian-wielki", "octavia"] },
  { id: "hiacynta", name: "Hiacynta de la Cruz", life: "470–600", status: "zmarł", role: "Córka Octaviana Wielkiego", note: "Od jej potomków wywodzi się boczna linia De Cruz, do której należy Dominique.", parents: ["octavian-wielki", "octavia"] },
  { id: "geneovea", name: "Geneovea", life: "zm. 479", status: "zmarł", role: "Matka Francesco", note: "Pierwsza z dwóch znanych matek synów Teodozjusza I. Rok urodzenia nieustalony.", partners: ["teodozjusz-i"] },
  { id: "lara", name: "Lara de la Cruz", life: "127 lat w roku 607", status: "żyje", role: "Matka Teodozjusza II", note: "Urodzona w roku 480, matka Teodozjusza II. Nadal żyje w roku 607. Wiek 127 lat wynika z podanej daty urodzenia.", partners: ["teodozjusz-i"] },
  { id: "francesco", name: "Francesco de la Cruz", life: "471–556", status: "zmarł", role: "Cesarz w latach 521–556", note: "Syn Teodozjusza I i Geneovei, starszy przyrodni brat Teodozjusza II. Nie miał uznanych prawnie dzieci; w starszych ustaleniach pojawiają się pogłoski o nieślubnym potomstwie.", parents: ["teodozjusz-i", "geneovea"], portrait: "francesco-de-la-cruz.png", articleSlug: "francesco-de-la-cruz", reign: "521–556" },
  { id: "teodozjusz-ii", name: "Teodozjusz II de la Cruz", life: "501–591", status: "zmarł", role: "Cesarz w latach 556–591", note: "Syn Teodozjusza I i Lary, młodszy przyrodni brat Francesco. Ojciec Octaviana, Ignaciusa, Juliana i Teodory.", parents: ["teodozjusz-i", "lara"], partners: ["valeria"], portrait: "teodozjusz-ii-de-la-cruz.png", articleSlug: "teodozjusz-ii", reign: "556–591" },
  { id: "lucjusz", name: "Lucjusz De Cruz", life: "zm. przed 600", status: "zmarł", role: "Najstarszy syn Hiacynty", note: "Ojciec Dominique'a, przedstawiciel bocznej linii rodu De Cruz.", parents: ["hiacynta"] },
  { id: "dominique", name: "Dominique De Cruz", life: "62 lata w 607", status: "żyje", role: "Boczna linia de Cruz", note: "Syn Lucjusza, wnuk Hiacynty. Ósmy w aktualnej kolejności sukcesji.", parents: ["lucjusz"], rank: 8 },
  { id: "valeria", name: "Valeria de la Cruz", life: "77 lat w 607", status: "żyje", role: "Cesarzowa wdowa", note: "Wdowa po Teodozjuszu II. Matka Octaviana, Ignaciusa, Juliana i Teodory.", partners: ["teodozjusz-ii"] },
  { id: "octavian-mlodszy", name: "Octavian de la Cruz", life: "557–588", status: "zmarł", role: "Niedoszły następca tronu", note: "Starszy brat Ignaciusa. Zginął przed objęciem tronu. Mąż Laury von Snith i ojciec Michała. To NIE Octavian Wielki.", parents: ["teodozjusz-ii", "valeria"], partners: ["laura"], articleSlug: "octavian-syn-teodozjusza-ii" },
  { id: "laura", name: "Laura von Snith", life: "wiek nieustalony", status: "żyje", role: "Wdowa po Octavianie", note: "Matka Michała. Po 591 roku mieszkała z dala od Złotego Miasta w Montes.", partners: ["octavian-mlodszy"] },
  { id: "ignacius", name: "Ignacius de la Cruz", life: "48 lat w 607", status: "żyje", role: "Panujący cesarz od 591", note: "Syn Teodozjusza II i Valerii. Ojciec Konstancji i Liliany. Barbara Han opuściła pałac w roku 595.", parents: ["teodozjusz-ii", "valeria"], partners: ["barbara-han"], portrait: "ignacius-de-la-cruz.png", articleSlug: "ignacius-de-la-cruz", reign: "591–obecnie" },
  { id: "barbara-han", name: "Barbara Han", life: "wiek nieustalony", status: "żyje", role: "Matka Konstancji i Liliany", note: "Od 595 roku poza Złotym Miastem. W Hekanii stworzyła nową rodzinę; ma tam młodszą córkę i syna.", partners: ["ignacius"] },
  { id: "julian", name: "Julian de la Cruz", life: "40 lat w 607", status: "żyje", role: "Brat cesarza", note: "Syn Teodozjusza II i Valerii, mąż Julii Han. Funkcji państwowej nie przypisujemy bez potwierdzenia.", parents: ["teodozjusz-ii", "valeria"], partners: ["julia-han"], rank: 4 },
  { id: "julia-han", name: "Julia Han", life: "wiek nieustalony", status: "żyje", role: "Małżonka Juliana", note: "Połączona z rodem de la Cruz przez małżeństwo z Julianem.", partners: ["julian"] },
  { id: "teodora", name: "Teodora de la Cruz", life: "33 lata w 607", status: "żyje", role: "Najwyższa Księżniczka", note: "Córka Teodozjusza II i Valerii, żona Viqtora Delana. Razem wychowują Nataniela i Barbarę.", parents: ["teodozjusz-ii", "valeria"], partners: ["viqtor"], rank: 5 },
  { id: "viqtor", name: "Viqtor Delan", life: "wiek nieustalony", status: "żyje", role: "Mąż Teodory", note: "Ojciec Nataniela i Barbary, książę rodu Delan.", partners: ["teodora"] },
  { id: "michal", name: "Michał de la Cruz", life: "21 lat w 607", status: "żyje", role: "Syn Octaviana i Laury", note: "Bratanek Ignaciusa, kuzyn Konstancji i Liliany. Trzeci w kolejności sukcesji.", parents: ["octavian-mlodszy", "laura"], portrait: "michal-de-la-cruz.png", articleSlug: "michal-de-la-cruz", rank: 3 },
  { id: "konstancja", name: "Konstancja de la Cruz", life: "19 lat w 607", status: "żyje", role: "Najwyższa Księżniczka, następczyni tronu", note: "Starsza córka Ignaciusa i Barbary Han; pierwsza w kolejności sukcesji.", parents: ["ignacius", "barbara-han"], portrait: "konstancja-de-la-cruz.png", articleSlug: "konstancja-de-la-cruz", rank: 1 },
  { id: "liliana", name: "Liliana de la Cruz", life: "17 lat w 607", status: "żyje", role: "Najwyższa Księżniczka", note: "Młodsza córka Ignaciusa i Barbary Han; druga w kolejności sukcesji.", parents: ["ignacius", "barbara-han"], portrait: "liliana-de-la-cruz.png", articleSlug: "liliana-de-la-cruz", rank: 2 },
  { id: "nataniel", name: "Nataniel de la Cruz", life: "wiek nieustalony", status: "żyje", role: "Syn Teodory i Viqtora", note: "Szósty w kolejności sukcesji.", parents: ["teodora", "viqtor"], rank: 6 },
  { id: "barbara-mlodsza", name: "Barbara de la Cruz", life: "3 lata w 607", status: "żyje", role: "Córka Teodory i Viqtora", note: "Siódma w kolejności sukcesji. Nie należy mylić jej z Barbarą Han.", parents: ["teodora", "viqtor"], rank: 7 },
];

export const familyUnits: DynastyFamily[] = [
  { title: "Początek znanej linii", era: "Korzenie dynastii", parents: ["izabela"], children: ["octavian-wielki", "octavia"], note: "Octavian Wielki i Octavia byli bliźniętami." },
  { title: "Dzieci Octaviana Wielkiego i Octavii", era: "Dynastia założycielska", parents: ["octavian-wielki", "octavia"], children: ["teodozjusz-i", "florentino", "hiacynta"], note: "Troje dzieci według najnowszego ustalenia. Florentino nie pozostawił potomstwa." },
  { title: "Pierwsza linia Teodozjusza I", era: "Pokolenie cesarskie", parents: ["teodozjusz-i", "geneovea"], children: ["francesco"], note: "Francesco i Teodozjusz II byli przyrodnimi braćmi." },
  { title: "Druga linia Teodozjusza I", era: "Pokolenie cesarskie", parents: ["teodozjusz-i", "lara"], children: ["teodozjusz-ii"], note: "Lara jest matką Teodozjusza II, nie Francesco." },
  { title: "Boczna linia De Cruz", era: "Potomkowie Hiacynty", parents: ["hiacynta"], children: ["lucjusz"], note: "Lucjusz był najstarszym synem Hiacynty." },
  { title: "Linia Dominique’a", era: "Potomkowie Hiacynty", parents: ["lucjusz"], children: ["dominique"], note: "Dominique jest wnukiem Hiacynty i należy do żyjących sukcesorów." },
  { title: "Dzieci Teodozjusza II i Valerii", era: "Ostatnie pokolenia", parents: ["teodozjusz-ii", "valeria"], children: ["octavian-mlodszy", "ignacius", "julian", "teodora"], note: "Octavian zmarł przed ojcem i nie objął tronu." },
  { title: "Linia starszego syna", era: "Ostatnie pokolenia", parents: ["octavian-mlodszy", "laura"], children: ["michal"] },
  { title: "Córki Ignaciusa", era: "Ostatnie pokolenia", parents: ["ignacius", "barbara-han"], children: ["konstancja", "liliana"] },
  { title: "Dzieci Teodory", era: "Ostatnie pokolenia", parents: ["teodora", "viqtor"], children: ["nataniel", "barbara-mlodsza"] },
];

export const imperialRulers = ["octavian-wielki", "teodozjusz-i", "francesco", "teodozjusz-ii", "ignacius"];
export const successionIds = ["konstancja", "liliana", "michal", "julian", "teodora", "nataniel", "barbara-mlodsza", "dominique"];
export const personById = Object.fromEntries(dynastyPeople.map((person) => [person.id, person])) as Record<string, DynastyPerson>;
export const dynastyPortrait = (file?: string): string | undefined =>
  file ? `https://raw.githubusercontent.com/MichalADA/Imperrium/main/lore/images/characters/${encodeURIComponent(file)}` : undefined;
