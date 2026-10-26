// Fonty jak w portfolio, z paczki (CSP: tylko 'self'). Sala ich nie uzywa, wiec laduje je tylko strona startowa.
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/space-grotesk";
import "./intro.css";
import { INVITE_THRESHOLD } from "@trybunal/domain";
import { Bench } from "./Bench.js";
import { Files } from "./Files.js";
import { Hero } from "./Hero.js";
import { Protocol } from "./Protocol.js";
import { Scales } from "./Scales.js";

export { REPO_URL } from "./Hero.js";

export interface DemoIntroProps {
  readonly onOpen: () => void;
}

/**
 * Strona startowa demo zamiast formularza: formularz przyjmowalby dowolne CV, a odtworzyl
 * zawsze to samo nagranie — to wprowadzaloby w blad. Pokazuje te rozprawe: sale, lawe ze stanowiskami
 * z nagrania, CV z zaznaczonymi cytatami krytykow i protokol z prawdziwymi czasami. Werdykt zostaje na sale.
 */
export function DemoIntro({ onOpen }: DemoIntroProps) {
  return (
    <article className="intro">
      <Hero onOpen={onOpen} />
      <Bench />
      <Files />
      <Protocol />
      <footer className="closing">
        <div className="closing__seal" aria-hidden="true">
          §
        </div>
        <div className="closing__text">
          <h2>Werdykt jest zapieczętowany.</h2>
          <p>Zobacz, jak debata przesuwa oceny i po której stronie progu {String(INVITE_THRESHOLD)} staje średnia przysięgłych.</p>
        </div>
        <button type="button" className="intro__primary" onClick={onOpen}>
          <Scales />
          Wejdź na salę
        </button>
      </footer>
    </article>
  );
}
