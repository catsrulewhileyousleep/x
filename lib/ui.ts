// One definition per role. Pages compose these instead of restyling text inline.
export const ui = {
  /** Link inside running text. */
  link: "text-fg underline decoration-fg-muted underline-offset-[0.2em] transition-[text-decoration-color] duration-100 ease-out hover:decoration-fg",
  /** Link in navigation chrome (header, footer, breadcrumbs). */
  navLink: "text-fg-muted transition-[color] duration-100 ease-out hover:text-fg",
  /** Sentence under a page title. */
  lede: "mt-4 max-w-[60ch] text-[15px] text-pretty text-fg-muted",
  /** Long-form paragraphs. */
  prose: "max-w-[65ch] space-y-4 text-[15px] leading-relaxed text-pretty",
  /** Small label above a value or a list. */
  label: "text-[13px] text-fg-muted",
  /** Gap between a page header and its content, and between sections. */
  headerGap: "mt-12",
  sectionGap: "mt-16",
} as const;
