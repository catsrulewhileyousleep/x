// True once the first page has hydrated. Components mounted after that are rendering from a
// client-side navigation, where reading browser storage in a state initializer cannot cause
// a hydration mismatch.
let hydrated = false;

export function markHydrated() {
  hydrated = true;
}

export function isClientNavigation() {
  return hydrated;
}
