// Strips trailing slash(es) from the path of a URL, leaving any query string or fragment untouched.
// Backends (Helm repositories, container registries) reject a URL like `oci://docker.io/` because
// the trailing slash makes the path non-empty, so we normalize it before submitting the form.
export function stripUrlTrailingSlash(url: string): string {
  const suffixIndex = url.search(/[?#]/)
  const path = suffixIndex === -1 ? url : url.slice(0, suffixIndex)
  const suffix = suffixIndex === -1 ? '' : url.slice(suffixIndex)

  return path.replace(/\/+$/, '') + suffix
}
