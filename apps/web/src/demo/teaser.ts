import type { CriticId } from "@trybunal/domain";
import type { Recording } from "./recording.js";

/**
 * Fakty z nagranej rozprawy na strone startowa: liczby, oceny otwarcia, cytaty z CV i czasy protokolu.
 * Strona nie laduje nagrania (to ~33 KB tylko dla sali), wiec bierze stala DEMO_TEASER; test liczy
 * to samo z nagrania funkcja summarize i pilnuje, ze sie zgadza.
 */
export interface Teaser {
  /** Pierwsze 8 znakow identyfikatora rozprawy, jak sygnatura akt. */
  readonly docket: string;
  /** Od wniesienia sprawy do werdyktu, w sekundach. */
  readonly seconds: number;
  readonly calls: number;
  readonly costNanoUsd: number;
  readonly rounds: number;
  readonly statements: number;
  /** Ilu krytykow zmienilo ocene w debacie. */
  readonly mindChanges: number;
  readonly opening: Readonly<Record<CriticId, number>>;
  /** Zdania z CV, ktore krytyk zacytowal w swoich zastrzezeniach (sprawdzone przez serwer slowo w slowo). */
  readonly quotes: Readonly<Record<CriticId, readonly string[]>>;
  /**
   * Sekundy od wniesienia, w ktorych konczyly sie czesci posiedzenia: ostatnia ocena, oskarzenie,
   * ostatnia wypowiedz w debacie, werdykt. Kazda czesc zaczyna sie tam, gdzie skonczyla poprzednia.
   */
  readonly protocol: { readonly assessed: number; readonly prosecuted: number; readonly debated: number; readonly verdict: number };
}

export function summarize(recording: Recording): Teaser {
  const envelopes = recording.events.map((event) => event.envelope);
  const first = envelopes[0];
  if (first === undefined) throw new Error("Puste nagranie");
  const filed = first.event;
  if (filed.type !== "TrialFiled") throw new Error("Nagranie nie zaczyna się od wniesienia sprawy");
  const start = Date.parse(first.occurredAt);
  const seconds = (found: (typeof envelopes)[number] | undefined, type: string): number => {
    if (found === undefined) throw new Error(`Brak zdarzenia ${type} w nagraniu`);
    return Math.round((Date.parse(found.occurredAt) - start) / 1000);
  };
  const firstAt = (type: string): number =>
    seconds(
      envelopes.find((envelope) => envelope.event.type === type),
      type,
    );
  const lastAt = (type: string): number =>
    seconds(
      envelopes.findLast((envelope) => envelope.event.type === type),
      type,
    );
  const opening: Partial<Record<CriticId, number>> = {};
  const quotes: Partial<Record<CriticId, readonly string[]>> = {};
  let statements = 0;
  let mindChanges = 0;
  for (const { event } of envelopes) {
    if (event.type === "AssessmentSubmitted") {
      opening[event.assessment.criticId] = event.assessment.score;
      quotes[event.assessment.criticId] = event.assessment.concerns.map((concern) => concern.quote);
    }
    if (event.type === "StatementMade") {
      statements += 1;
      if (event.revisedScore !== null) mindChanges += 1;
    }
  }
  return {
    docket: filed.trialId.slice(0, 8),
    seconds: firstAt("VerdictAnnounced"),
    calls: envelopes.reduce((sum, envelope) => sum + envelope.calls.length, 0),
    costNanoUsd: envelopes.reduce((sum, envelope) => sum + envelope.calls.reduce((s, call) => s + call.costNanoUsd, 0), 0),
    rounds: filed.debateRounds,
    statements,
    mindChanges,
    opening: opening as Record<CriticId, number>,
    quotes: quotes as Record<CriticId, readonly string[]>,
    protocol: {
      assessed: lastAt("AssessmentSubmitted"),
      prosecuted: firstAt("ProsecutionDelivered"),
      debated: lastAt("StatementMade"),
      verdict: firstAt("VerdictAnnounced"),
    },
  };
}

/** Nagrana rozprawa z demo; zgodnosc z recording.sse sprawdza teaser.test.ts. */
export const DEMO_TEASER: Teaser = {
  docket: "ef0a36bd",
  seconds: 90,
  calls: 20,
  costNanoUsd: 324_292_385,
  rounds: 2,
  statements: 10,
  mindChanges: 3,
  opening: { hr: 7, techLead: 5, hiringManager: 6, prosecutor: 5, ats: 5 },
  quotes: {
    hr: [
      "Angielski — B1.",
      "Projekt zaliczeniowy z bootcampu, bez testów automatycznych.",
      "Java 17, Spring Boot, H2.",
      "Java, Spring Boot (podstawy), SQL, Git, Excel, VBA, wiedza o rozliczeniach i płatnościach.",
      "W 2026 roku ukończyłam bootcamp Java i szukam pierwszej pracy jako programistka.",
    ],
    techLead: [
      "Projekt zaliczeniowy z bootcampu, bez testów automatycznych.",
      "Java 17, Spring Boot, H2. Aplikacja do zapisywania wydatków z prostym REST API.",
      "Java, Spring Boot (podstawy), SQL, Git, Excel, VBA, wiedza o rozliczeniach i płatnościach.",
      "Napisałam makra VBA w Excelu, które automatyzowały import wyciągów bankowych.",
    ],
    hiringManager: [
      "Napisałam makra VBA w Excelu, które automatyzowały import wyciągów bankowych.",
      "Uzgadniałam wpływy od operatorów płatności z fakturami sprzedaży.",
      "Projekt zaliczeniowy z bootcampu, bez testów automatycznych.",
      "Java, Spring Boot (podstawy), SQL, Git, Excel, VBA, wiedza o rozliczeniach i płatnościach.",
      "Angielski — B1.",
    ],
    prosecutor: [
      "Projekt zaliczeniowy z bootcampu, bez testów automatycznych.",
      "Java, Spring Boot, SQL, Git, podstawy testów.",
      "Java 17, Spring Boot, H2.",
      "Java, Spring Boot (podstawy), SQL, Git, Excel, VBA, wiedza o rozliczeniach i płatnościach.",
      "Angielski — B1.",
    ],
    ats: [
      "Projekt zaliczeniowy z bootcampu, bez testów automatycznych.",
      "Java, Spring Boot (podstawy), SQL, Git, Excel, VBA, wiedza o rozliczeniach i płatnościach.",
      "Java 17, Spring Boot, H2.",
      "Szkoła Kodu Akademia",
      "Angielski — B1.",
    ],
  },
  protocol: { assessed: 46, prosecuted: 48, debated: 74, verdict: 90 },
};

/** Fragment linii CV i krytycy, ktorzy go zacytowali (pusta lista = nikt). */
export interface Segment {
  readonly text: string;
  readonly critics: readonly CriticId[];
}

/**
 * Dzieli linie CV na fragmenty wedlug cytatow: kazdy znak dostaje zbior krytykow, ktorych cytat go
 * obejmuje, a sasiednie znaki z tym samym zbiorem lacza sie w jeden fragment. Cytat moze wystapic
 * w linii kilka razy i zachodzic na inny (Tech Lead cytuje dluzszy kawalek niz reszta).
 */
export function segments(line: string, quotes: Readonly<Record<CriticId, readonly string[]>>): readonly Segment[] {
  const owners: Set<CriticId>[] = Array.from({ length: line.length }, () => new Set<CriticId>());
  for (const [critic, list] of Object.entries(quotes) as [CriticId, readonly string[]][]) {
    for (const quote of list) {
      for (let from = line.indexOf(quote); from >= 0; from = line.indexOf(quote, from + 1)) {
        for (let i = from; i < from + quote.length; i++) owners[i]?.add(critic);
      }
    }
  }
  const out: Segment[] = [];
  owners.forEach((set, i) => {
    const critics = ORDER.filter((critic) => set.has(critic));
    const last = out.at(-1);
    if (last !== undefined && last.critics.join() === critics.join()) out[out.length - 1] = { text: last.text + line.charAt(i), critics };
    else out.push({ text: line.charAt(i), critics });
  });
  return out;
}

/** Kolejnosc jak na lawie w sali: od lewej. */
const ORDER: readonly CriticId[] = ["ats", "hr", "techLead", "hiringManager", "prosecutor"];

/** Najczesciej cytowany fragment wsrod linii dokumentu; przy remisie pierwszy. Brak cytatow = undefined. */
export function mostQuoted(lines: readonly string[], quotes: Readonly<Record<CriticId, readonly string[]>>): Segment | undefined {
  let best: Segment | undefined;
  for (const segment of lines.flatMap((line) => segments(line, quotes))) {
    if (segment.critics.length > (best?.critics.length ?? 0)) best = segment;
  }
  return best;
}
