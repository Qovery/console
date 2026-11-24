import {
  type SelfManagedClusterRegistryRequest,
  SelfManagedClusterRegistryRequestKindEnum,
} from 'qovery-typescript-axios'

export interface SelfManagedClusterRegistryValues {
  registryUrl: string
  registryUsername: string
  registryPassword: string
}

const URL_PARTS_PATTERN = /^([^:/?#]*):\/\/([^/?#]*)([^?#]*)(\?[^#]*)?(#.*)?$/
const HOST_AND_PORT_PATTERN = /^(\[[0-9A-Fa-f:.]+\]|[A-Za-z0-9.-]+)(?::(\d+))?$/
const HOST_LABEL_PATTERN = /^[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/
const IPV4_PATTERN = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
const MAX_HOST_NAME_LENGTH = 253
const MAX_PORT = 65535
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '::1']
const UNSPECIFIED_IPV6_HOST = '[::]'
const DEDICATED_REGISTRY_HOSTS = ['docker.io', 'ghcr.io', 'registry.gitlab.com', 'public.ecr.aws']

function parseIpv4(host: string) {
  const octets = host.match(IPV4_PATTERN)?.slice(1).map(Number)
  return octets?.every((octet) => octet <= 255) ? octets : undefined
}

function isHostName(host: string) {
  const labels = host.split('.')
  return (
    host.length <= MAX_HOST_NAME_LENGTH &&
    labels.every((label) => HOST_LABEL_PATTERN.test(label)) &&
    !/^\d+$/.test(labels[labels.length - 1])
  )
}

function isPort(port: string | undefined) {
  return port === undefined || (Number(port) >= 1 && Number(port) <= MAX_PORT)
}

export function validateRegistryUrl(value: string) {
  const url = value.trim()
  if (!url) return 'Please enter a registry URL.'

  const [, scheme, authority = '', path, query, fragment] = url.match(URL_PARTS_PATTERN) ?? []
  if (scheme !== 'http' && scheme !== 'https') return 'The registry URL must start with http:// or https://.'
  if (authority.includes('@'))
    return 'The registry URL must not contain a username or a password: use the fields below.'
  const [, rawHost = '', port] = authority.match(HOST_AND_PORT_PATTERN) ?? []
  const host = rawHost.toLowerCase().replace(/\.$/, '')
  const ipv4 = parseIpv4(host)
  if (!(host.startsWith('[') || ipv4 || isHostName(host)) || !isPort(port))
    return 'Please enter a valid registry URL, for example https://registry.example.com:5000.'
  if (
    LOCAL_HOSTS.some((localHost) => host.includes(localHost)) ||
    ipv4?.[0] === 127 ||
    ipv4?.every((octet) => octet === 0) ||
    host === UNSPECIFIED_IPV6_HOST
  )
    return 'The registry URL cannot target localhost.'
  if (DEDICATED_REGISTRY_HOSTS.includes(host))
    return 'Docker Hub, GitHub, GitLab and Amazon ECR Public registries cannot be used here. Use a self-hosted registry.'
  if (path) return 'The registry URL must not contain a path: keep the host and the optional port only.'
  if (query) return 'The registry URL must not contain query parameters.'
  if (fragment) return 'The registry URL must not contain a fragment.'

  return true
}

export function validateRegistryUsername(username: string, password: string) {
  return Boolean(username.trim()) || !password.trim() || 'Please enter a username, or clear the password.'
}

export function validateRegistryPassword(password: string, username: string) {
  return Boolean(password.trim()) || !username.trim() || 'Please enter a password, or clear the username.'
}

export function getSelfManagedClusterRegistryRequest({
  registryUrl,
  registryUsername,
  registryPassword,
}: SelfManagedClusterRegistryValues): SelfManagedClusterRegistryRequest {
  const username = registryUsername.trim()

  return {
    kind: SelfManagedClusterRegistryRequestKindEnum.GENERIC_CR,
    url: registryUrl.trim(),
    ...(username && registryPassword.trim() ? { credentials: { username, password: registryPassword } } : {}),
  }
}
