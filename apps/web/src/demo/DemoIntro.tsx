// Fonty jak w portfolio, z paczki (CSP: tylko 'self'). Sala ich nie uzywa, wiec laduje je tylko strona startowa.
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/space-grotesk";
import { Bench } from "./Bench.js";
import { DEMO_CASE } from "./case.js";
import { Files } from "./Files.js";
import sala from "./img/sala.webp";
import { Protocol } from "./Protocol.js";

export const REPO_URL = "https://github.com/Sitkowski01/trybunal-cv-ai";

export interface DemoIntroProps {
  readonly onOpen: () => void;
}

/**
 * Strona startowa demo zamiast formularza: formularz przyjmowalby dowolne CV, a odtworzyl
 * zawsze to samo nagranie — to wprowadzaloby w blad. Tu widac sale, sklad sadu i akta sprawy.
 */
export function DemoIntro({ onOpen }: DemoIntroProps) {
  return (
    <article className="intro">
      <header className="hero">
        <p className="hero__badge">
          <span className="hero__ticker" aria-hidden="true">
            $TRYB
          </span>
          <span>Demo — odtwarzanie nagranej rozprawy</span>
        </p>
        <h1 className="hero__title">
          Trybunał <span>CV</span>
        </h1>
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

      <Bench />
      <Files />
      <Protocol />

      <footer className="closing">
        <p className="closing__text">Sąd jest w komplecie, akta na stole.</p>
        <button type="button" className="hero__open" onClick={onOpen}>
          <Scales />
          Wejdź na salę
        </button>
      </footer>
    </article>
  );
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
