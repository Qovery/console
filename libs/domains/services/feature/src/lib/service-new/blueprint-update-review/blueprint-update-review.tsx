import { useEffect, useMemo, useState } from 'react'
import {
  Accordion,
  Badge,
  Button,
  CodeEditor,
  FunnelFlow,
  Heading,
  Icon,
  InputText,
  Navbar,
  Section,
  Skeleton,
  Tooltip,
} from '@qovery/shared/ui'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RequiredInput {
  id: string
  label: string
  helper?: string
  placeholder?: string
}

export interface ChangedField {
  id: string
  label: string
  category: string
  currentValue: string
  newDefault: string
  isUserOverride: boolean
}

export interface AddedField {
  id: string
  label: string
  category: string
  defaultValue: string
  helper?: string
}

export interface RemovedField {
  id: string
  label: string
  category: string
  currentValue?: string
  isDestructive: boolean
}

export interface BlueprintUpdateReviewProps {
  blueprintName: string
  targetVersion: string
  requiredInputs: RequiredInput[]
  changedFields: ChangedField[]
  addedFields: AddedField[]
  removedFields: RemovedField[]
  onBack: () => void
  onDeploy: () => void
}

// ─── Mock data (AWS S3 blueprint v2.0 → v2.1) ────────────────────────────────

export const MOCK_REQUIRED_INPUTS: RequiredInput[] = [
  {
    id: 'notification_topic_arn',
    label: 'SNS notification topic ARN',
    helper: 'ARN of the SNS topic to receive S3 event notifications.',
  },
]

export const MOCK_CHANGED_FIELDS: ChangedField[] = [
  {
    id: 'lifecycle_retention_days',
    label: 'Lifecycle retention (days)',
    category: 'Config',
    currentValue: '90',
    newDefault: '180',
    isUserOverride: false,
  },
  {
    id: 'encryption_algorithm',
    label: 'Encryption algorithm',
    category: 'Config',
    currentValue: 'AES256',
    newDefault: 'aws:kms',
    isUserOverride: true,
  },
]

const MOCK_OVERRIDE_VALUES: Record<string, string | null> = {
  encryption_algorithm: 'aws:kms:alias/acme-service-key',
}

export const MOCK_ADDED_FIELDS: AddedField[] = [
  {
    id: 'intelligent_tiering',
    label: 'Intelligent-Tiering storage class',
    category: 'Config',
    defaultValue: 'false',
    helper: 'Automatically moves objects between access tiers based on usage patterns.',
  },
  {
    id: 'access_log_bucket',
    label: 'Access log destination bucket',
    category: 'Config',
    defaultValue: 'acme-access-logs',
    helper: 'Leave empty to disable access logging.',
  },
  {
    id: 'cloudwatch_metrics',
    label: 'CloudWatch request metrics',
    category: 'Infrastructure',
    defaultValue: 'true',
    helper: 'Enables per-request metrics in CloudWatch.',
  },
]

export const MOCK_REMOVED_FIELDS: RemovedField[] = [
  {
    id: 'legacy_acl',
    label: 'ACL (legacy)',
    category: 'Config',
    currentValue: 'private',
    isDestructive: false,
  },
  {
    id: 'request_payer',
    label: 'Request Payer configuration',
    category: 'Infrastructure',
    currentValue: 'BucketOwner',
    isDestructive: true,
  },
]

type ReviewStepId = 'required' | 'optional' | 'modified' | 'removed'
type BlueprintFlowStep = 1 | 2
type PlanAction = 'replace' | 'destroy' | 'update' | 'create'
type PreviewSectionStatus = 'idle' | 'loading' | 'ready'

interface PlanDiffValue {
  key: string
  from?: string
  to: string
}

interface ParsedPlanResource {
  id: string
  action: PlanAction
  name: string
  rawBlock: string
  forcedReplacementValues: PlanDiffValue[]
  updatedValues: PlanDiffValue[]
  createdValues: PlanDiffValue[]
  removedValues: PlanDiffValue[]
  unchangedValues: string[]
}

interface ParsedPlanSummary {
  add: number
  change: number
  destroy: number
  replace: number
}

interface ParsedTerraformPlan {
  sections: Record<PlanAction, ParsedPlanResource[]>
  summary: ParsedPlanSummary
}

const REVIEW_STEPS: { id: ReviewStepId; title: string; iconName: string; description?: string }[] = [
  {
    id: 'required',
    title: 'New required values',
    iconName: 'circle-plus',
    description: 'These new fields have no default value. You need to fill them before deploying the update.',
  },
  {
    id: 'optional',
    title: 'New optional values',
    iconName: 'chart-bullet',
    description: 'These new fields include defaults, and you can override them if needed.',
  },
  {
    id: 'modified',
    title: 'Modified values',
    iconName: 'arrows-rotate',
    description: 'Default values have been updated. Your overrides are preserved until you reset them.',
  },
  {
    id: 'removed',
    title: 'Removed values',
    iconName: 'circle-minus',
  },
]

const REVIEW_CARD_CLASSNAME = 'rounded-[12px] border border-neutral bg-surface-neutral shadow-Cards'

const TERRAFORM_PLAN_RAW_OUTPUT = `# Resource actions:
#   + create
#   ~ update in-place
#   - destroy
#  -/+ destroy and then create replacement
#
# Terraform will perform the following actions:

  # aws_db_instance.postgres must be replaced
  -/+ resource "aws_db_instance" "postgres" {
      -/+ engine_version              = "16.3" -> "17.2"        # forces replacement
        ~  parameter_group_name       = "prod-pg16-params" -> (known after apply)
        ~  latest_restorable_time     = "2025-05-10T14:23:11Z" -> (known after apply)
        ~  resource_id                = "db-OLDID123" -> (known after apply)
           id                         = "prod-postgres-db"
           allocated_storage          = 100
           instance_class             = "db.t3.medium"
           multi_az                   = false
           storage_encrypted          = true
           deletion_protection        = true
      }

  # aws_elasticache_cluster.redis must be replaced
  -/+ resource "aws_elasticache_cluster" "redis" {
      -/+ engine_version              = "6.x" -> "7.0"          # forces replacement
        ~  configuration_endpoint     = "redis.old.cache.amazonaws.com" -> (known after apply)
        ~  cluster_address            = "redis.old.cache.amazonaws.com" -> (known after apply)
           id                         = "prod-redis"
           node_type                  = "cache.t3.micro"
           num_cache_nodes            = 1
           port                       = 6379
      }

  # aws_eks_node_group.workers must be replaced
  -/+ resource "aws_eks_node_group" "workers" {
      -/+ ami_type                    = "AL2_x86_64" -> "AL2023_x86_64"  # forces replacement
        ~  resources                  = (known after apply)
        ~  status                     = "ACTIVE" -> (known after apply)
           id                         = "prod-workers"
           instance_types             = ["t3.medium"]
           disk_size                  = 50
      }

  # aws_instance.bastion must be replaced
  -/+ resource "aws_instance" "bastion" {
      -/+ ami                         = "ami-0abc111old" -> "ami-0abc222new"  # forces replacement
        ~  public_ip                  = "54.23.11.9" -> (known after apply)
        ~  private_ip                 = "10.0.1.5" -> (known after apply)
        ~  id                         = "i-0oldinstance" -> (known after apply)
           instance_type              = "t3.micro"
           key_name                   = "prod-key"
      }

  # aws_db_subnet_group.legacy will be destroyed
  - resource "aws_db_subnet_group" "legacy" {
      -  id                           = "legacy-subnet-group" -> null
      -  name                         = "legacy-subnet-group" -> null
      -  description                  = "Subnet group for postgres 16" -> null
      -  subnet_ids                   = ["subnet-0a1b2c3d", "subnet-4e5f6a7b"] -> null
      }

  # aws_security_group.old_rds_sg will be destroyed
  - resource "aws_security_group" "old_rds_sg" {
      -  id                           = "sg-0abc123" -> null
      -  name                         = "old-rds-sg" -> null
      -  description                  = "Legacy RDS security group" -> null
      -  vpc_id                       = "vpc-0prod123" -> null
      }

  # aws_iam_role.deprecated_role will be destroyed
  - resource "aws_iam_role" "deprecated_role" {
      -  id                           = "rds-legacy-role" -> null
      -  name                         = "rds-legacy-role" -> null
      -  arn                          = "arn:aws:iam::123456789:role/rds-legacy-role" -> null
      }

  # aws_db_parameter_group.postgres will be updated in-place
  ~ resource "aws_db_parameter_group" "postgres" {
      ~  family                       = "postgres16" -> "postgres17"
      ~  description                  = "postgres16 parameter group" -> "postgres17 parameter group"
         id                           = "prod-postgres-params"
         name                         = "prod-postgres-params"
      }

  # aws_s3_bucket.backups will be updated in-place
  ~ resource "aws_s3_bucket" "backups" {
      ~  versioning_enabled           = false -> true
         id                           = "prod-backups-bucket"
         bucket                       = "prod-backups-bucket"
         region                       = "eu-west-1"
      }

  # aws_cloudwatch_alarm.cpu will be updated in-place
  ~ resource "aws_cloudwatch_alarm" "cpu" {
      ~  threshold                    = "80" -> "70"
         id                           = "prod-cpu-alarm"
         alarm_name                   = "prod-cpu-alarm"
         metric_name                  = "CPUUtilization"
      }

  # aws_iam_policy.rds_access will be updated in-place
  ~ resource "aws_iam_policy" "rds_access" {
      ~  policy                       = "...old policy document..." -> "...new policy document..."
         id                           = "arn:aws:iam::123456789:policy/rds-access"
         name                         = "rds-access"
      }

  # aws_db_snapshot.pre_upgrade will be created
  + resource "aws_db_snapshot" "pre_upgrade" {
      +  db_instance_identifier       = "prod-postgres-db"
      +  db_snapshot_identifier       = "pre-upgrade-snapshot-20250511"
      +  id                           = (known after apply)
      +  snapshot_type                = (known after apply)
      +  status                       = (known after apply)
      }

  # aws_db_subnet_group.new_pg17 will be created
  + resource "aws_db_subnet_group" "new_pg17" {
      +  id                           = (known after apply)
      +  name                         = "prod-postgres17-subnet"
      +  description                  = "Subnet group for postgres 17"
      +  subnet_ids                   = ["subnet-0a1b2c3d", "subnet-4e5f6a7b"]
      }

  # aws_cloudwatch_log_group.pg17 will be created
  + resource "aws_cloudwatch_log_group" "pg17" {
      +  id                           = (known after apply)
      +  name                         = "/aws/rds/postgres17"
      +  retention_in_days            = 30
      }

Plan: 3 to add, 4 to change, 3 to destroy, 4 to replace.`

const RESOURCE_NAME_OVERRIDES: Record<string, string> = {
  aws_db_instance: 'RDS instance',
  aws_elasticache_cluster: 'Elasticache cluster',
  aws_eks_node_group: 'EKS node group',
  aws_instance: 'EC2 instance',
  aws_db_subnet_group: 'Subnet group',
  aws_security_group: 'Security group',
  aws_iam_role: 'IAM Role',
  aws_db_parameter_group: 'Parameter group',
  aws_s3_bucket: 'S3 bucket',
  aws_cloudwatch_alarm: 'CloudWatch alarm',
  aws_iam_policy: 'IAM policy',
  aws_db_snapshot: 'DB snapshot',
  aws_cloudwatch_log_group: 'Log group',
}

function toResourceLabel(address: string): string {
  const [resourceType, resourceName] = address.split('.')

  if (resourceType && RESOURCE_NAME_OVERRIDES[resourceType]) {
    return RESOURCE_NAME_OVERRIDES[resourceType]
  }

  return resourceName ? resourceName.replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) : address
}

function extractActionFromDescriptor(descriptor: string): PlanAction | null {
  if (descriptor === 'must be replaced') return 'replace'
  if (descriptor === 'will be destroyed') return 'destroy'
  if (descriptor === 'will be updated in-place') return 'update'
  if (descriptor === 'will be created') return 'create'
  return null
}

function parseResourceBlock(action: PlanAction, address: string, lines: string[]): ParsedPlanResource {
  const forcedReplacementValues: PlanDiffValue[] = []
  const updatedValues: PlanDiffValue[] = []
  const createdValues: PlanDiffValue[] = []
  const removedValues: PlanDiffValue[] = []
  const unchangedValues: string[] = []

  lines.forEach((line) => {
    const transitionMatch = line.match(
      /^\s*[-+~/]+\s*([a-zA-Z0-9_]+)\s*=\s*(.+?)\s*->\s*(.+?)(?:\s+#\s*(forces replacement))?\s*$/
    )

    if (transitionMatch) {
      const [, key, from, to, replacementHint] = transitionMatch
      const parsedValue: PlanDiffValue = { key, from: from.trim(), to: to.trim() }

      if (action === 'destroy' && to.trim() === 'null') {
        removedValues.push(parsedValue)
      } else if (replacementHint || line.includes('forces replacement')) {
        forcedReplacementValues.push(parsedValue)
      } else {
        updatedValues.push(parsedValue)
      }

      return
    }

    const createdMatch = line.match(/^\s*\+\s*([a-zA-Z0-9_]+)\s*=\s*(.+?)\s*$/)
    if (action === 'create' && createdMatch) {
      const [, key, to] = createdMatch
      createdValues.push({ key, to: to.trim() })
      return
    }

    const unchangedMatch = line.match(/^\s{2,}([a-zA-Z0-9_]+)\s*=\s*(.+?)\s*$/)
    if (unchangedMatch) {
      unchangedValues.push(unchangedMatch[1])
    }
  })

  return {
    id: `${action}-${address}`,
    action,
    name: toResourceLabel(address),
    rawBlock: lines.join('\n'),
    forcedReplacementValues,
    updatedValues,
    createdValues,
    removedValues,
    unchangedValues,
  }
}

function parseTerraformPlan(rawPlan: string): ParsedTerraformPlan {
  const sections: Record<PlanAction, ParsedPlanResource[]> = {
    replace: [],
    destroy: [],
    update: [],
    create: [],
  }

  const summaryMatch = rawPlan.match(
    /Plan:\s*(\d+)\s+to add,\s*(\d+)\s+to change,\s*(\d+)\s+to destroy,\s*(\d+)\s+to replace\./
  )

  const summary: ParsedPlanSummary = {
    add: summaryMatch ? Number(summaryMatch[1]) : 0,
    change: summaryMatch ? Number(summaryMatch[2]) : 0,
    destroy: summaryMatch ? Number(summaryMatch[3]) : 0,
    replace: summaryMatch ? Number(summaryMatch[4]) : 0,
  }

  const lines = rawPlan.split('\n')
  let currentBlock: { address: string; action: PlanAction; lines: string[] } | null = null

  const flushCurrentBlock = () => {
    if (!currentBlock) return

    sections[currentBlock.action].push(
      parseResourceBlock(currentBlock.action, currentBlock.address, currentBlock.lines)
    )
    currentBlock = null
  }

  lines.forEach((line) => {
    const headerMatch = line.match(
      /^\s*#\s+([^\s]+)\s+(must be replaced|will be destroyed|will be updated in-place|will be created)\s*$/
    )

    if (headerMatch) {
      flushCurrentBlock()
      const [, address, descriptor] = headerMatch
      const action = extractActionFromDescriptor(descriptor)

      if (!action) return

      currentBlock = {
        address,
        action,
        lines: [],
      }

      return
    }

    if (currentBlock) {
      currentBlock.lines.push(line)

      if (/^\s*}\s*$/.test(line)) {
        flushCurrentBlock()
      }
    }
  })

  flushCurrentBlock()

  return { sections, summary }
}

function renderCodeToken(value: string) {
  return (
    <code className="inline-flex h-5 items-center rounded border border-neutral bg-surface-neutral-component px-1 font-mono text-xs text-neutral">
      {value}
    </code>
  )
}

function renderValueTransitionRows(values: PlanDiffValue[]) {
  return (
    <div className="rounded-md border border-neutral">
      {values.map((value, index) => (
        <div
          key={`${value.key}-${index}`}
          className={`flex items-center justify-between gap-2 p-3 ${index !== values.length - 1 ? 'border-b border-neutral' : ''}`}
        >
          <p className="text-ssm text-neutral">{value.key}</p>
          <div className="flex items-center gap-1">
            {value.from ? renderCodeToken(value.from) : null}
            {value.from ? (
              <Icon iconName="arrow-right" iconStyle="regular" className="text-xs text-neutral-subtle" />
            ) : null}
            {renderCodeToken(value.to)}
          </div>
        </div>
      ))}
    </div>
  )
}

function PlanActionSection({
  label,
  action,
  resources,
}: {
  label: string
  action: PlanAction
  resources: ParsedPlanResource[]
}) {
  const tooltipContent: Record<PlanAction, string> = {
    replace: 'Terraform destroys the current resource and recreates it when immutable attributes changed.',
    destroy: 'Terraform permanently removes these resources from your infrastructure.',
    update: 'Terraform applies in-place changes without recreating these resources.',
    create: 'Terraform provisions these new resources.',
  }

  return (
    <div>
      <div className="flex items-center gap-1 border-b border-neutral bg-surface-neutral-subtle px-4 py-3">
        <p className="text-sm font-medium text-neutral">{label}</p>
        <Tooltip content={tooltipContent[action]} side="top">
          <button type="button" aria-label={`${label} explanation`} className="inline-flex">
            <Icon iconName="circle-info" iconStyle="regular" className="text-xs text-neutral-subtle" />
          </button>
        </Tooltip>
      </div>

      {resources.length === 0 ? (
        <p className="border-b border-neutral px-4 py-3 text-sm text-neutral-subtle">No resources in this section.</p>
      ) : (
        <Accordion.Root type="single" collapsible>
          {resources.map((resource) => (
            <Accordion.Item key={resource.id} value={resource.id} className="mt-0 rounded-none border-b border-neutral">
              <Accordion.Trigger chevronPosition="right" className="min-h-0 cursor-pointer px-4 py-3">
                <span className="truncate text-sm text-neutral">{resource.name}</span>
              </Accordion.Trigger>
              <Accordion.Content className="bg-surface-neutral px-4 pb-4">
                <div className="flex flex-col gap-4">
                  {resource.forcedReplacementValues.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-neutral-subtle">Forces replacement</p>
                      {renderValueTransitionRows(resource.forcedReplacementValues)}
                    </div>
                  )}

                  {resource.updatedValues.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-neutral-subtle">Updated values</p>
                      {renderValueTransitionRows(resource.updatedValues)}
                    </div>
                  )}

                  {resource.createdValues.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-neutral-subtle">Created values</p>
                      {renderValueTransitionRows(resource.createdValues)}
                    </div>
                  )}

                  {resource.removedValues.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-neutral-subtle">Removed values</p>
                      {renderValueTransitionRows(resource.removedValues)}
                    </div>
                  )}

                  {resource.unchangedValues.length > 0 && action !== 'destroy' && action !== 'create' && (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-neutral-subtle">Unchanged</p>
                      <div className="flex flex-wrap gap-1">
                        {resource.unchangedValues.map((value) => (
                          <code
                            key={`${resource.id}-unchanged-${value}`}
                            className="inline-flex h-5 items-center rounded border border-neutral bg-surface-neutral-component px-1 font-mono text-xs text-neutral"
                          >
                            {value}
                          </code>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      )}
    </div>
  )
}

function PlanImpactSummary({ parsedPlan }: { parsedPlan: ParsedTerraformPlan }) {
  const impactLabel = parsedPlan.summary.replace + parsedPlan.summary.destroy >= 5 ? 'High impact' : 'Medium impact'

  return (
    <div className="rounded-lg border border-neutral bg-surface-neutral p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Icon iconName="sparkles" iconStyle="regular" className="text-xs text-neutral" />
          <p className="text-sm font-medium text-neutral">Estimated deployment impact</p>
        </div>
        <Badge size="base" color="red" variant="surface" className="font-medium">
          <Icon iconName="circle-exclamation" iconStyle="regular" className="mr-1 text-xs" />
          {impactLabel}
        </Badge>
      </div>
      <div className="mt-2 flex flex-col gap-2">
        <p className="text-sm text-neutral">
          Upgrading {renderCodeToken('engine_version')} from "16.3" to "17.2" forces a full recreation on AWS.
          <br />
          Your database and Redis cache will each be unavailable for approximately 5 to 15 minutes. Any application
          connected to them may return errors during that window.
        </p>
        <p className="text-sm text-neutral">
          Before confirming, verify your database endpoint is not hardcoded and that any read replicas are ready to be
          re-established.
        </p>
        <p className="text-sm text-neutral">
          For the rest, {parsedPlan.summary.destroy} legacy resources will be permanently deleted and{' '}
          {parsedPlan.summary.change} configuration resources update in place. The remaining changes are additive and
          non-disruptive.
        </p>
      </div>
    </div>
  )
}

function PlanImpactSummarySkeleton() {
  return (
    <div className="rounded-lg border border-neutral bg-surface-neutral p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Icon iconName="circle-info" iconStyle="regular" className="text-xs text-neutral" />
          <p className="text-sm font-medium text-neutral">Estimated deployment impact</p>
        </div>
        <Skeleton height={24} width={96} className="rounded-md" />
      </div>
      <div className="mt-2 flex flex-col gap-2">
        <Skeleton height={20} className="w-full" />
        <Skeleton height={20} className="w-[92%]" />
        <Skeleton height={20} className="w-[95%]" />
        <Skeleton height={20} className="w-[88%]" />
        <Skeleton height={20} className="w-[84%]" />
      </div>
    </div>
  )
}

function InfrastructureDiffSkeleton() {
  const sectionLabels = ['Replace', 'Destroy', 'Update', 'Create']

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      {sectionLabels.map((label) => (
        <div key={label}>
          <div className="flex items-center gap-1 border-b border-neutral bg-surface-neutral-subtle px-4 py-3">
            <p className="text-sm font-medium text-neutral">{label}</p>
            <Icon iconName="circle-info" iconStyle="regular" className="text-xs text-neutral-subtle" />
          </div>
          <div className="border-b border-neutral px-4 py-3">
            <Skeleton height={20} className="w-[40%]" />
          </div>
          <div className="border-b border-neutral px-4 py-3">
            <Skeleton height={20} className="w-[52%]" />
          </div>
        </div>
      ))}
    </div>
  )
}

function RawOutputSkeleton() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
      <div className="flex flex-col gap-2">
        {Array.from({ length: 18 }).map((_, index) => (
          <Skeleton key={`raw-output-skeleton-${index}`} height={16} className={index % 3 === 0 ? 'w-[95%]' : 'w-full'} />
        ))}
      </div>
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export function BlueprintUpdateReview({
  blueprintName,
  targetVersion,
  requiredInputs,
  changedFields,
  addedFields,
  removedFields,
  onBack,
  onDeploy,
}: BlueprintUpdateReviewProps) {
  const [flowStep, setFlowStep] = useState<BlueprintFlowStep>(1)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [inputValues, setInputValues] = useState<Record<string, string>>({})
  const [additionValues, setAdditionValues] = useState<Record<string, string>>(
    Object.fromEntries(addedFields.map((field) => [field.id, field.defaultValue]))
  )
  const [defaultValues] = useState<Record<string, string>>(
    Object.fromEntries(changedFields.map((field) => [field.id, field.newDefault]))
  )
  const [overrideValues, setOverrideValues] = useState<Record<string, string | null>>(
    Object.fromEntries(
      changedFields.map((field) => [
        field.id,
        field.isUserOverride ? MOCK_OVERRIDE_VALUES[field.id] ?? field.currentValue : null,
      ])
    )
  )
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null)
  const [previewTab, setPreviewTab] = useState<'infrastructure-diff' | 'raw-output'>('infrastructure-diff')
  const [previewLoadAttempt, setPreviewLoadAttempt] = useState(0)
  const [summaryStatus, setSummaryStatus] = useState<PreviewSectionStatus>('idle')
  const [diffStatus, setDiffStatus] = useState<PreviewSectionStatus>('idle')
  const [rawStatus, setRawStatus] = useState<PreviewSectionStatus>('idle')
  const [showSlowPreviewNotice, setShowSlowPreviewNotice] = useState(false)

  const parsedTerraformPlan = useMemo(() => parseTerraformPlan(TERRAFORM_PLAN_RAW_OUTPUT), [])

  const currentReviewStep = REVIEW_STEPS[currentStepIndex]
  const completedStepIds = new Set(REVIEW_STEPS.slice(0, currentStepIndex).map((step) => step.id))

  const isRequiredStepComplete = requiredInputs.every((field) => Boolean(inputValues[field.id]?.trim()))
  const canOpenPreview = currentReviewStep.id === 'removed' && isRequiredStepComplete
  const isPreviewLoading = [summaryStatus, diffStatus, rawStatus].some((status) => status === 'loading')
  const isPreviewReady = [summaryStatus, diffStatus, rawStatus].every((status) => status === 'ready')

  useEffect(() => {
    if (flowStep !== 2) return

    setSummaryStatus('loading')
    setDiffStatus('loading')
    setRawStatus('loading')
    setShowSlowPreviewNotice(false)

    const summaryTimer = window.setTimeout(() => setSummaryStatus('ready'), 900)
    const diffTimer = window.setTimeout(() => setDiffStatus('ready'), 1800)
    const rawTimer = window.setTimeout(() => {
      setRawStatus('ready')
      setShowSlowPreviewNotice(false)
    }, 2600)
    const slowNoticeTimer = window.setTimeout(() => setShowSlowPreviewNotice(true), 8000)

    return () => {
      window.clearTimeout(summaryTimer)
      window.clearTimeout(diffTimer)
      window.clearTimeout(rawTimer)
      window.clearTimeout(slowNoticeTimer)
    }
  }, [flowStep, previewLoadAttempt])

  const continueToNextReviewStep = () => {
    setCurrentStepIndex((previous) => Math.min(previous + 1, REVIEW_STEPS.length - 1))
  }

  const renderCollapsedStepCard = (step: (typeof REVIEW_STEPS)[number], isCompleted: boolean, isCurrent: boolean) => {
    const titleClassName = isCurrent || isCompleted ? 'text-neutral' : 'text-neutral-subtle'

    return (
      <div key={step.id} className={REVIEW_CARD_CLASSNAME}>
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="flex min-w-0 items-center gap-2">
            <Icon iconName={step.iconName} iconStyle="regular" className="text-sm text-neutral-subtle" />
            <p className={`truncate text-base font-medium ${titleClassName}`}>{step.title}</p>
          </div>
          {isCompleted ? <Icon iconName="circle-check" iconStyle="regular" className="text-sm text-positive" /> : null}
        </div>
      </div>
    )
  }

  const renderContinueButton = (disabled = false) => (
    <div>
      <Button
        type="button"
        size="md"
        color="neutral"
        variant="solid"
        radius="rounded"
        disabled={disabled}
        onClick={continueToNextReviewStep}
      >
        <span className="inline-flex items-center gap-2">
          Continue
          <Icon iconName="arrow-right" iconStyle="regular" className="text-sm" />
        </span>
      </Button>
    </div>
  )

  const renderStepContent = () => {
    if (currentReviewStep.id === 'required') {
      return (
        <>
          <div className="flex flex-col gap-3">
            {requiredInputs.length > 0 ? (
              requiredInputs.map((field) => (
                <InputText
                  key={field.id}
                  name={field.id}
                  label={field.label}
                  hint={field.helper}
                  value={inputValues[field.id] ?? ''}
                  onChange={(event) => setInputValues((previous) => ({ ...previous, [field.id]: event.target.value }))}
                />
              ))
            ) : (
              <p className="text-sm text-neutral-subtle">No new required values were introduced in this update.</p>
            )}
          </div>
          {renderContinueButton(!isRequiredStepComplete)}
        </>
      )
    }

    if (currentReviewStep.id === 'optional') {
      return (
        <>
          <div className="flex flex-col gap-3">
            {addedFields.length > 0 ? (
              addedFields.map((field) => (
                <InputText
                  key={field.id}
                  name={field.id}
                  label={field.label}
                  hint={field.helper}
                  value={additionValues[field.id] ?? ''}
                  onChange={(event) =>
                    setAdditionValues((previous) => ({ ...previous, [field.id]: event.target.value }))
                  }
                />
              ))
            ) : (
              <p className="text-sm text-neutral-subtle">No new optional values were introduced in this update.</p>
            )}
          </div>
          {renderContinueButton()}
        </>
      )
    }

    if (currentReviewStep.id === 'modified') {
      return (
        <>
          <div className="rounded-md border border-neutral bg-surface-neutral-subtle">
            {changedFields.length > 0 ? (
              changedFields.map((field, index) => {
                const hasOverride = Boolean(overrideValues[field.id])
                const isEditing = editingFieldId === field.id

                return (
                  <div
                    key={field.id}
                    className={`flex justify-between gap-3 p-3 ${isEditing ? 'items-start' : 'items-center'} ${index !== changedFields.length - 1 ? 'border-b border-neutral' : ''}`}
                  >
                    {isEditing ? (
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <div className="min-w-0 flex-1">
                          <InputText
                            name={`${field.id}-override`}
                            label={field.label}
                            value={overrideValues[field.id] ?? defaultValues[field.id] ?? ''}
                            onChange={(event) =>
                              setOverrideValues((previous) => ({
                                ...previous,
                                [field.id]: event.target.value || null,
                              }))
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          color="neutral"
                          size="lg"
                          iconOnly
                          className="h-12 w-12"
                          aria-label={`Save ${field.label}`}
                          onClick={() => setEditingFieldId(null)}
                        >
                          <Icon iconName="floppy-disk" iconStyle="regular" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="min-w-0 flex-1">
                          <p className="text-ssm text-neutral">{field.label}</p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-ssm text-neutral-subtle">
                            <div className="flex items-center gap-1.5">
                              <span>Default:</span>
                              <code className="rounded bg-surface-neutral-component px-1.5 py-0.5 font-mono text-2xs text-neutral">
                                {field.currentValue}
                              </code>
                              <Icon iconName="arrow-right" iconStyle="regular" className="text-xs" />
                              <code className="rounded bg-surface-neutral-component px-1.5 py-0.5 font-mono text-2xs text-neutral">
                                {defaultValues[field.id]}
                              </code>
                            </div>
                            {hasOverride ? (
                              <div className="flex items-center gap-1.5">
                                <span>Override:</span>
                                <code className="rounded border border-info-subtle bg-surface-info-component px-1.5 py-0.5 font-mono text-2xs text-info">
                                  {overrideValues[field.id]}
                                </code>
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          {hasOverride ? (
                            <Button
                              type="button"
                              variant="outline"
                              color="neutral"
                              size="xs"
                              iconOnly
                              aria-label={`Reset ${field.label} override`}
                              onClick={() => setOverrideValues((previous) => ({ ...previous, [field.id]: null }))}
                            >
                              <Icon iconName="rotate-left" iconStyle="regular" className="text-xs" />
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            variant="outline"
                            color="neutral"
                            size="xs"
                            iconOnly
                            aria-label={`Edit ${field.label}`}
                            onClick={() => setEditingFieldId(field.id)}
                          >
                            <Icon iconName="pen" iconStyle="regular" className="text-xs" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )
              })
            ) : (
              <p className="p-3 text-sm text-neutral-subtle">No default values were modified in this update.</p>
            )}
          </div>
          {renderContinueButton()}
        </>
      )
    }

    return (
      <div className="rounded-md border border-neutral bg-surface-neutral-subtle">
        {removedFields.length > 0 ? (
          removedFields.map((field, index) => (
            <div
              key={field.id}
              className={`flex items-center justify-between gap-3 p-3 ${index !== removedFields.length - 1 ? 'border-b border-neutral' : ''}`}
            >
              <p className="text-sm text-neutral">{field.label}</p>
              {field.currentValue ? (
                <div className="flex items-center gap-1.5 text-sm text-neutral-subtle">
                  <span>Default:</span>
                  <code className="rounded bg-surface-neutral-component px-1.5 py-0.5 font-mono text-2xs text-neutral">
                    {field.currentValue}
                  </code>
                  <Icon iconName="arrow-right" iconStyle="regular" className="text-xs" />
                  <Badge size="sm" color="red" variant="surface">
                    Deleted
                  </Badge>
                </div>
              ) : (
                <Badge size="sm" color="red" variant="surface">
                  Deleted
                </Badge>
              )}
            </div>
          ))
        ) : (
          <p className="p-3 text-sm text-neutral-subtle">No values were removed in this version.</p>
        )}
      </div>
    )
  }

  const renderReviewStep = () => (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-[620px] flex-col text-sm">
      <Section className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-6">
        <div className="flex flex-col gap-6 pb-6">
          <div className="flex flex-col gap-2">
            <Heading className="text-2xl">
              {blueprintName} blueprint update to {targetVersion}
            </Heading>
            <p className="text-base text-neutral-subtle">
              Review these changes before previewing the Terraform execution plan.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {REVIEW_STEPS.map((step, index) => {
              if (index !== currentStepIndex) {
                return renderCollapsedStepCard(step, completedStepIds.has(step.id), false)
              }

              return (
                <div key={step.id} className={REVIEW_CARD_CLASSNAME}>
                  <div className="flex items-center gap-2 p-4">
                    <Icon iconName={step.iconName} iconStyle="regular" className="text-sm text-neutral-subtle" />
                    <p className="text-base font-medium text-neutral">{step.title}</p>
                  </div>

                  <div className="flex flex-col gap-4 px-4 pb-4">
                    {step.description ? <p className="text-sm text-neutral-subtle">{step.description}</p> : null}
                    {renderStepContent()}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Section>
      <div className="shrink-0 border-t border-neutral pb-6 pt-4">
        <Button
          size="lg"
          color="brand"
          variant="solid"
          radius="rounded"
          disabled={!canOpenPreview}
          onClick={() => setFlowStep(2)}
          className="w-full justify-center"
        >
          Preview changes
          <Icon iconName="arrow-right" iconStyle="regular" className="ml-1.5" />
        </Button>
      </div>
    </div>
  )

  const renderPreviewStep = () => (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-[620px] flex-col text-sm">
      <Section className="min-h-0 flex-1 overflow-hidden py-6">
        <div className="flex h-full min-h-0 flex-col gap-4 pb-6">
          <div className="flex flex-col gap-1">
            <Heading className="text-2xl">Preview changes</Heading>
            {isPreviewLoading ? (
              <p className="text-sm text-neutral-subtle">
                {showSlowPreviewNotice
                  ? 'Still computing impact analysis. This can take up to 30 seconds for large plans.'
                  : 'Analyzing Terraform plan...'}
              </p>
            ) : null}
          </div>

          {summaryStatus === 'ready' ? (
            <PlanImpactSummary parsedPlan={parsedTerraformPlan} />
          ) : (
            <PlanImpactSummarySkeleton />
          )}

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-neutral bg-surface-neutral shadow-Cards">
            <div className="border-b border-neutral">
              <Navbar.Root activeId={previewTab} className="ml-3">
                <Navbar.Item
                  id="infrastructure-diff"
                  href="#"
                  onClick={(event) => {
                    event.preventDefault()
                    setPreviewTab('infrastructure-diff')
                  }}
                >
                  <Icon iconName="file-plus-minus" iconStyle="regular" />
                  Infrastructure diff
                </Navbar.Item>
                <Navbar.Item
                  id="raw-output"
                  href="#"
                  onClick={(event) => {
                    event.preventDefault()
                    setPreviewTab('raw-output')
                  }}
                >
                  <Icon iconName="code" iconStyle="regular" />
                  Raw output
                </Navbar.Item>
              </Navbar.Root>
            </div>

            {previewTab === 'infrastructure-diff' ? (
              diffStatus === 'ready' ? (
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <PlanActionSection label="Replace" action="replace" resources={parsedTerraformPlan.sections.replace} />
                  <PlanActionSection label="Destroy" action="destroy" resources={parsedTerraformPlan.sections.destroy} />
                  <PlanActionSection label="Update" action="update" resources={parsedTerraformPlan.sections.update} />
                  <PlanActionSection label="Create" action="create" resources={parsedTerraformPlan.sections.create} />
                </div>
              ) : (
                <InfrastructureDiffSkeleton />
              )
            ) : (
              rawStatus === 'ready' ? (
                <div className="min-h-0 flex-1">
                  <CodeEditor
                    value={TERRAFORM_PLAN_RAW_OUTPUT}
                    readOnly
                    language="hcl"
                    height="100%"
                    options={{
                      wordWrap: 'on',
                      scrollBeyondLastLine: false,
                      lineNumbersMinChars: 3,
                    }}
                  />
                </div>
              ) : (
                <RawOutputSkeleton />
              )
            )}
          </div>
        </div>
      </Section>
      <div className="flex shrink-0 items-center gap-3 border-t border-neutral pb-6 pt-4">
        <Button size="lg" color="neutral" variant="outline" radius="rounded" onClick={() => setFlowStep(1)}>
          Back
        </Button>
        {isPreviewLoading ? (
          <Button
            size="lg"
            color="neutral"
            variant="outline"
            radius="rounded"
            onClick={() => setPreviewLoadAttempt((previous) => previous + 1)}
          >
            Retry analysis
          </Button>
        ) : null}
        <Button
          size="lg"
          color="brand"
          variant="solid"
          radius="rounded"
          onClick={onDeploy}
          disabled={!isPreviewReady}
          className="flex-1 justify-center"
        >
          Confirm & deploy update
          <Icon iconName="arrow-right" iconStyle="regular" className="ml-1.5" />
        </Button>
      </div>
    </div>
  )

  return (
    <FunnelFlow
      onExit={onBack}
      totalSteps={2}
      currentStep={flowStep}
      currentTitle={flowStep === 1 ? 'Review update' : 'Preview changes'}
    >
      {flowStep === 1 ? renderReviewStep() : renderPreviewStep()}
    </FunnelFlow>
  )
}

export default BlueprintUpdateReview
