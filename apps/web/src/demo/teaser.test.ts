import { describe, expect, it } from "vitest";
import { toSse } from "../test/sse.js";
import { envelopes, trial } from "../test/trials.js";
import raw from "./recording.sse?raw";
import { readRecording } from "./recording.js";
import { mostQuoted, segments, summarize } from "./teaser.js";

const none = { ats: [], hr: [], techLead: [], hiringManager: [], prosecutor: [] };

describe("summarize", () => {
  it("nagranie bez potrzebnych zdarzen konczy sie bledem z nazwa brakujacego, a nie zerami na stronie", () => {
    const { events } = readRecording(raw);
    expect(() => summarize({ events: [] })).toThrow("Puste nagranie");
    expect(() => summarize({ events: events.slice(1) })).toThrow("Nagranie nie zaczyna się od wniesienia sprawy");
    const noProsecution = events.filter((event) => event.envelope.event.type !== "ProsecutionDelivered");
    expect(() => summarize({ events: noProsecution })).toThrow("Brak zdarzenia ProsecutionDelivered w nagraniu");
  });

  it("liczy rundy, wypowiedzi i zmiany zdania z dowolnej rozprawy", () => {
    const teaser = summarize(readRecording(toSse(envelopes(trial([7, 6, 5, 7, 3], [[null, null, 6, null, null]]), 1_000_000))));
    expect(teaser.statements).toBe(5);
    expect(teaser.mindChanges).toBe(1);
    expect(Object.keys(teaser.opening).sort()).toEqual(["ats", "hiringManager", "hr", "prosecutor", "techLead"]);
  });
});

describe("segments", () => {
  it("linia bez cytatow to jeden fragment bez krytykow", () => {
    expect(segments("Prowadziłam księgi.", none)).toEqual([{ text: "Prowadziłam księgi.", critics: [] }]);
  });

  it("zachodzace cytaty dziela linie, a krytycy ida w kolejnosci lawy", () => {
    const line = "Java 17, H2. Aplikacja REST. Bez testów.";
    const quotes = { ...none, techLead: ["Java 17, H2. Aplikacja REST."], ats: ["Java 17, H2.", "Bez testów."], hr: ["Bez testów."] };
    expect(segments(line, quotes)).toEqual([
      { text: "Java 17, H2.", critics: ["ats", "techLead"] },
      { text: " Aplikacja REST.", critics: ["techLead"] },
      { text: " ", critics: [] },
      { text: "Bez testów.", critics: ["ats", "hr"] },
    ]);
  });

  it("cytat wystepujacy dwa razy zaznacza oba miejsca", () => {
    expect(segments("B1 i B1", { ...none, hr: ["B1"] }).map((s) => s.critics.length)).toEqual([1, 0, 1]);
  });

});

describe("mostQuoted", () => {
  it("wybiera fragment zacytowany przez najwiecej krytykow; przy remisie pierwszy", () => {
    const quotes = { ...none, ats: ["B1", "Java"], hr: ["Java"], techLead: ["SQL"] };
    expect(mostQuoted(["SQL i B1", "Java"], quotes)).toEqual({ text: "Java", critics: ["ats", "hr"] });
    expect(mostQuoted(["SQL i B1"], quotes)).toEqual({ text: "SQL", critics: ["techLead"] });
  });

  it("bez cytatow nie ma czego pokazac", () => {
    expect(mostQuoted(["Prowadziłam księgi."], none)).toBeUndefined();
    expect(mostQuoted([], none)).toBeUndefined();
  });
});
