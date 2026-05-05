import AWS from 'devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg'
import GCP from 'devicon/icons/googlecloud/googlecloud-original.svg'
import HelmIcon from 'devicon/icons/helm/helm-original.svg'

// ─── Types ───────────────────────────────────────────────────────────────────

export type ProviderKey = 'aws' | 'gcp' | 'helm' | 'qovery'
export type EngineKey = 'terraform' | 'helm' | 'stack'
export type CategoryKey = 'database' | 'storage' | 'cache' | 'application' | 'networking' | 'messaging' | 'stack'
export type ServiceKindKey = 'single' | 'tack'
export const SERVICE_KIND_LABELS: Record<ServiceKindKey, string> = {
  single: 'Single',
  tack: 'Tack',
}

export interface BlueprintVersion {
  version: string
  releaseDate: string // ISO date — yyyy-mm-dd
}

export interface BlueprintEntry {
  id: string
  name: string
  description: string
  serviceKind: ServiceKindKey
  provider: ProviderKey
  engine: EngineKey
  categories: CategoryKey[]
  supportedServiceVersions?: string[]
  documentationUrl?: string
  repositoryUrl?: string
  repositorySlug?: string
  readme?: string
  versions: BlueprintVersion[] // latest first
  isNew?: boolean
  /** Sourced from a private catalog (e.g. an org-internal Git repo) rather than the public catalog. */
  isPrivate?: boolean
}

// ─── Mock catalog (replaced by API once wired) ───────────────────────────────

export const MOCK_BLUEPRINTS: BlueprintEntry[] = [
  {
    id: 'aws-s3',
    name: 'AWS S3 Bucket',
    description: 'Object storage with server-side encryption, versioning, and configurable lifecycle policies.',
    serviceKind: 'single',
    provider: 'aws',
    engine: 'terraform',
    categories: ['storage'],
    documentationUrl: 'https://docs.aws.amazon.com/s3/',
    repositoryUrl: 'https://github.com/Qovery/qovery-service-catalog',
    repositorySlug: 'qovery-blueprints/s3',
    readme: `# AWS S3 Bucket — Blueprint v1

Provisions a private, secure Amazon S3 bucket on your AWS account. Versioning and server-side encryption are enabled by default. Public access is fully blocked. All resources are tagged and managed by Terraform through Qovery.

---

## What this blueprint creates

\`\`\`
aws_s3_bucket                           → the bucket itself
aws_s3_bucket_versioning                → object version history
aws_s3_bucket_server_side_encryption    → AES-256 encryption at rest (optional)
aws_s3_bucket_public_access_block       → blocks all public access (always on)
\`\`\`

### Architecture

\`\`\`
┌─────────────────────────────────────────────────────┐
│  Terraform — managed by Qovery                      │
│                                                     │
│   ┌─────────────┐         ┌──────────────────────┐  │
│   │ Versioning  │──┐      │   aws_s3_bucket      │  │
│   └─────────────┘  │      │                      │──────► bucket_arn
│                    ├─────►│  name · tags · region│──────► bucket_name
│   ┌─────────────┐  │      │                      │──────► bucket_region
│   │ Encryption  │──┘      └──────────┬───────────┘  │
│   │  (AES-256)  │                    │               │
│   └─────────────┘         ┌──────────▼───────────┐  │
│                           │  Public access block  │  │
│                           │  (all 4 rules on)     │  │
│                           └──────────────────────┘  │
└─────────────────────────────────────────────────────┘
\`\`\`

---

## Parameters

| Name | Type | Default | Required | Description |
|---|---|---|---|---|
| \`bucket_name\` | string | — | Yes | S3 bucket name. Must be globally unique across all AWS accounts. |
| \`versioning\` | bool | \`true\` | No | Keeps a full version history of every object. Enables rollback and recovery. |
| \`encryption\` | bool | \`true\` | No | Enables server-side encryption at rest using AES-256. |
| \`force_destroy\` | bool | \`false\` | No | When \`true\`, allows the bucket to be deleted even if it contains objects. **Use with caution in production.** |

> \`region\` and \`qovery_cluster_name\` are injected automatically from your cluster context — you don't need to set them.

---

## Outputs

| Name | Description |
|---|---|
| \`bucket_arn\` | Full ARN of the bucket (e.g. \`arn:aws:s3:::my-bucket\`) |
| \`bucket_name\` | Bucket name as provisioned |
| \`bucket_region\` | AWS region where the bucket was created |

These outputs are available as environment variables in any service running in the same environment.

---

## Security defaults

This blueprint is secure by default:

- **Public access is always blocked.** All four AWS public access block rules are enforced and cannot be disabled through this blueprint.
- **Encryption is on by default.** AES-256 server-side encryption is applied automatically unless explicitly disabled.
- **Versioning is on by default.** Object versions are retained, allowing recovery from accidental deletes or overwrites.

---

## Naming constraints

S3 bucket names must be **globally unique** across all AWS accounts and regions. The name must:
- Be between 3 and 63 characters
- Contain only lowercase letters, numbers, and hyphens
- Start and end with a letter or number
- Not be formatted as an IP address (e.g. \`192.168.1.1\`)

---

## Usage notes

- To delete a bucket that contains objects, set \`force_destroy = true\` before destroying the service. If left to \`false\` (the default), deletion will fail if the bucket is not empty.
- If you need the bucket to be accessible from another AWS account or service, you will need to attach a bucket policy manually — cross-account access is out of scope for this blueprint version.
- Major version \`1\` of this blueprint targets a standard general-purpose S3 bucket. Features such as replication, lifecycle rules, and static website hosting are not included and are planned for future blueprint versions.`,
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
    serviceKind: 'single',
    provider: 'aws',
    engine: 'terraform',
    categories: ['database'],
    supportedServiceVersions: ['Postgres 17', 'Postgres 16', 'Postgres 15'],
    documentationUrl: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html',
    repositoryUrl: 'https://github.com/Qovery/qovery-service-catalog',
    repositorySlug: 'qovery-blueprints/aws-postgres',
    readme: `## What will be created
- 1 RDS PostgreSQL instance
- Parameter group and subnet group
- Security group rules

## Configuration
- Database name and admin user
- Instance class
- Storage size`,
    versions: [
      { version: '1.0.0', releaseDate: '2026-04-22' },
    ],
    isNew: true,
  },
  {
    id: 'helm-redis',
    name: 'Redis',
    description: 'In-memory key-value store deployed via the Bitnami Helm chart with configurable replicas.',
    serviceKind: 'single',
    provider: 'helm',
    engine: 'helm',
    categories: ['cache'],
    documentationUrl: 'https://artifacthub.io/packages/helm/bitnami/redis',
    repositoryUrl: 'https://github.com/Qovery/qovery-service-catalog',
    repositorySlug: 'qovery-blueprints/helm-redis',
    readme: `## What will be created
- Redis release deployed with Helm
- Service and optional persistent volume

## Configuration
- Replica count
- Persistence size`,
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
    serviceKind: 'single',
    provider: 'qovery',
    engine: 'terraform',
    categories: ['application'],
    documentationUrl: 'https://hub.qovery.com/docs/using-qovery/configuration/application/',
    repositoryUrl: 'https://github.com/Qovery/qovery-service-catalog',
    repositorySlug: 'qovery-blueprints/qovery-container',
    readme: `## What will be created
- 1 container service with networking and runtime settings

## Configuration
- Container image
- Exposed port`,
    versions: [
      { version: '1.0.0', releaseDate: '2025-10-01' },
    ],
  },
  {
    id: 'aws-elasticache',
    name: 'AWS ElastiCache Redis',
    description: 'Fully managed Redis on ElastiCache with replication groups and automatic failover.',
    serviceKind: 'single',
    provider: 'aws',
    engine: 'terraform',
    categories: ['cache'],
    documentationUrl: 'https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.html',
    repositoryUrl: 'https://github.com/Qovery/qovery-service-catalog',
    repositorySlug: 'qovery-blueprints/aws-elasticache',
    readme: `## What will be created
- ElastiCache replication group
- Subnet and security group attachments

## Configuration
- Node type
- Number of replicas`,
    versions: [
      { version: '1.0.0', releaseDate: '2026-04-10' },
    ],
    isNew: true,
  },
  {
    id: 'aws-sqs',
    name: 'AWS SQS Queue',
    description: 'Managed message queue with FIFO and standard queue support, dead-letter queue included.',
    serviceKind: 'single',
    provider: 'aws',
    engine: 'terraform',
    categories: ['messaging'],
    documentationUrl: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html',
    repositoryUrl: 'https://github.com/Qovery/qovery-service-catalog',
    repositorySlug: 'qovery-blueprints/aws-sqs',
    readme: `## What will be created
- Primary SQS queue
- Dead-letter queue with redrive policy

## Configuration
- Queue name
- Queue type`,
    versions: [
      { version: '1.1.0', releaseDate: '2026-03-12' },
      { version: '1.0.0', releaseDate: '2025-09-22' },
    ],
  },
  {
    id: 'gcp-cloud-sql',
    name: 'GCP Cloud SQL',
    description: 'Managed PostgreSQL on Google Cloud SQL with private IP, high availability, and backups.',
    serviceKind: 'single',
    provider: 'gcp',
    engine: 'terraform',
    categories: ['database'],
    supportedServiceVersions: ['Postgres 17', 'Postgres 16'],
    documentationUrl: 'https://cloud.google.com/sql/docs/postgres',
    repositoryUrl: 'https://github.com/Qovery/qovery-service-catalog',
    repositorySlug: 'qovery-blueprints/gcp-cloud-sql',
    readme: `## What will be created
- 1 Cloud SQL PostgreSQL instance
- Networking and backup settings

## Configuration
- Database name
- Instance tier`,
    versions: [
      { version: '1.0.0', releaseDate: '2025-12-08' },
    ],
  },
  {
    id: 'nginx-ingress',
    name: 'NGINX Ingress',
    description: 'NGINX Ingress controller with configurable TLS termination, annotations, and load balancing.',
    serviceKind: 'single',
    provider: 'helm',
    engine: 'helm',
    categories: ['networking'],
    documentationUrl: 'https://artifacthub.io/packages/helm/ingress-nginx/ingress-nginx',
    repositoryUrl: 'https://github.com/Qovery/qovery-service-catalog',
    repositorySlug: 'qovery-blueprints/nginx-ingress',
    readme: `## What will be created
- NGINX ingress controller release
- Service and load balancer resources

## Configuration
- Replica count
- TLS enablement`,
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
    serviceKind: 'tack',
    provider: 'aws',
    engine: 'stack',
    categories: ['stack'],
    documentationUrl: 'https://hub.qovery.com/docs/using-qovery/configuration/service-catalog/',
    repositoryUrl: 'https://github.com/Qovery/qovery-service-catalog',
    repositorySlug: 'qovery-blueprints/data-platform',
    readme: `## What will be created
- 1 S3 bucket
- 1 RDS PostgreSQL instance
- 1 application service wired to both

## Configuration
- Bucket and database names
- API image`,
    versions: [
      { version: '1.0.0', releaseDate: '2026-03-25' },
    ],
    isPrivate: true,
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
