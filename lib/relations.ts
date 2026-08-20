export function firstRelation<T>(
  value: T[] | T | null | undefined,
): T | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}