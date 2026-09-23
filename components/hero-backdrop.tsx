/** Backdrop for the home hero: one soft accent wash plus an ordered-dither dot field
 *  that dissolves with the same mask, so the fade never bands. Contained to the hero
 *  (never the header above it) and static on purpose. */
export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div className="hero-wash absolute inset-0" />
      <div className="hero-dither absolute inset-0" />
    </div>
  );
}
