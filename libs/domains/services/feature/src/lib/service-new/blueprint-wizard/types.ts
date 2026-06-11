import { type BlueprintEntry } from '../blueprints'

export interface BlueprintWizardFormData {
  // Base info
  projectId: string
  environmentId: string
  majorServiceVersion: string
  serviceName: string

  // Required — must be filled before proceeding
  setupParams: Record<string, string>

  // Optional — blueprint variables with defaults, customizable in Overrides
  optionalParams: Record<string, string>

  // Advanced
  credentialsMode: 'cluster' | 'environment'
  cpuMilli: number
  memoryMib: number
  timeoutSec: number
}

export function getDefaultFormData(
  blueprint: BlueprintEntry,
  context: { projectId: string; environmentId: string }
): BlueprintWizardFormData {
  return {
    projectId: context.projectId,
    environmentId: context.environmentId,
    // For MVP: latest version selected. The selector exists but only one option is offered.
    majorServiceVersion: blueprint.versions[0]?.version ?? '',
    serviceName: blueprint.name,
    setupParams: getSetupParameterDefaults(getSetupParameters(blueprint)),
    optionalParams: getSetupParameterDefaults(getOptionalParameters(blueprint)),
    credentialsMode: 'cluster',
    cpuMilli: 500,
    memoryMib: 256,
    timeoutSec: 600,
  }
}

// ─── Mock setup parameters per blueprint ─────────────────────────────────────
// Real implementation pulls these from the blueprint manifest (qbm.yml).

export interface SetupParameter {
  id: string
  label: string
  type: 'text' | 'number' | 'select' | 'boolean'
  required?: boolean
  sensitive?: boolean
  defaultValue?: string
  helper?: string
  options?: Array<{ value: string; label: string }>
  relatedFields?: SetupParameter[]
}

const SETUP_PARAMS_BY_BLUEPRINT: Record<string, SetupParameter[]> = {
  'aws-s3': [
    {
      id: 'bucketName',
      label: 'Bucket name',
      type: 'text',
      required: true,
      helper: 'Globally unique. Lowercase, numbers, hyphens.',
    },
    {
      id: 'versioning',
      label: 'Versioning',
      type: 'boolean',
      defaultValue: 'false',
      helper: 'Enable object versioning',
      relatedFields: [
        {
          id: 'versioningRetentionDays',
          label: 'Versioning retention (days)',
          type: 'number',
          defaultValue: '90',
        },
      ],
    },
  ],
  'aws-postgres': [
    {
      id: 'db_name',
      label: 'Database name',
      type: 'text',
      required: true,
      helper: 'Letters, digits, underscores only. Must start with a letter. Max 63 chars.',
    },
    {
      id: 'db_username',
      label: 'Master username',
      type: 'text',
      required: true,
      helper: 'Letters, digits, underscores. Must start with a letter. Max 63 chars.',
    },
    {
      id: 'db_password',
      label: 'Master password',
      type: 'text',
      required: true,
      sensitive: true,
      helper: '8–128 chars. Must not contain /, @, ", or spaces.',
    },
  ],
  'helm-redis': [
    { id: 'replicaCount', label: 'Replica count', type: 'number', defaultValue: '1' },
    { id: 'persistenceSize', label: 'Persistence size (GB)', type: 'number', defaultValue: '8' },
  ],
  'qovery-container': [
    { id: 'image', label: 'Container image', type: 'text', required: true, helper: 'e.g. nginx:1.25' },
    { id: 'port', label: 'Port', type: 'number', defaultValue: '80' },
  ],
  'aws-elasticache': [
    { id: 'nodeType', label: 'Node type', type: 'text', defaultValue: 'cache.t3.micro' },
    { id: 'replicas', label: 'Replicas', type: 'number', defaultValue: '1' },
  ],
  'aws-sqs': [
    { id: 'queueName', label: 'Queue name', type: 'text', required: true },
    {
      id: 'queueType',
      label: 'Queue type',
      type: 'select',
      defaultValue: 'standard',
      options: [
        { value: 'standard', label: 'Standard' },
        { value: 'fifo', label: 'FIFO' },
      ],
    },
  ],
  'gcp-cloud-sql': [
    { id: 'dbName', label: 'Database name', type: 'text', required: true },
    { id: 'tier', label: 'Tier', type: 'text', defaultValue: 'db-n1-standard-1' },
  ],
  'nginx-ingress': [
    { id: 'replicaCount', label: 'Replica count', type: 'number', defaultValue: '2' },
    {
      id: 'tlsEnabled',
      label: 'TLS enabled',
      type: 'select',
      defaultValue: 'true',
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
    },
  ],
  'data-platform': [
    { id: 'bucketName', label: 'Storage bucket name', type: 'text', required: true },
    { id: 'dbName', label: 'Database name', type: 'text', required: true },
    { id: 'apiImage', label: 'API container image', type: 'text', required: true },
  ],
}

export function getSetupParameters(blueprint: BlueprintEntry): SetupParameter[] {
  return SETUP_PARAMS_BY_BLUEPRINT[blueprint.id] ?? []
}

const OPTIONAL_PARAMS_BY_BLUEPRINT: Record<string, SetupParameter[]> = {
  'aws-postgres': [
    {
      id: 'instance_class',
      label: 'Instance class',
      type: 'select',
      defaultValue: 'db.t3.micro',
      helper: 'RDS instance class controlling compute and memory.',
      options: [
        { value: 'db.t3.micro', label: 'db.t3.micro' },
        { value: 'db.t3.small', label: 'db.t3.small' },
        { value: 'db.t3.medium', label: 'db.t3.medium' },
        { value: 'db.t3.large', label: 'db.t3.large' },
        { value: 'db.m5.large', label: 'db.m5.large' },
        { value: 'db.m5.xlarge', label: 'db.m5.xlarge' },
        { value: 'db.m5.2xlarge', label: 'db.m5.2xlarge' },
        { value: 'db.m5.4xlarge', label: 'db.m5.4xlarge' },
        { value: 'db.r5.large', label: 'db.r5.large' },
        { value: 'db.r5.xlarge', label: 'db.r5.xlarge' },
      ],
    },
    {
      id: 'allocated_storage',
      label: 'Allocated storage (GiB)',
      type: 'number',
      defaultValue: '20',
      helper: 'Min 20, max 65 536 for gp3.',
    },
    {
      id: 'multi_az',
      label: 'Multi-AZ deployment',
      type: 'boolean',
      defaultValue: 'false',
      helper: 'Enables a standby replica in a separate availability zone.',
    },
  ],
}

export function getOptionalParameters(blueprint: BlueprintEntry): SetupParameter[] {
  return OPTIONAL_PARAMS_BY_BLUEPRINT[blueprint.id] ?? []
}

export function isSetupBooleanEnabled(value: string | undefined | null): boolean {
  const normalizedValue = (value ?? '').trim().toLowerCase()
  return normalizedValue === 'true' || normalizedValue === '1' || normalizedValue === 'yes' || normalizedValue === 'on'
}

export function getVisibleSetupParameters(
  setupParameters: SetupParameter[],
  values: Record<string, string>
): SetupParameter[] {
  return setupParameters.flatMap((parameter) => {
    if (
      parameter.type !== 'boolean' ||
      !parameter.relatedFields?.length ||
      !isSetupBooleanEnabled(values[parameter.id])
    ) {
      return [parameter]
    }

    return [parameter, ...getVisibleSetupParameters(parameter.relatedFields, values)]
  })
}

export function getSetupParameterDefaults(setupParameters: SetupParameter[]): Record<string, string> {
  return getAllSetupParameters(setupParameters).reduce<Record<string, string>>((acc, parameter) => {
    acc[parameter.id] = parameter.defaultValue ?? ''
    return acc
  }, {})
}

function getAllSetupParameters(setupParameters: SetupParameter[]): SetupParameter[] {
  return setupParameters.flatMap((parameter) => {
    if (!parameter.relatedFields?.length) return [parameter]

    return [parameter, ...getAllSetupParameters(parameter.relatedFields)]
  })
}
