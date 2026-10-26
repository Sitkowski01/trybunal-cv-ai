import { CRITIC_IDS } from "@trybunal/domain";
import type { CSSProperties } from "react";
import { DEMO_CASE } from "./case.js";
import "./hero.css";
import sala from "./img/sala.webp";
import { Scales } from "./Scales.js";
import { DEMO_TEASER } from "./teaser.js";

export const REPO_URL = "https://github.com/Sitkowski01/trybunal-cv-ai";

/** Punkty na renderze sali (procent szerokosci i wysokosci obrazu, nad glowami postaci) prowadzace do sekcji ponizej. */
const SPOTS = [
  { label: "Ława krytyków", href: "#lawa", x: 19, y: 38 },
  { label: "Sędzia", href: "#lawa", x: 50, y: 25 },
  { label: "Prokurator", href: "#lawa", x: 79, y: 36 },
  { label: "Akta na stole", href: "#akta", x: 47, y: 61 },
] as const;

/** Koszt w dolarach z przecinkiem, zaokraglony do centa. */
export const dollars = (nanoUsd: number): string => `$${(nanoUsd / 1e9).toFixed(2).replace(".", ",")}`;

/** Gora strony: co to jest, sprawa na wokandzie, akcje i liczby z nagrania; obok sala z punktami. */
export function Hero({ onOpen }: { readonly onOpen: () => void }) {
  const t = DEMO_TEASER;
  return (
    <header className="hero">
      <p className="hero__docket">
        <span>Demo — odtwarzanie nagranej rozprawy</span>
        <span className="hero__sig">sygn. {t.docket}</span>
      </p>
      <h1 className="hero__title">Trybunał CV</h1>
      <p className="hero__lead">Pięciu krytyków AI ocenia CV pod ogłoszenie, spiera się w debacie, a sędzia ogłasza werdykt.</p>
      <p className="hero__case">
        <span className="hero__case-label">Na wokandzie</span>
        {DEMO_CASE.summary}
      </p>
      <div className="hero__actions">
        <button type="button" className="intro__primary" onClick={onOpen}>
          <Scales />
          Otwórz rozprawę
        </button>
        <a className="intro__secondary" href={REPO_URL}>
          Uruchom z własnym CV
        </a>
      </div>
      <dl className="hero__facts">
        <div>
          <dt>krytyków AI</dt>
          <dd>{CRITIC_IDS.length}</dd>
        </div>
        <div>
          <dt>od wniesienia do werdyktu</dt>
          <dd>{t.seconds} s</dd>
        </div>
        <div>
          <dt>{t.calls} wywołań modelu</dt>
          <dd>{dollars(t.costNanoUsd)}</dd>
        </div>
      </dl>
      <figure className="hero__art">
        <div className="hero__stage">
          <img src={sala} width={1600} height={724} alt="Sala rozpraw 3D: ława krytyków-robotów, sędzia w todze i smok-prokurator przy mównicy" />
          {SPOTS.map((spot) => (
            <a
              key={spot.label}
              className="spot"
              href={spot.href}
              style={{ "--x": `${String(spot.x)}%`, "--y": `${String(spot.y)}%` } as CSSProperties}
            >
              <span className="spot__label">{spot.label}</span>
            </a>
          ))}
        </div>
        <figcaption>
          Ta strona nie ma serwera ani modelu. Odtwarza nagranie prawdziwej rozprawy nad fikcyjnym CV — te same zdarzenia, które przyszły z API, w tym
          koszt wywołań modelu.
        </figcaption>
      </figure>
    </header>
  );
}
