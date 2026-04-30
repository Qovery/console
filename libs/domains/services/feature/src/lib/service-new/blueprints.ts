import AWS from 'devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg'
import GCP from 'devicon/icons/googlecloud/googlecloud-original.svg'
import HelmIcon from 'devicon/icons/helm/helm-original.svg'

// ─── Types ───────────────────────────────────────────────────────────────────

export type ProviderKey = 'aws' | 'gcp' | 'helm' | 'qovery'
export type EngineKey = 'terraform' | 'helm' | 'stack'
export type CategoryKey = 'database' | 'storage' | 'cache' | 'application' | 'networking' | 'messaging' | 'stack'

export interface BlueprintVersion {
  version: string
  releaseDate: string // ISO date — yyyy-mm-dd
}

export interface BlueprintEntry {
  id: string
  name: string
  description: string
  provider: ProviderKey
  engine: EngineKey
  categories: CategoryKey[]
  versions: BlueprintVersion[] // latest first
  isNew?: boolean
}

// ─── Mock catalog (replaced by API once wired) ───────────────────────────────

export const MOCK_BLUEPRINTS: BlueprintEntry[] = [
  {
    id: 'aws-s3',
    name: 'AWS S3 Bucket',
    description: 'Object storage with server-side encryption, versioning, and configurable lifecycle policies.',
    provider: 'aws',
    engine: 'terraform',
    categories: ['storage'],
    versions: [
      { version: '1.2.0', releaseDate: '2026-04-15' },
      { version: '1.1.0', releaseDate: '2026-02-20' },
      { version: '1.0.0', releaseDate: '2025-12-10' },
    ],
  },
  {
    id: 'aws-postgres',
    name: 'AWS RDS PostgreSQL',
    description: 'Managed PostgreSQL on RDS — configurable instance class, allocated storage, and multi-AZ.',
    provider: 'aws',
    engine: 'terraform',
    categories: ['database'],
    versions: [
      { version: '1.0.0', releaseDate: '2026-04-22' },
    ],
    isNew: true,
  },
  {
    id: 'helm-redis',
    name: 'Redis',
    description: 'In-memory key-value store deployed via the Bitnami Helm chart with configurable replicas.',
    provider: 'helm',
    engine: 'helm',
    categories: ['cache'],
    versions: [
      { version: '7.4.0', releaseDate: '2026-03-30' },
      { version: '7.3.1', releaseDate: '2026-01-18' },
      { version: '7.3.0', releaseDate: '2025-11-05' },
    ],
  },
  {
    id: 'qovery-container',
    name: 'Container',
    description: 'Deploy any container image on Qovery with full CPU, memory, and port configuration.',
    provider: 'qovery',
    engine: 'terraform',
    categories: ['application'],
    versions: [
      { version: '1.0.0', releaseDate: '2025-10-01' },
    ],
  },
  {
    id: 'aws-elasticache',
    name: 'AWS ElastiCache Redis',
    description: 'Fully managed Redis on ElastiCache with replication groups and automatic failover.',
    provider: 'aws',
    engine: 'terraform',
    categories: ['cache'],
    versions: [
      { version: '1.0.0', releaseDate: '2026-04-10' },
    ],
    isNew: true,
  },
  {
    id: 'aws-sqs',
    name: 'AWS SQS Queue',
    description: 'Managed message queue with FIFO and standard queue support, dead-letter queue included.',
    provider: 'aws',
    engine: 'terraform',
    categories: ['messaging'],
    versions: [
      { version: '1.1.0', releaseDate: '2026-03-12' },
      { version: '1.0.0', releaseDate: '2025-09-22' },
    ],
  },
  {
    id: 'gcp-cloud-sql',
    name: 'GCP Cloud SQL',
    description: 'Managed PostgreSQL on Google Cloud SQL with private IP, high availability, and backups.',
    provider: 'gcp',
    engine: 'terraform',
    categories: ['database'],
    versions: [
      { version: '1.0.0', releaseDate: '2025-12-08' },
    ],
  },
  {
    id: 'nginx-ingress',
    name: 'NGINX Ingress',
    description: 'NGINX Ingress controller with configurable TLS termination, annotations, and load balancing.',
    provider: 'helm',
    engine: 'helm',
    categories: ['networking'],
    versions: [
      { version: '1.2.1', releaseDate: '2026-04-02' },
      { version: '1.2.0', releaseDate: '2026-02-14' },
      { version: '1.1.0', releaseDate: '2025-11-28' },
    ],
  },
  {
    id: 'data-platform',
    name: 'Data Platform',
    description: 'Multi-service stack: S3 for storage, RDS PostgreSQL for your database, and a container to serve it.',
    provider: 'aws',
    engine: 'stack',
    categories: ['stack'],
    versions: [
      { version: '1.0.0', releaseDate: '2026-03-25' },
    ],
  },
]

// ─── Config ───────────────────────────────────────────────────────────────────

export const PROVIDER_CONFIG: Record<
  ProviderKey,
  { label: string; color: 'sky' | 'green' | 'yellow' | 'brand'; icon?: string }
> = {
  aws: { label: 'AWS', color: 'sky', icon: AWS },
  gcp: { label: 'GCP', color: 'green', icon: GCP },
  helm: { label: 'Helm', color: 'yellow', icon: HelmIcon },
  qovery: { label: 'Qovery', color: 'brand' },
}

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  database: 'Database',
  storage: 'Storage',
  cache: 'Cache',
  application: 'Application',
  networking: 'Networking',
  messaging: 'Messaging',
  stack: 'Stack',
}

export const ENGINE_LABELS: Record<EngineKey, string> = {
  terraform: 'Terraform',
  helm: 'Helm',
  stack: 'Stack',
}
