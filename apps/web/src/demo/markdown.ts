/** Blok dokumentu z akt: naglowek sekcji (##), punkt listy (-) albo zwykly akapit. */
export interface Block {
  readonly kind: "heading" | "item" | "text";
  readonly text: string;
}

export interface Doc {
  readonly title: string;
  readonly blocks: readonly Block[];
}

/** Dopisek o fikcyjnosci przykladu: mowi o tym naglowek strony, w aktach byloby to szumem. */
const FICTION_NOTE = /^\(.*fikcyjn/iu;

/**
 * Tyle Markdownu, ile maja przyklady z examples/: tytul (#), naglowki (##), punkty i pogrubienia.
 * Pogrubienia znikaja, bo w aktach liczy sie tresc, a zaznaczenia cytatow i tak ida po tekscie.
 */
export function parseDoc(markdown: string): Doc {
  const [first = "", ...rest] = markdown.trim().split("\n");
  const blocks = rest
    .map((line) => line.replaceAll("**", ""))
    .filter((line) => line.trim() !== "" && !FICTION_NOTE.test(line))
    .map((line): Block => {
      if (line.startsWith("## ")) return { kind: "heading", text: line.slice(3) };
      if (line.startsWith("- ")) return { kind: "item", text: line.slice(2) };
      return { kind: "text", text: line };
    });
  return { title: first.replace(/^#\s*/u, ""), blocks };
}
