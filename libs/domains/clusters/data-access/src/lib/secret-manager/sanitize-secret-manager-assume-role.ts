import { type SecretManagerAccess } from 'qovery-typescript-axios'

/**
 * The assume role only belongs to the manual role ARN integration, and the form keeps every field typed so far: drop it
 * from any other authentication. For a role ARN authentication, drop it when its role ARN is empty (which also removes
 * it on edit) and drop an empty external id; the form trims both fields.
 */
export const sanitizeSecretManagerAssumeRole = (secretManager: SecretManagerAccess): SecretManagerAccess => {
  const { authentication } = secretManager

  if (authentication.mode !== 'AWS_ROLE_ARN') {
    if (!('assume_role' in authentication)) {
      return secretManager
    }

    const authenticationWithoutAssumeRole = { ...authentication }
    Reflect.deleteProperty(authenticationWithoutAssumeRole, 'assume_role')
    return { ...secretManager, authentication: authenticationWithoutAssumeRole }
  }

  const roleArn = authentication.assume_role?.role_arn
  const externalId = authentication.assume_role?.external_id

  return {
    ...secretManager,
    authentication: {
      ...authentication,
      assume_role: roleArn ? { role_arn: roleArn, ...(externalId ? { external_id: externalId } : {}) } : undefined,
    },
  }
}
