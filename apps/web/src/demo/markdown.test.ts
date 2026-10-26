import { describe, expect, it } from "vitest";
import { parseDoc } from "./markdown.js";

describe("parseDoc", () => {
  it("tytul z pierwszej linii, potem naglowki, punkty i akapity bez pogrubien", () => {
    expect(parseDoc("# Monika — Junior\n\n## Podsumowanie\n**Bootcamp** — Szkoła\n- Java, **SQL**\nZwykły tekst")).toEqual({
      title: "Monika — Junior",
      blocks: [
        { kind: "heading", text: "Podsumowanie" },
        { kind: "text", text: "Bootcamp — Szkoła" },
        { kind: "item", text: "Java, SQL" },
        { kind: "text", text: "Zwykły tekst" },
      ],
    });
  });

  it("pomija puste linie (takze ze spacjami) i dopisek o fikcyjnosci, ale nie zdanie, ktore tylko wspomina o fikcji", () => {
    const doc = parseDoc("# T\n   \n(Osoba fikcyjna — przykład.)\nTo nie jest (fikcyjne) zdanie.");
    expect(doc.blocks).toEqual([{ kind: "text", text: "To nie jest (fikcyjne) zdanie." }]);
  });

  it("tytul bez spacji po # i z wieloma spacjami; # w srodku tytulu zostaje", () => {
    expect(parseDoc("#Tytuł").title).toBe("Tytuł");
    expect(parseDoc("#   Tytuł").title).toBe("Tytuł");
    expect(parseDoc("Kurs C# od zera").title).toBe("Kurs C# od zera");
  });

  it("pusty wiersz przed tytulem nie zabiera tytulu; myslnik bez spacji to nie punkt", () => {
    const doc = parseDoc("\n\n# Tytuł\n-2026 rok\n##Bez spacji");
    expect(doc.title).toBe("Tytuł");
    expect(doc.blocks).toEqual([
      { kind: "text", text: "-2026 rok" },
      { kind: "text", text: "##Bez spacji" },
    ]);
  });

  it("pusty dokument", () => {
    expect(parseDoc("")).toEqual({ title: "", blocks: [] });
  });
});
