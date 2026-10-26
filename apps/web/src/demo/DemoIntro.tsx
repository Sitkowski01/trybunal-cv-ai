import { type CSSProperties, useId, useState } from "react";
import { CRITIC_LABELS } from "../labels.js";
import { DEMO_CASE } from "./case.js";
import ats from "./img/ats.webp";
import hiringManager from "./img/hiringManager.webp";
import hr from "./img/hr.webp";
import judge from "./img/judge.webp";
import prosecutor from "./img/prosecutor.webp";
import sala from "./img/sala.webp";
import techLead from "./img/techLead.webp";

export const REPO_URL = "https://github.com/Sitkowski01/trybunal-cv-ai";

export interface DemoIntroProps {
  readonly onOpen: () => void;
}

/** Portrety z tych samych modeli GLB co sala (render w three.js), kolejnosc jak na lawie przysieglych. */
const BENCH = [
  { id: "ats", portrait: ats, ...CRITIC_LABELS.ats },
  { id: "hr", portrait: hr, ...CRITIC_LABELS.hr },
  { id: "techLead", portrait: techLead, ...CRITIC_LABELS.techLead },
  { id: "hiringManager", portrait: hiringManager, ...CRITIC_LABELS.hiringManager },
  { id: "prosecutor", portrait: prosecutor, ...CRITIC_LABELS.prosecutor },
  { id: "judge", portrait: judge, name: "Sędzia", role: "Ogłasza werdykt według stałej reguły i pisze uzasadnienie z poprawkami CV", emblem: "§" },
] as const;

/**
 * Strona startowa demo zamiast formularza: formularz przyjmowalby dowolne CV, a odtworzyl
 * zawsze to samo nagranie — to wprowadzaloby w blad. Tu widac sale, sklad sadu i akta sprawy.
 */
export function DemoIntro({ onOpen }: DemoIntroProps) {
  return (
    <article className="intro">
      <header className="hero">
        <p className="hero__badge">Demo — odtwarzanie nagranej rozprawy</p>
        <h1 className="hero__title">Trybunał CV</h1>
        <p className="hero__lead">Pięciu krytyków AI ocenia CV pod ogłoszenie, spiera się w debacie, a sędzia ogłasza werdykt.</p>
        <figure className="hero__art">
          <img src={sala} width={1600} height={724} alt="Sala rozpraw 3D: ława krytyków-robotów, sędzia w todze i smok-prokurator przy mównicy" />
          <figcaption>Sala 3D z modeli z Blendera</figcaption>
        </figure>
        <div className="hero__case">
          <p className="hero__docket">Na wokandzie</p>
          <p className="hero__summary">{DEMO_CASE.summary}</p>
        </div>
        <div className="hero__actions">
          <button type="button" className="hero__open" onClick={onOpen}>
            <Scales />
            Otwórz rozprawę
          </button>
          <a href={REPO_URL}>Własne CV: uruchom projekt lokalnie</a>
        </div>
        <p className="hero__note">
          Ta strona nie ma serwera ani modelu. Odtwarza nagranie prawdziwej rozprawy nad fikcyjnym CV — te same zdarzenia, które przyszły z API, w tym
          koszt wywołań modelu.
        </p>
      </header>

      <section className="jury" aria-labelledby="jury-title">
        <h2 id="jury-title">Skład sądu</h2>
        <ul className="jury__list">
          {BENCH.map((member, i) => (
            <li key={member.id} className={`jury__card jury__card--${member.id}`} style={{ "--i": i } as CSSProperties}>
              <img className="jury__portrait" src={member.portrait} width={360} height={450} alt="" loading="lazy" />
              <h3>
                <span className="jury__emblem" aria-hidden="true">
                  {member.emblem === "⚖" ? <Scales size={15} /> : member.emblem}
                </span>
                {member.name}
              </h3>
              <p>{member.role}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="files" aria-labelledby="files-title">
        <h2 id="files-title">Akta sprawy</h2>
        <div className="files__list">
          <Paper label="CV kandydatki" text={DEMO_CASE.cv} />
          <Paper label="Ogłoszenie o pracę" text={DEMO_CASE.offer} />
        </div>
      </section>

    </article>
  );
}

/** Dokument z akt jako kartka: tytul z naglowka Markdown, reszta zwinieta do rozwiniecia. */
function Paper({ label, text }: { readonly label: string; readonly text: string }) {
  const [open, setOpen] = useState(false);
  const [first = "", ...rest] = text.trim().split("\n");
  const id = useId();
  return (
    <section className={`paper${open ? " paper--open" : ""}`} aria-label={label}>
      <p className="paper__label">{label}</p>
      <h3 className="paper__title">{first.replace(/^#\s*/u, "")}</h3>
      <div id={id} className="paper__body">
        {rest.map((line, i) => (
          <PaperLine key={i} line={line} />
        ))}
      </div>
      <button
        type="button"
        className="paper__toggle"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          setOpen(!open);
        }}
      >
        {open ? "Zwiń" : "Czytaj całość"}
      </button>
    </section>
  );
}

/** Tyle Markdownu, ile maja przyklady: naglowki ##, punkty i pogrubienia. */
function PaperLine({ line }: { readonly line: string }) {
  const plain = line.replaceAll("**", "");
  if (plain.trim() === "" || /^\(.*fikcyjn/iu.test(plain)) return null; // fikcyjnosc mowi pieczatka na kartce
  if (plain.startsWith("## ")) return <h4>{plain.slice(3)}</h4>;
  if (plain.startsWith("- ")) return <p className="paper__item">{plain.slice(2)}</p>;
  return <p>{plain}</p>;
}

/** Waga sadu jako SVG: znak ⚖ w fontach systemowych bywa kolorowym emoji albo innym glifem. */
function Scales({ size = 22 }: { readonly size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v18M7 21h10M4 7h16M12 3l-1 4h2z" />
      <path d="M6 7l-3 7a3.5 3.5 0 0 0 6 0zM18 7l-3 7a3.5 3.5 0 0 0 6 0z" />
    </svg>
  );
}
