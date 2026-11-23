import {
  getSelfManagedClusterRegistryRequest,
  validateRegistryPassword,
  validateRegistryUrl,
  validateRegistryUsername,
} from './self-managed-cluster-registry'

describe('validateRegistryUrl', () => {
  it.each([
    'https://registry.example.com',
    'http://registry.example.com',
    'https://registry.example.com:5000',
    'https://10.0.0.12:5000',
    'https://[2001:db8::2]:5000',
    '  https://registry.example.com  ',
    'https://mirror.ghcr.io',
    'https://docker.io.example.com',
    'https://registry.example.com.',
    'https://registry-1.example.com:65535',
    'https://128.0.0.1',
  ])('accepts %s', (url) => {
    expect(validateRegistryUrl(url)).toBe(true)
  })

  it.each([
    'https://docker.io',
    'https://ghcr.io',
    'https://registry.gitlab.com',
    'https://public.ecr.aws',
    'https://docker.io:443',
    'https://GHCR.io',
    'https://docker.io.',
    'https://GHCR.IO.:443',
  ])('rejects %s, which needs a registry kind this flow does not create', (url) => {
    expect(validateRegistryUrl(url)).toBe(
      'Docker Hub, GitHub, GitLab and Amazon ECR Public registries cannot be used here. Use a self-hosted registry.'
    )
  })

  it.each([
    ['', 'Please enter a registry URL.'],
    ['   ', 'Please enter a registry URL.'],
    ['registry.example.com', 'The registry URL must start with http:// or https://.'],
    ['registry.example.com:5000', 'The registry URL must start with http:// or https://.'],
    ['ftp://registry.example.com', 'The registry URL must start with http:// or https://.'],
    ['HTTPS://registry.example.com', 'The registry URL must start with http:// or https://.'],
    [
      'https://user@registry.example.com',
      'The registry URL must not contain a username or a password: use the fields below.',
    ],
    [
      'https://user:secret@registry.example.com',
      'The registry URL must not contain a username or a password: use the fields below.',
    ],
    ['https://', 'Please enter a valid registry URL, for example https://registry.example.com:5000.'],
    [
      'https://registry example.com',
      'Please enter a valid registry URL, for example https://registry.example.com:5000.',
    ],
    [
      'https://registry.example.com:port',
      'Please enter a valid registry URL, for example https://registry.example.com:5000.',
    ],
    ...[
      'https://-registry.example.com',
      'https://registry-.example.com',
      'https://registry..example.com',
      'https://registry.example.com..',
      'https://registry.123',
      'https://127.1',
      'https://256.0.0.1',
      `https://${'a'.repeat(64)}.example.com`,
      'https://registry.example.com:0',
      'https://registry.example.com:65536',
      'https://registry.example.com:999999',
    ].map((url) => [url, 'Please enter a valid registry URL, for example https://registry.example.com:5000.']),
    ['https://localhost', 'The registry URL cannot target localhost.'],
    ['https://mylocalhost.example.com', 'The registry URL cannot target localhost.'],
    ['https://127.0.0.2', 'The registry URL cannot target localhost.'],
    ['https://127.255.255.254:5000', 'The registry URL cannot target localhost.'],
    ['https://0.0.0.0', 'The registry URL cannot target localhost.'],
    ['https://[::]:5000', 'The registry URL cannot target localhost.'],
    ['http://localhost:5000', 'The registry URL cannot target localhost.'],
    ['https://127.0.0.1:5000', 'The registry URL cannot target localhost.'],
    ['https://[::1]:5000', 'The registry URL cannot target localhost.'],
    [
      'https://registry.example.com/',
      'The registry URL must not contain a path: keep the host and the optional port only.',
    ],
    [
      'https://registry.example.com/v2/my-project',
      'The registry URL must not contain a path: keep the host and the optional port only.',
    ],
    ['https://registry.example.com?mirror=true', 'The registry URL must not contain query parameters.'],
    ['https://registry.example.com#images', 'The registry URL must not contain a fragment.'],
  ])('rejects "%s"', (url, message) => {
    expect(validateRegistryUrl(url)).toBe(message)
  })
})

describe('registry credentials', () => {
  it('accepts no username and no password', () => {
    expect(validateRegistryUsername('', '')).toBe(true)
    expect(validateRegistryPassword('', '')).toBe(true)
  })

  it('accepts a username with a password', () => {
    expect(validateRegistryUsername('robot', 'secret')).toBe(true)
    expect(validateRegistryPassword('secret', 'robot')).toBe(true)
  })

  it.each(['', '   '])('asks for the username "%s" missing next to a password', (username) => {
    expect(validateRegistryUsername(username, 'secret')).toBe('Please enter a username, or clear the password.')
    expect(validateRegistryPassword('secret', username)).toBe(true)
  })

  it.each(['', '   '])('asks for the password "%s" missing next to a username', (password) => {
    expect(validateRegistryPassword(password, 'robot')).toBe('Please enter a password, or clear the username.')
    expect(validateRegistryUsername('robot', password)).toBe(true)
  })
})

describe('getSelfManagedClusterRegistryRequest', () => {
  it('sends the URL alone without credentials', () => {
    expect(
      getSelfManagedClusterRegistryRequest({
        registryUrl: ' https://registry.example.com:5000 ',
        registryUsername: '',
        registryPassword: '',
      })
    ).toStrictEqual({ url: 'https://registry.example.com:5000' })
  })

  it('sends the credentials when both the username and the password are filled', () => {
    expect(
      getSelfManagedClusterRegistryRequest({
        registryUrl: 'https://registry.example.com',
        registryUsername: ' robot ',
        registryPassword: ' s3cret ',
      })
    ).toStrictEqual({
      url: 'https://registry.example.com',
      credentials: { username: 'robot', password: ' s3cret ' },
    })
  })

  it.each([
    ['robot', ''],
    ['', 'secret'],
    ['robot', '   '],
  ])('never sends half credentials (username "%s", password "%s")', (registryUsername, registryPassword) => {
    expect(
      getSelfManagedClusterRegistryRequest({
        registryUrl: 'https://registry.example.com',
        registryUsername,
        registryPassword,
      })
    ).toStrictEqual({ url: 'https://registry.example.com' })
  })
})
