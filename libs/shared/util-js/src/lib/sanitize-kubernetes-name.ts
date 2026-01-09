/**
 * Sanitizes a name for Kubernetes compatibility
 * - Lowercase only
 * - Replace non-alphanumeric (except hyphens) with hyphens
 * - Remove leading/trailing hyphens
 * - Replace multiple consecutive hyphens with single hyphen
 * - Max 63 characters (Kubernetes limit)
 *
 * @param name - The name to sanitize
 * @returns A Kubernetes-compatible name
 *
 * @example
 * sanitizeKubernetesName('My App Name') // 'my-app-name'
 * sanitizeKubernetesName('app__with--special!!!chars') // 'app-with-special-chars'
 * sanitizeKubernetesName('-leading-and-trailing-') // 'leading-and-trailing'
 */
export function sanitizeKubernetesName(name: string): string {
  return name
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z0-9-]/g, '-') // Replace non-alphanumeric (except hyphens) with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/-+/g, '-') // Replace multiple consecutive hyphens with single hyphen
    .substring(0, 63) // Kubernetes name limit is 63 characters
}
