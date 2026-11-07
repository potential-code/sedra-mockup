/** Public asset URL that works under any sub-folder (base './'). Pass a path relative to public/. */
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
}
