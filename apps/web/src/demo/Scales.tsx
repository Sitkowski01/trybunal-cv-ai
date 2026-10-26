/** Waga sadu jako SVG: znak ⚖ w fontach systemowych bywa kolorowym emoji albo innym glifem. */
export function Scales({ size = 20 }: { readonly size?: number }) {
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
