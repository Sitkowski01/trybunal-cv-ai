import { CRITIC_IDS } from "@trybunal/domain";
import type { CSSProperties } from "react";
import "./protocol.css";
import { SectionHead } from "./SectionHead.js";
import { DEMO_TEASER } from "./teaser.js";

/** 75 -> "01:15", jak licznik nagrania. */
export const clock = (seconds: number): string => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

/**
 * Protokol posiedzenia: piec czesci na wspolnej osi od wniesienia do werdyktu, z czasami z nagrania.
 * Pasek pokazuje, ile trwala kazda czesc; werdykt to punkt na koncu, bez tresci — od tego jest sala.
 */
export function Protocol() {
  const t = DEMO_TEASER;
  const p = t.protocol;
  const rows = [
    { from: 0, to: p.assessed, title: "Oceny", text: `${String(CRITIC_IDS.length)} krytyków czyta akta równolegle; każdy zarzut cytuje CV.` },
    { from: p.assessed, to: p.prosecuted, title: "Oskarżenie", text: "Prokurator wygłasza najmocniejszy argument przeciw kandydatce." },
    {
      from: p.prosecuted,
      to: p.debated,
      title: "Debata",
      text: `${String(t.rounds)} rundy, ${String(t.statements)} wypowiedzi, krytycy odpowiadają sobie po imieniu.`,
    },
    { from: p.debated, to: p.verdict, title: "Narada", text: "Reguła liczy średnią, sędzia pisze uzasadnienie i poprawki CV." },
    { from: p.verdict, to: p.verdict, title: "Werdykt", text: "Zapieczętowany do końca nagrania." },
  ];
  const span = (sec: number): string => `${String((sec / p.verdict) * 100)}%`;
  return (
    <section className="protocol" aria-labelledby="protocol-title">
      <SectionHead
        id="protocol-title"
        kicker="Protokół posiedzenia"
        title={`${String(t.seconds)} sekund od akt do werdyktu`}
        note="Czasy z nagrania. Odtwarzanie trwa dłużej, żeby dało się czytać wypowiedzi."
      />
      <ol className="protocol__list">
        {rows.map((row) => (
          <li key={row.title}>
            <h3>{row.title}</h3>
            <p>{row.text}</p>
            <time dateTime={`PT${String(row.from)}S`}>{row.from === row.to ? clock(row.to) : `${clock(row.from)}–${clock(row.to)}`}</time>
            <span className="protocol__track" aria-hidden="true">
              <span className="protocol__bar" style={{ "--from": span(row.from), "--to": span(row.to) } as CSSProperties} />
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
