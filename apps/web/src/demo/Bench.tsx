import { ATS_GATE, type CriticId, INVITE_THRESHOLD } from "@trybunal/domain";
import { type CSSProperties, useId, useState } from "react";
import { CRITIC_LABELS } from "../labels.js";
import "./bench.css";
import ats from "./img/ats.webp";
import hiringManager from "./img/hiringManager.webp";
import hr from "./img/hr.webp";
import judge from "./img/judge.webp";
import prosecutor from "./img/prosecutor.webp";
import techLead from "./img/techLead.webp";
import { SectionHead } from "./SectionHead.js";
import { DEMO_TEASER } from "./teaser.js";

type SeatId = CriticId | "judge";

/**
 * Lawa w kolejnosci z sali: czterech przysieglych, sedzia na podwyzszeniu, prokurator przy mownicy.
 * Stanowiska to zdania z nagrania (test sprawdza, ze tam sa), nie opisy pisane pod strone.
 */
const SEATS: readonly { readonly id: SeatId; readonly portrait: string; readonly name: string; readonly role: string; readonly stance: string }[] = [
  {
    id: "ats",
    portrait: ats,
    ...CRITIC_LABELS.ats,
    stance:
      "CV zawiera część słów kluczowych z oferty (Java, Spring Boot, SQL, Git), struktura jest czytelna, ale brakuje wymaganych nazw technologii, dowodów na testy i PostgreSQL.",
  },
  {
    id: "hr",
    portrait: hr,
    ...CRITIC_LABELS.hr,
    stance:
      "Czytelne CV z jasną narracją przebranżowienia: 8 lat księgowości w płatnościach, potem bootcamp Java, a stanowisko junior pasuje do poziomu.",
  },
  {
    id: "techLead",
    portrait: techLead,
    ...CRITIC_LABELS.techLead,
    stance: "Realny poziom to początkujący po bootcampie, co pasuje do roli juniorskiej, ale na granicy spełnienia wymagań.",
  },
  {
    id: "hiringManager",
    portrait: hiringManager,
    ...CRITIC_LABELS.hiringManager,
    stance: "Ma potencjał na juniora z mentoringiem, więc warto zaprosić na rozmowę, ale wpływ pracy jest opisany obowiązkami, nie wynikami.",
  },
  {
    id: "judge",
    portrait: judge,
    name: "Sędzia",
    role: "Ogłasza werdykt według stałej reguły i pisze uzasadnienie z poprawkami CV",
    stance: `Nie głosuję. Werdykt wylicza reguła: zaproszenie, gdy średnia czterech przysięgłych wynosi co najmniej ${String(INVITE_THRESHOLD)}, a Bot ATS da minimum ${String(ATS_GATE)}. Ja piszę uzasadnienie i poprawki CV.`,
  },
  {
    id: "prosecutor",
    portrait: prosecutor,
    ...CRITIC_LABELS.prosecutor,
    stance: "Wysoki Trybunale, kandydatka nie dowodzi kluczowego wymogu oferty.",
  },
];

/** Lawa: postacie na wspolnej podlodze; wybrana (klik, klawiatura albo najechanie myszka) mowi pod spodem. */
export function Bench() {
  const [chosen, setChosen] = useState<SeatId>("hr");
  const stanceId = useId();
  const seat = SEATS.find((x) => x.id === chosen);
  if (seat === undefined) return null;
  return (
    <section className="intro-bench" id="lawa" aria-labelledby="bench-title">
      <SectionHead
        id="bench-title"
        kicker="Skład sądu"
        title="Każdy czyta CV inaczej"
        note={`Oceny otwarcia, zanim ktokolwiek usłyszał innych. W debacie ${String(DEMO_TEASER.mindChanges)} z nich się zmienią.`}
      />
      <div className="intro-bench__row" role="group" aria-label="Członkowie sądu">
        {SEATS.map((member, i) => (
          <button
            key={member.id}
            type="button"
            className={`seat seat--${member.id}`}
            style={{ "--i": i } as CSSProperties}
            aria-pressed={member.id === chosen}
            aria-controls={stanceId}
            onClick={() => {
              setChosen(member.id);
            }}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") setChosen(member.id);
            }}
          >
            <img className="seat__portrait" src={member.portrait} width={360} height={450} alt="" loading="lazy" />
            <span className="seat__name">{member.name}</span>
            <Score id={member.id} />
          </button>
        ))}
      </div>
      <figure className={`stance stance--${seat.id}`} id={stanceId} aria-live="polite">
        <blockquote>{quoted(seat.stance, seat.id)}</blockquote>
        <figcaption>
          <strong>{seat.name}</strong> — {seat.role}
        </figcaption>
      </figure>
    </section>
  );
}

/** Cytat w polskich cudzyslowach; sedzia mowi od siebie, wiec bez. */
const quoted = (text: string, id: SeatId): string => (id === "judge" ? text : `„${text}”`);

function Score({ id }: { readonly id: SeatId }) {
  if (id === "judge") return <span className="seat__score seat__score--sealed">werdykt zapieczętowany</span>;
  return (
    <span className="seat__score">
      <b>{DEMO_TEASER.opening[id]}</b>/10
      {id === "prosecutor" && <span className="seat__note">nie głosuje</span>}
    </span>
  );
}
