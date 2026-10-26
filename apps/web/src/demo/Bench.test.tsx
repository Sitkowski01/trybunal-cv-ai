import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Bench } from "./Bench.js";
import raw from "./recording.sse?raw";

describe("Bench", () => {
  it("szesc miejsc z ocenami otwarcia; wybrany mowi pod spodem, sedzia nie ujawnia werdyktu", async () => {
    render(<Bench />);
    const bench = within(screen.getByRole("region", { name: "Każdy czyta CV inaczej" }));
    expect(bench.getByText(/W debacie 3 z nich się zmienią/u)).toBeInTheDocument();
    expect(bench.getAllByRole("button").map((seat) => seat.textContent)).toEqual([
      "Bot ATS5/10",
      "HR screener7/10",
      "Tech Lead5/10",
      "Hiring Manager6/10",
      "Sędziawerdykt zapieczętowany",
      "Prokurator5/10nie głosuje",
    ]);
    expect(bench.getByRole("button", { name: /HR screener/u })).toHaveAttribute("aria-pressed", "true");
    expect(bench.getByRole("blockquote")).toHaveTextContent(/^„Czytelne CV z jasną narracją przebranżowienia/u);

    await userEvent.click(bench.getByRole("button", { name: /Prokurator/u }));
    expect(bench.getByRole("button", { name: /Prokurator/u })).toHaveAttribute("aria-pressed", "true");
    expect(bench.getByRole("button", { name: /HR screener/u })).toHaveAttribute("aria-pressed", "false");
    expect(bench.getByRole("blockquote")).toHaveTextContent("„Wysoki Trybunale, kandydatka nie dowodzi kluczowego wymogu oferty.”");
    expect(bench.getByText("Prokurator", { selector: "strong" })).toBeInTheDocument();
    // Klasy niosa kolor miejsca: czerwien prokuratora na lawie i w panelu wypowiedzi.
    expect(bench.getByRole("button", { name: /Prokurator/u })).toHaveClass("seat", "seat--prosecutor");
    expect(bench.getByRole("figure")).toHaveClass("stance", "stance--prosecutor");

    // Sedzia mowi od siebie (bez cudzyslowu) i podaje regule, nie wynik.
    await userEvent.click(bench.getByRole("button", { name: /Sędzia/u }));
    expect(bench.getByRole("blockquote")).toHaveTextContent(/^Nie głosuję\. .*co najmniej 6, a Bot ATS da minimum 4\./u);
    expect(bench.getByRole("figure")).toHaveTextContent("Sędzia — Ogłasza werdykt według stałej reguły i pisze uzasadnienie z poprawkami CV");
  });

  it("klawiatura: Enter na miejscu wybiera je (bez najechania myszka)", async () => {
    render(<Bench />);
    screen.getByRole("button", { name: /Tech Lead/u }).focus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: /Tech Lead/u })).toHaveAttribute("aria-pressed", "true");
  });

  it("najechanie myszka wybiera, dotyk nie (na telefonie wybiera stukniecie)", () => {
    render(<Bench />);
    const tech = screen.getByRole("button", { name: /Tech Lead/u });
    fireEvent.pointerEnter(tech, { pointerType: "touch" });
    expect(tech).toHaveAttribute("aria-pressed", "false");
    fireEvent.pointerEnter(tech, { pointerType: "mouse" });
    expect(tech).toHaveAttribute("aria-pressed", "true");
  });

  it("stanowiska krytykow to cale zdania z nagrania, nie opisy pisane pod strone", async () => {
    render(<Bench />);
    const starts = {
      "Bot ATS": "CV zawiera",
      "HR screener": "Czytelne CV",
      "Tech Lead": "Realny poziom",
      "Hiring Manager": "Ma potencjał",
      Prokurator: "Wysoki",
    };
    for (const [name, start] of Object.entries(starts)) {
      await userEvent.click(screen.getByRole("button", { name: new RegExp(name, "u") }));
      const quote = screen.getByRole("blockquote").textContent.replace(/^„|”$/gu, "");
      expect(quote.startsWith(start) && quote.endsWith(".")).toBe(true);
      expect(raw).toContain(quote);
    }
  });
});
