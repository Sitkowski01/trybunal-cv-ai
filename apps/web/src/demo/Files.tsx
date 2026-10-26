import { CRITIC_IDS } from "@trybunal/domain";
import { useId, useState } from "react";
import { CRITIC_LABELS } from "../labels.js";
import { DEMO_CASE } from "./case.js";
import "./files.css";
import { type Block, parseDoc } from "./markdown.js";
import { SectionHead } from "./SectionHead.js";
import { DEMO_TEASER, mostQuoted, segments } from "./teaser.js";

const CV = parseDoc(DEMO_CASE.cv);
const OFFER = parseDoc(DEMO_CASE.offer);

/** Akta: CV z cytatami krytykow — im wiecej krytykow zacytowalo zdanie, tym mocniejsze zaznaczenie. */
export function Files() {
  // Najczesciej cytowany fragment calego CV — u tej kandydatki zdanie o braku testow.
  const top = mostQuoted(
    CV.blocks.map((block) => block.text),
    DEMO_TEASER.quotes,
  );
  return (
    <section className="files" id="akta" aria-labelledby="files-title">
      <SectionHead
        id="files-title"
        kicker="Akta sprawy"
        title="Gdzie patrzyli krytycy"
        note="Każdy zarzut musi cytować CV słowo w słowo — serwer odrzuca cytat, którego nie ma w dokumencie. Zaznaczenia to te cytaty."
      />
      <div className="files__grid">
        <section className="doc" aria-label="CV kandydatki">
          <p className="doc__path">examples/cv-monika-sadowska.md</p>
          <h3 className="doc__title">{CV.title}</h3>
          <div className="doc__body">
            {CV.blocks.map((block, i) => (
              <DocBlock key={i} block={block} marked />
            ))}
          </div>
        </section>
        <div className="files__side">
          <div className="legend">
            <p className="legend__title">Zacytowało krytyków</p>
            <ol className="legend__scale" aria-label="Skala zaznaczeń">
              {CRITIC_IDS.map((_, i) => (
                <li key={i} className={`heat heat--${String(i + 1)}`}>
                  {i + 1}
                </li>
              ))}
            </ol>
            {top !== undefined && (
              <p className="legend__top">
                Najczęściej: <q>{top.text}</q>
                <span>
                  {top.critics.length} z {CRITIC_IDS.length} krytyków
                </span>
              </p>
            )}
          </div>
          <Offer />
        </div>
      </div>
    </section>
  );
}

/** Blok dokumentu; w CV (marked) cytowane fragmenty jako <mark> z sila wedlug liczby krytykow. */
export function DocBlock({ block, marked = false }: { readonly block: Block; readonly marked?: boolean }) {
  if (block.kind === "heading") return <h4>{block.text}</h4>;
  const parts = marked ? segments(block.text, DEMO_TEASER.quotes) : [{ text: block.text, critics: [] }];
  return (
    <p className={block.kind === "item" ? "doc__item" : undefined}>
      {parts.map((part, i) =>
        part.critics.length === 0 ? (
          part.text
        ) : (
          <mark
            key={i}
            className={`heat heat--${String(part.critics.length)}`}
            title={`Cytowali: ${part.critics.map((c) => CRITIC_LABELS[c].name).join(", ")}`}
          >
            {part.text}
          </mark>
        ),
      )}
    </p>
  );
}

/** Ogloszenie zwiniete: na stronie liczy sie CV, oferta jest dla dociekliwych. */
function Offer() {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <section className="offer" aria-label="Ogłoszenie o pracę">
      <p className="doc__path">examples/oferta-junior-java-fintech.md</p>
      <h3 className="offer__title">{OFFER.title}</h3>
      <div id={id} className="offer__body" hidden={!open}>
        {OFFER.blocks.map((block, i) => (
          <DocBlock key={i} block={block} />
        ))}
      </div>
      <button
        type="button"
        className="intro__secondary offer__toggle"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          setOpen(!open);
        }}
      >
        {open ? "Zwiń ogłoszenie" : "Pokaż ogłoszenie"}
      </button>
    </section>
  );
}
