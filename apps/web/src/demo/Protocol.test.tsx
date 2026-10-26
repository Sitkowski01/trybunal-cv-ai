import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { clock, Protocol } from "./Protocol.js";

describe("Protocol", () => {
  it("piec czesci po kolei z czasami z nagrania i paskami na wspolnej osi", () => {
    const { container } = render(<Protocol />);
    const protocol = within(screen.getByRole("region", { name: "90 sekund od akt do werdyktu" }));
    expect(protocol.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(["Oceny", "Oskarżenie", "Debata", "Narada", "Werdykt"]);
    expect(protocol.getAllByRole("time").map((time) => time.textContent)).toEqual([
      "00:00–00:46",
      "00:46–00:48",
      "00:48–01:14",
      "01:14–01:30",
      "01:30",
    ]);
    expect(protocol.getAllByRole("time").map((time) => time.getAttribute("datetime"))).toEqual(["PT0S", "PT46S", "PT48S", "PT74S", "PT90S"]);
    expect(
      within(protocol.getByRole("list"))
        .getAllByRole("paragraph")
        .map((p) => p.textContent),
    ).toEqual([
      "5 krytyków czyta akta równolegle; każdy zarzut cytuje CV.",
      "Prokurator wygłasza najmocniejszy argument przeciw kandydatce.",
      "2 rundy, 10 wypowiedzi, krytycy odpowiadają sobie po imieniu.",
      "Reguła liczy średnią, sędzia pisze uzasadnienie i poprawki CV.",
      "Zapieczętowany do końca nagrania.",
    ]);
    // Pasek debaty: od 48. do 74. sekundy z 90.
    const debate = container.querySelectorAll<HTMLElement>(".protocol__bar")[2];
    expect(debate?.style.getPropertyValue("--from")).toBe(`${String((48 / 90) * 100)}%`);
    expect(debate?.style.getPropertyValue("--to")).toBe(`${String((74 / 90) * 100)}%`);
  });

  it("zegar: minuty i sekundy z zerami", () => {
    expect(clock(0)).toBe("00:00");
    expect(clock(74)).toBe("01:14");
    expect(clock(605)).toBe("10:05");
  });
});
