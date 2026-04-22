import {
  type HelmRepositoryResponse,
  type OrganizationAnnotationsGroupResponse,
  type OrganizationLabelsGroupEnrichedResponse,
} from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { type HelmGeneralData } from '@qovery/domains/services/feature'
import { Button, Heading, Icon, Section, SummaryValue, Truncate } from '@qovery/shared/ui'
import { type HelmValuesArgumentsData } from '../../values-override-arguments-setting/values-override-arguments-setting'
import { type HelmValuesFileData } from '../../values-override-files-setting/values-override-files-setting'

export interface HelmSummaryViewProps {
  generalData: HelmGeneralData
  valuesOverrideFileData: HelmValuesFileData
  valuesOverrideArgumentsData: HelmValuesArgumentsData
  helmRepositories: HelmRepositoryResponse[]
  labelsGroup: OrganizationLabelsGroupEnrichedResponse[]
  annotationsGroup: OrganizationAnnotationsGroupResponse[]
  onEditGeneral: () => void
  onEditValuesOverrideFile: () => void
  onEditValuesOverrideArguments: () => void
  onBack: () => void
  onSubmit: (withDeploy: boolean) => void
  isLoadingCreate: boolean
  isLoadingCreateAndDeploy: boolean
}

function EditSectionButton({ onClick, label, testId }: { onClick: () => void; label: string; testId: string }) {
  return (
    <Button
      aria-label={label}
      data-testid={testId}
      type="button"
      variant="outline"
      color="neutral"
      size="md"
      onClick={onClick}
      iconOnly
    >
      <Icon className="text-base" iconName="gear-complex" />
    </Button>
  )
}

export function HelmSummaryView({
  generalData,
  valuesOverrideFileData,
  valuesOverrideArgumentsData,
  helmRepositories,
  labelsGroup,
  annotationsGroup,
  onEditGeneral,
  onEditValuesOverrideFile,
  onEditValuesOverrideArguments,
  onBack,
  onSubmit,
  isLoadingCreate,
  isLoadingCreateAndDeploy,
}: HelmSummaryViewProps) {
  const selectedLabels = labelsGroup
    .filter(({ id }) => generalData.labels_groups?.includes(id))
    .map(({ name }) => name)
    .join(', ')
  const selectedAnnotations = annotationsGroup
    .filter(({ id }) => generalData.annotations_groups?.includes(id))
    .map(({ name }) => name)
    .join(', ')

  const autoDeployLabel = match({
    sourceProvider: generalData.source_provider,
    chartAutoDeploy: Boolean(generalData.auto_deploy),
    valuesType: valuesOverrideFileData.type,
    valuesAutoDeploy: Boolean(valuesOverrideFileData.auto_deploy),
  })
    .with(
      {
        sourceProvider: 'GIT',
        chartAutoDeploy: true,
        valuesType: 'GIT_REPOSITORY',
        valuesAutoDeploy: true,
      },
      () => 'On (chart and values)'
    )
    .with({ sourceProvider: 'GIT', chartAutoDeploy: true }, () => 'On (chart)')
    .with(
      { sourceProvider: 'HELM_REPOSITORY', valuesType: 'GIT_REPOSITORY', valuesAutoDeploy: true },
      () => 'On (values)'
    )
    .otherwise(() => 'Off')

  return (
    <Section className="space-y-10">
      <div className="flex flex-col gap-2">
        <Heading className="mb-2">Ready to create your Helm chart</Heading>
        <p className="text-sm text-neutral-subtle">
          The Helm setup is ready. Review your configuration, then create the service or create and deploy it.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <Section className="rounded-md border border-neutral bg-surface-neutral-subtle p-4">
          <div className="flex justify-between">
            <Heading>General information</Heading>
            <EditSectionButton onClick={onEditGeneral} label="Edit general information" testId="edit-general-button" />
          </div>
          <ul className="list-none space-y-2 text-sm text-neutral-subtle">
            <SummaryValue label="Name" value={generalData.name} />
            {generalData.description ? (
              <li>
                <strong className="font-medium text-neutral">Description:</strong>
                <br />
                {generalData.description}
              </li>
            ) : null}
            <li className="py-2">
              <hr className="border-t border-dashed border-neutral" />
            </li>

            {generalData.source_provider === 'GIT' ? (
              <>
                <SummaryValue label="Repository" value={generalData.git_repository?.name ?? generalData.repository} />
                <SummaryValue label="Branch" value={generalData.branch} />
                <SummaryValue label="Chart root folder path" value={generalData.root_path || '/'} />
              </>
            ) : (
              <>
                <SummaryValue
                  label="Repository"
                  value={
                    helmRepositories.find(({ id }) => id === generalData.repository)?.name ?? generalData.repository
                  }
                />
                <SummaryValue label="Chart name" value={generalData.chart_name} />
                <SummaryValue label="Version" value={generalData.chart_version} />
              </>
            )}

            <li className="py-2">
              <hr className="border-t border-dashed border-neutral" />
            </li>
            <SummaryValue label="Helm parameters" value={generalData.arguments} />
            <SummaryValue label="Helm timeout" value={generalData.timeout_sec} />
            <SummaryValue
              label="Allow cluster-wide resources"
              value={generalData.allow_cluster_wide_resources ? 'Yes' : 'No'}
            />
            <SummaryValue label="Auto-deploy" value={autoDeployLabel} />
            {selectedLabels ? <SummaryValue label="Labels group" value={selectedLabels} /> : null}
            {selectedAnnotations ? <SummaryValue label="Annotations group" value={selectedAnnotations} /> : null}
          </ul>
        </Section>

        <Section className="rounded-md border border-neutral bg-surface-neutral-subtle p-4">
          <div className="flex justify-between">
            <Heading>Values override as file</Heading>
            <EditSectionButton
              onClick={onEditValuesOverrideFile}
              label="Edit values override as file"
              testId="edit-values-file-button"
            />
          </div>
          <ul className="list-none space-y-2 text-sm text-neutral-subtle">
            {match(valuesOverrideFileData.type)
              .with('GIT_REPOSITORY', () => (
                <>
                  <SummaryValue label="File source" value="Git repository" />
                  <SummaryValue label="Git provider" value={valuesOverrideFileData.provider} />
                  <SummaryValue
                    label="Repository"
                    value={valuesOverrideFileData.git_repository?.name ?? valuesOverrideFileData.repository}
                  />
                  <SummaryValue label="Branch" value={valuesOverrideFileData.branch} />
                  <SummaryValue label="Overrides path" value={valuesOverrideFileData.paths} />
                  <SummaryValue
                    label="Auto-deploy"
                    value={valuesOverrideFileData.auto_deploy ? 'On' : 'Off'}
                    testId="summary-values-file-auto-deploy"
                  />
                </>
              ))
              .with('YAML', () => (
                <>
                  <SummaryValue label="File source" value="Raw YAML" />
                  <li>
                    <strong className="font-medium text-neutral">Override content:</strong>{' '}
                    <Truncate text={valuesOverrideFileData.content ?? ''} truncateLimit={80} />
                  </li>
                </>
              ))
              .with('NONE', () => <SummaryValue label="Override file" value="No override file configured" />)
              .exhaustive()}
          </ul>
        </Section>

        <Section className="rounded-md border border-neutral bg-surface-neutral-subtle p-4">
          <div className="flex justify-between">
            <Heading>Values override as arguments</Heading>
            <EditSectionButton
              onClick={onEditValuesOverrideArguments}
              label="Edit values override as arguments"
              testId="edit-values-arguments-button"
            />
          </div>
          {valuesOverrideArgumentsData.arguments.length > 0 ? (
            <ul className="list-none space-y-2 text-sm text-neutral-subtle">
              <SummaryValue label="Argument overrides" value={valuesOverrideArgumentsData.arguments.length} />
              {valuesOverrideArgumentsData.arguments.map((argument, index) => (
                <li key={`${argument.type}-${argument.key}-${index}`}>
                  <strong className="font-medium text-neutral">{argument.type}</strong> {argument.key}:{' '}
                  <Truncate text={argument.json ?? argument.value} truncateLimit={80} />
                </li>
              ))}
            </ul>
          ) : (
            <ul className="list-none space-y-2 text-sm text-neutral-subtle">
              <SummaryValue label="Argument override" value="No argument override defined" />
            </ul>
          )}
        </Section>
      </div>

      <div className="flex justify-between">
        <Button onClick={onBack} type="button" size="lg" variant="plain">
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            data-testid="button-create"
            loading={isLoadingCreate}
            onClick={() => onSubmit(false)}
            size="lg"
            type="button"
            variant="outline"
          >
            Create
          </Button>
          <Button
            data-testid="button-create-deploy"
            loading={isLoadingCreateAndDeploy}
            onClick={() => onSubmit(true)}
            type="button"
            size="lg"
          >
            Create and deploy
          </Button>
        </div>
      </div>
    </Section>
  )
}
