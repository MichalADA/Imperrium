export const CURRENT_WORLD_YEAR = 607;

export function calculateAge(birthYear: number | null | undefined, deathYear: number | null | undefined): number | null {
  if (birthYear == null) return null;
  return (deathYear ?? CURRENT_WORLD_YEAR) - birthYear;
}
