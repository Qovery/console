import { Navigate, createFileRoute, useParams } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { isFakeArgoCdService } from '@qovery/domains/environments/feature'
import { type TerraformResource } from '@qovery/domains/service-terraform/data-access'
import { ResourceTreeList } from '@qovery/domains/service-terraform/feature'
import { CodeEditor, Heading, InputSearch, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/manifest'
)({
  component: RouteComponent,
})

interface ManifestResource extends TerraformResource {
  manifest: string
}

const MOCK_EXTRACTED_AT = '2026-03-24T12:00:00.000Z'

const APPLICATION_MANIFEST = `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: mail-tools
  namespace: argocd
  labels:
    app.kubernetes.io/name: mail-tools
spec:
  project: default
  source:
    repoURL: https://github.com/acme/platform.git
    targetRevision: main
    path: apps/mail-tools
  destination:
    namespace: kube-system
    server: https://kubernetes.default.svc`

function createFakeResource({
  id,
  displayName,
  name,
  manifest,
}: {
  id: string
  displayName: string
  name: string
  manifest: string
}): ManifestResource {
  return {
    id,
    displayName,
    name,
    manifest,
    resourceType: id,
    address: `${displayName.toLowerCase().replace(/\s+/g, '_')}.${name.toLowerCase().replace(/\s+/g, '_')}`,
    provider: 'kubernetes',
    mode: 'managed',
    extractedAt: MOCK_EXTRACTED_AT,
    attributes: {},
  }
}

const MANIFEST_RESOURCES: ManifestResource[] = [
  createFakeResource({
    id: 'workloads',
    displayName: 'Workloads',
    name: 'Deployments',
    manifest: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: mail-tools
  namespace: kube-system`,
  }),
  createFakeResource({
    id: 'workloads',
    displayName: 'Workloads',
    name: 'StatefulSets',
    manifest: `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis
  namespace: kube-system`,
  }),
  createFakeResource({
    id: 'workloads',
    displayName: 'Workloads',
    name: 'Jobs',
    manifest: `apiVersion: batch/v1
kind: Job
metadata:
  name: db-backup
  namespace: kube-system`,
  }),
  createFakeResource({
    id: 'workloads',
    displayName: 'Workloads',
    name: 'CronJobs',
    manifest: `apiVersion: batch/v1
kind: CronJob
metadata:
  name: cleanup
  namespace: kube-system`,
  }),
  createFakeResource({
    id: 'workloads',
    displayName: 'Workloads',
    name: 'Application',
    manifest: APPLICATION_MANIFEST,
  }),
  createFakeResource({
    id: 'ingresses',
    displayName: 'Ingresses',
    name: 'mail-tools-ingress',
    manifest: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mail-tools-ingress
  namespace: kube-system`,
  }),
  createFakeResource({
    id: 'cloud-resources',
    displayName: 'Cloud resources',
    name: 'aws-load-balancer',
    manifest: `apiVersion: elbv2.k8s.aws/v1beta1
kind: TargetGroupBinding
metadata:
  name: mail-tools-tgb
  namespace: kube-system`,
  }),
  createFakeResource({
    id: 'secrets',
    displayName: 'Secrets',
    name: 'mail-tools-secrets',
    manifest: `apiVersion: v1
kind: Secret
metadata:
  name: mail-tools-secrets
  namespace: kube-system`,
  }),
  createFakeResource({
    id: 'config-maps',
    displayName: 'ConfigMaps',
    name: 'mail-tools-config',
    manifest: `apiVersion: v1
kind: ConfigMap
metadata:
  name: mail-tools-config
  namespace: kube-system`,
  }),
  createFakeResource({
    id: 'persistent-volume-claims',
    displayName: 'PersistentVolumeClaims',
    name: 'mail-tools-data',
    manifest: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mail-tools-data
  namespace: kube-system`,
  }),
  createFakeResource({
    id: 'service-accounts',
    displayName: 'ServiceAccounts',
    name: 'mail-tools-sa',
    manifest: `apiVersion: v1
kind: ServiceAccount
metadata:
  name: mail-tools-sa
  namespace: kube-system`,
  }),
  createFakeResource({
    id: 'roles',
    displayName: 'Roles',
    name: 'mail-tools-role',
    manifest: `apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: mail-tools-role
  namespace: kube-system`,
  }),
]

const MANIFEST_RESOURCES_WITH_IDS = MANIFEST_RESOURCES.map((resource) => ({
  ...resource,
  id: `${resource.id}:${resource.name}`,
}))

function RouteComponent() {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>('workloads:Application')

  useDocumentTitle('Service - Manifest')

  const isArgoCdManifestAvailable = useMemo(
    () => Boolean(environmentId && serviceId) && isFakeArgoCdService({ environmentId, serviceId }),
    [environmentId, serviceId]
  )

  const selectedResource = useMemo(
    () =>
      MANIFEST_RESOURCES_WITH_IDS.find((resource) => resource.id === selectedResourceId) ?? MANIFEST_RESOURCES_WITH_IDS[0],
    [selectedResourceId]
  )

  if (!isArgoCdManifestAvailable) {
    return (
      <Navigate
        to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview"
        params={{ organizationId, projectId, environmentId, serviceId }}
        replace
      />
    )
  }

  return (
    <div className="container mx-auto flex min-h-page-container flex-col px-4 pt-6">
      <Section className="min-h-0 flex-1 gap-6">
        <div className="flex shrink-0 flex-col gap-6">
          <Heading>Manifest</Heading>
          <hr className="w-full border-neutral" />
        </div>

        <div className="flex min-h-0 flex-1 overflow-hidden rounded-lg border border-neutral">
          <div className="flex w-[300px] shrink-0 flex-col gap-4 border-r border-neutral bg-surface-neutral-subtle p-3">
            <InputSearch placeholder="Search..." className="w-full" onChange={setSearchQuery} />
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ResourceTreeList
                resources={MANIFEST_RESOURCES_WITH_IDS}
                selectedResourceId={selectedResourceId}
                onSelectResource={setSelectedResourceId}
                searchQuery={searchQuery}
              />
            </div>
          </div>

          <div className="min-h-0 min-w-0 flex-1">
            <CodeEditor
              language="yaml"
              value={selectedResource.manifest}
              readOnly
              height="100%"
              options={{ scrollBeyondLastLine: false, wordWrap: 'off' }}
            />
          </div>
        </div>
      </Section>
    </div>
  )
}
