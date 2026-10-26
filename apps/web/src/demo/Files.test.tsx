import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DocBlock, Files } from "./Files.js";

describe("Files", () => {
  it("CV z zaznaczonymi cytatami — sila zaznaczenia to liczba krytykow, ktorzy je zacytowali", () => {
    render(<Files />);
    const cv = within(screen.getByRole("region", { name: "CV kandydatki" }));
    expect(cv.getByRole("heading", { name: /^Monika Sadowska — Junior Java Developer/u })).toBeInTheDocument();
    expect(cv.getByRole("heading", { name: "Podsumowanie" })).toBeInTheDocument();
    expect(cv.queryByText(/Osoba fikcyjna/u)).toBeNull();
    expect(cv.queryByText("**", { exact: false })).toBeNull();

    const top = cv.getByText("Projekt zaliczeniowy z bootcampu, bez testów automatycznych.");
    expect(top.tagName).toBe("MARK");
    expect(top).toHaveClass("heat--5");
    expect(top).toHaveAttribute("title", "Cytowali: Bot ATS, HR screener, Tech Lead, Hiring Manager, Prokurator");
    expect(cv.getByText("Szkoła Kodu Akademia")).toHaveClass("heat--1");
    // Zdania, ktorych nikt nie zacytowal, zostaja zwyklym tekstem, a punkty listy maja swoja klase.
    const plain = cv.getByText("Prowadziłam księgi 25 klientów, w tym trzech sklepów internetowych.");
    expect(plain.tagName).toBe("P");
    expect(plain).toHaveClass("doc__item");
    expect(cv.getByText("Przez 8 lat pracowałam jako księgowa, w tym przy rozliczeniach płatności kartowych.")).not.toHaveClass("doc__item");
  });

  it("legenda: skala 1-5 i najczesciej cytowane zdanie z liczba krytykow", () => {
    render(<Files />);
    expect(
      within(screen.getByRole("list", { name: "Skala zaznaczeń" }))
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).toEqual(["1", "2", "3", "4", "5"]);
    screen
      .getAllByRole("listitem")
      .slice(0, 5)
      .forEach((li, i) => {
        expect(li).toHaveClass("heat", `heat--${String(i + 1)}`);
      });
    expect(screen.getByText("Projekt zaliczeniowy z bootcampu, bez testów automatycznych.", { selector: "q" })).toBeInTheDocument();
    expect(screen.getByText("5 z 5 krytyków")).toBeInTheDocument();
  });

  it("ogloszenie zwiniete do rozwiniecia, bez dopisku o fikcyjnosci", async () => {
    render(<Files />);
    const offer = within(screen.getByRole("region", { name: "Ogłoszenie o pracę" }));
    expect(offer.getByRole("heading", { name: "Junior Java Developer — FinPay Systems" })).toBeInTheDocument();
    expect(offer.queryByRole("heading", { name: "Wymagania" })).toBeNull();
    await userEvent.click(offer.getByRole("button", { name: "Pokaż ogłoszenie" }));
    expect(offer.getByRole("button", { name: "Zwiń ogłoszenie" })).toHaveAttribute("aria-expanded", "true");
    expect(offer.getByRole("heading", { name: "Wymagania" })).toBeInTheDocument();
    expect(offer.getByText(/Znajomość Javy/u)).toHaveClass("doc__item");
    expect(offer.queryByText(/fikcyjn/iu)).toBeNull();
    await userEvent.click(offer.getByRole("button", { name: "Zwiń ogłoszenie" }));
    expect(offer.queryByRole("heading", { name: "Wymagania" })).toBeNull();
  });

  it("blok bez zaznaczania: ogloszenie nie dostaje zaznaczen z cytatow CV, nawet z tym samym zdaniem", () => {
    const block = { kind: "item", text: "Angielski — B1." } as const;
    const { container, rerender } = render(<DocBlock block={block} />);
    expect(container.querySelector("mark")).toBeNull();
    expect(screen.getByText("Angielski — B1.")).toHaveClass("doc__item");
    rerender(<DocBlock block={block} marked />);
    expect(screen.getByText("Angielski — B1.").tagName).toBe("MARK");
    rerender(<DocBlock block={{ kind: "heading", text: "Języki" }} />);
    expect(screen.getByRole("heading", { level: 4, name: "Języki" })).toBeInTheDocument();
  });
});
