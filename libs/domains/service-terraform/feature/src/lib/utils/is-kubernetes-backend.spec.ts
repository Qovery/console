import { isKubernetesBackend } from './is-kubernetes-backend'

describe('isKubernetesBackend', () => {
  it('treats a missing backend as the default Kubernetes one', () => {
    expect(isKubernetesBackend(undefined)).toBe(true)
  })

  it('recognizes the Kubernetes backend', () => {
    expect(isKubernetesBackend({ kubernetes: {} })).toBe(true)
  })

  it('recognizes a user provided backend', () => {
    expect(isKubernetesBackend({ user_provided: {} })).toBe(false)
  })
})
