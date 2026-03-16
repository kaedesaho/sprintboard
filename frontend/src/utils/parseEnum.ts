export function parseEnum<T extends string>(
  value: string | null | undefined,
  allowed: T[],
  defaultValue: T
): T {
  if (value && allowed.includes(value as T)) {
    return value as T;
  }
  return defaultValue;
}
