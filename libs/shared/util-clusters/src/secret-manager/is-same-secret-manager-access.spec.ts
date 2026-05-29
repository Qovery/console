import { type SecretManagerAccess } from 'qovery-typescript-axios'
import { isSameSecretManagerAccess } from './is-same-secret-manager-access'

describe('isSameSecretManagerAccess', () => {
  it('should match persisted secret managers by id', () => {
    const secretManager = { id: 'secret-manager-id' } as SecretManagerAccess
    const targetSecretManager = { id: 'secret-manager-id' } as SecretManagerAccess

    expect(isSameSecretManagerAccess(secretManager, targetSecretManager)).toBe(true)
  })

  it('should not match different persisted secret managers', () => {
    const secretManager = { id: 'secret-manager-id' } as SecretManagerAccess
    const targetSecretManager = { id: 'another-secret-manager-id' } as SecretManagerAccess

    expect(isSameSecretManagerAccess(secretManager, targetSecretManager)).toBe(false)
  })

  it('should match unsaved secret managers by reference', () => {
    const secretManager = {} as SecretManagerAccess

    expect(isSameSecretManagerAccess(secretManager, secretManager)).toBe(true)
  })

  it('should not match different unsaved secret managers', () => {
    const secretManager = {} as SecretManagerAccess
    const targetSecretManager = {} as SecretManagerAccess

    expect(isSameSecretManagerAccess(secretManager, targetSecretManager)).toBe(false)
  })
})
