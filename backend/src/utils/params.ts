/** Express 5 types route params as `string | string[]` to account for wildcard captures.
 *  None of our routes use wildcards, so this narrows back to a plain string. */
export function pstr(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}
