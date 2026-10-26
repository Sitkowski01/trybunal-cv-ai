/** Naglowek sekcji strony startowej: maly napis i tytul po lewej, przypis po prawej. */
export function SectionHead({
  id,
  kicker,
  title,
  note,
}: {
  readonly id: string;
  readonly kicker: string;
  readonly title: string;
  readonly note: string;
}) {
  return (
    <div className="section-head">
      <p className="section-head__kicker">{kicker}</p>
      <h2 id={id}>{title}</h2>
      <p className="section-head__note">{note}</p>
    </div>
  );
}
