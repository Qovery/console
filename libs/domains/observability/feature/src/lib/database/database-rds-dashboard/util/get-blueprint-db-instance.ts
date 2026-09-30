import { type VariableResponse } from 'qovery-typescript-axios'

// RDS identifiers contain only letters, digits and hyphens. Validate the output before it is
// interpolated into PromQL selectors by the dashboard charts.
const RDS_INSTANCE_IDENTIFIER = /^[A-Za-z][A-Za-z0-9-]{0,62}$/

export function getBlueprintDbInstance(
  serviceId: string,
  variables: Pick<VariableResponse, 'key' | 'value' | 'is_secret'>[]
): string | undefined {
  const key = `QOVERY_OUTPUT_TERRAFORM_Z${serviceId.split('-')[0].toUpperCase()}_DB_IDENTIFIER`
  const variable = variables.find((candidate) => candidate.key === key && !candidate.is_secret)
  const identifier = variable?.value?.trim()

  return identifier && RDS_INSTANCE_IDENTIFIER.test(identifier) ? identifier : undefined
}
