import { type BlueprintEntry } from '../blueprints'

export interface BlueprintWizardFormData {
  // Base info
  projectId: string
  environmentId: string
  majorServiceVersion: string
  serviceName: string

  // Setup — blueprint-specific parameter values keyed by parameter id
  setupParams: Record<string, string>

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
    serviceName: '',
    setupParams: getDefaultSetupParams(blueprint),
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
  type: 'text' | 'number' | 'select'
  required?: boolean
  defaultValue?: string
  helper?: string
  options?: Array<{ value: string; label: string }>
}

const SETUP_PARAMS_BY_BLUEPRINT: Record<string, SetupParameter[]> = {
  'aws-s3': [
    { id: 'bucketName', label: 'Bucket name', type: 'text', required: true, helper: 'Globally unique. Lowercase, numbers, hyphens.' },
    {
      id: 'versioning',
      label: 'Versioning',
      type: 'select',
      defaultValue: 'enabled',
      options: [
        { value: 'enabled', label: 'Enabled' },
        { value: 'disabled', label: 'Disabled' },
      ],
    },
    { id: 'lifecycleDays', label: 'Lifecycle expiry (days)', type: 'number', defaultValue: '90' },
  ],
  'aws-postgres': [
    { id: 'dbName', label: 'Database name', type: 'text', required: true },
    { id: 'username', label: 'Master username', type: 'text', required: true, defaultValue: 'qovery' },
    {
      id: 'instanceClass',
      label: 'Instance class',
      type: 'select',
      defaultValue: 'db.t3.medium',
      options: [
        { value: 'db.t3.small', label: 'db.t3.small' },
        { value: 'db.t3.medium', label: 'db.t3.medium' },
        { value: 'db.r6g.large', label: 'db.r6g.large' },
      ],
    },
    { id: 'allocatedStorageGb', label: 'Allocated storage (GB)', type: 'number', defaultValue: '20' },
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
    { id: 'tlsEnabled', label: 'TLS enabled', type: 'select', defaultValue: 'true', options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }] },
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

function getDefaultSetupParams(blueprint: BlueprintEntry): Record<string, string> {
  const params = getSetupParameters(blueprint)
  return params.reduce<Record<string, string>>((acc, p) => {
    acc[p.id] = p.defaultValue ?? ''
    return acc
  }, {})
}
