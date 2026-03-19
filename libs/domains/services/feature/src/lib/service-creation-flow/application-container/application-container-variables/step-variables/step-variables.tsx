import { useParams } from '@tanstack/react-router'
import { APIVariableTypeEnum, type VariableResponse } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useFieldArray } from 'react-hook-form'
import { CreateUpdateVariableModal, type CreateUpdateVariableModalSubmitData } from '@qovery/domains/variables/feature'
import { type ExternalSecretData, type VariableData } from '@qovery/shared/interfaces'
import { Button, EmptyState, FunnelFlowBody, Heading, Icon, Section, Tooltip, useModal } from '@qovery/shared/ui'
import {
  AddSecretModal,
  type ExternalSecret,
  SECRET_SOURCES,
} from '../../../../service-variables-tabs/add-secret-modal/add-secret-modal'
import { useApplicationContainerCreateContext } from '../../application-container-creation-flow'

export interface ApplicationContainerStepVariablesProps {
  onBack: () => void
  onSubmit: () => void | Promise<void>
}

function cardHeaderActions({
  onAddDefault,
  onAddAsFile,
  defaultLabel,
  asFileLabel,
}: {
  onAddDefault: () => void
  onAddAsFile: () => void
  defaultLabel: string
  asFileLabel: string
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        color="neutral"
        variant="outline"
        size="sm"
        className="gap-1.5 text-ssm"
        onClick={onAddAsFile}
      >
        <Icon iconName="file-lines" iconStyle="regular" className="text-ssm" />
        {asFileLabel}
      </Button>
      <Button
        type="button"
        color="neutral"
        variant="solid"
        size="sm"
        className="gap-1.5 text-ssm"
        onClick={onAddDefault}
      >
        <Icon iconName="circle-plus" iconStyle="regular" className="text-ssm" />
        {defaultLabel}
      </Button>
    </div>
  )
}

function emptyState({
  title,
  onAddDefault,
  onAddAsFile,
  defaultLabel,
  asFileLabel,
}: {
  title: string
  onAddDefault: () => void
  onAddAsFile: () => void
  defaultLabel: string
  asFileLabel: string
}) {
  return (
    <EmptyState title={title} icon="lock-keyhole" className="h-auto rounded-none border-0 bg-transparent px-8 py-8">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" color="neutral" variant="solid" size="md" className="gap-1.5" onClick={onAddDefault}>
          <Icon iconName="circle-plus" iconStyle="regular" />
          {defaultLabel}
        </Button>
        <Button type="button" color="neutral" variant="outline" size="md" className="gap-1.5" onClick={onAddAsFile}>
          <Icon iconName="file-lines" iconStyle="regular" />
          {asFileLabel}
        </Button>
      </div>
    </EmptyState>
  )
}

function mapModalDataToVariable(
  data: CreateUpdateVariableModalSubmitData,
  current?: VariableData
): VariableData {
  return {
    variable: data.key,
    value: data.value ?? '',
    scope: data.scope,
    isSecret: data.isSecret,
    isReadOnly: current?.isReadOnly,
    description: data.description?.trim() ? data.description : undefined,
    file: data.isFile
      ? {
          path: data.mountPath ?? `/vault/secrets/${data.key.toLowerCase()}`,
          enable_interpolation: data.enable_interpolation_in_file ?? false,
        }
      : undefined,
  }
}

function mapVariableToModalVariable(
  variable: VariableData,
  index: number,
  serviceScope: 'APPLICATION' | 'CONTAINER'
): VariableResponse {
  return {
    id: `local-variable-${index}`,
    key: variable.variable ?? '',
    value: variable.value ?? '',
    description: variable.description ?? '',
    is_secret: variable.isSecret,
    scope: variable.scope ?? serviceScope,
    variable_type: variable.file ? APIVariableTypeEnum.FILE : APIVariableTypeEnum.VALUE,
    mount_path: variable.file?.path ?? null,
    enable_interpolation_in_file: variable.file?.enable_interpolation ?? false,
  } as VariableResponse
}

function mapSecretForForm(secret: Omit<ExternalSecret, 'id'>): ExternalSecretData {
  const sourceIcon = secret.sourceIcon === 'aws' || secret.sourceIcon === 'gcp' ? secret.sourceIcon : undefined
  return {
    name: secret.name,
    description: secret.description,
    filePath: secret.filePath,
    isFile: secret.isFile,
    reference: secret.reference,
    source: secret.source,
    sourceIcon,
    scope: secret.scope,
  }
}

function mapSecretForModal(secret: ExternalSecretData, index: number): ExternalSecret {
  return {
    id: `local-secret-${index}`,
    name: secret.name,
    description: secret.description,
    filePath: secret.filePath,
    isFile: secret.isFile,
    reference: secret.reference,
    source: secret.source ?? null,
    sourceIcon: secret.sourceIcon,
    scope: secret.scope ?? 'Application',
  }
}

export function ApplicationContainerStepVariables({ onBack, onSubmit }: ApplicationContainerStepVariablesProps) {
  const { setCurrentStep, variablesForm, generalForm } = useApplicationContainerCreateContext()
  const { projectId = '', environmentId = '' } = useParams({ strict: false })
  const { openModal, closeModal } = useModal()

  const serviceScope = generalForm.getValues('serviceType') === 'APPLICATION' ? 'APPLICATION' : 'CONTAINER'

  const { fields: variables, append: appendVariable, remove: removeVariable, update: updateVariable } = useFieldArray({
    control: variablesForm.control,
    name: 'variables',
  })

  const {
    fields: externalSecrets,
    append: appendExternalSecret,
    remove: removeExternalSecret,
    update: updateExternalSecret,
  } = useFieldArray({
    control: variablesForm.control,
    name: 'externalSecrets',
  })

  useEffect(() => {
    setCurrentStep(5)
  }, [setCurrentStep])

  const openVariableModal = ({ isFile, index }: { isFile: boolean; index?: number }) => {
    const currentVariable = typeof index === 'number' ? variables[index] : undefined
    const mode = typeof index === 'number' ? 'UPDATE' : 'CREATE'

    openModal({
      content: (
        <CreateUpdateVariableModal
          closeModal={closeModal}
          mode={mode}
          type={currentVariable?.file ? APIVariableTypeEnum.FILE : APIVariableTypeEnum.VALUE}
          isFile={isFile}
          variable={
            typeof index === 'number' ? mapVariableToModalVariable(currentVariable, index, serviceScope) : undefined
          }
          onSubmitLocal={(data) => {
            const mapped = mapModalDataToVariable(data, currentVariable)
            if (typeof index === 'number') {
              updateVariable(index, mapped)
            } else {
              appendVariable(mapped)
            }
          }}
          scope={serviceScope}
          projectId={projectId}
          environmentId={environmentId}
          serviceId="service-creation-flow"
        />
      ),
      options: {
        fakeModal: true,
      },
    })
  }

  const openSecretModal = ({ isFile, index }: { isFile: boolean; index?: number }) => {
    const currentSecret = typeof index === 'number' ? mapSecretForModal(externalSecrets[index], index) : undefined
    const defaultSource = currentSecret?.source
      ? SECRET_SOURCES.find((source) => source.tableLabel === currentSecret.source) ?? SECRET_SOURCES[0]
      : SECRET_SOURCES[0]

    openModal({
      content: (
        <AddSecretModal
          mode={typeof index === 'number' ? 'edit' : 'create'}
          defaultSource={defaultSource}
          isFile={isFile}
          initialSecret={currentSecret}
          onClose={closeModal}
          onSubmit={(secret) => {
            const mapped = mapSecretForForm(secret)
            if (typeof index === 'number') {
              updateExternalSecret(index, mapped)
            } else {
              appendExternalSecret(mapped)
            }
          }}
        />
      ),
      options: {
        fakeModal: true,
        width: 520,
      },
    })
  }

  const handleSubmit = variablesForm.handleSubmit(async () => onSubmit())

  return (
    <FunnelFlowBody>
      <Section className="mx-auto w-full max-w-[648px]">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Heading className="mb-0">Service variables</Heading>
            <p className="text-sm text-neutral-subtle">Define here the variables required by your service.</p>
          </div>

          <section>
            <div className="relative overflow-hidden rounded-t-lg border-x border-t border-neutral bg-surface-neutral-subtle">
              <div className="flex min-h-[52px] items-center justify-between px-4 pb-5 pt-3">
                <p className="text-sm font-medium text-neutral">Custom variables</p>
                {variables.length > 0 &&
                  cardHeaderActions({
                    onAddDefault: () => openVariableModal({ isFile: false }),
                    onAddAsFile: () => openVariableModal({ isFile: true }),
                    defaultLabel: 'Add variable',
                    asFileLabel: 'Add variable as file',
                  })}
              </div>
            </div>

            <div className="relative -mt-2 rounded-lg">
              <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
                {variables.length === 0 ? (
                  emptyState({
                    title: 'No custom variables added yet',
                    onAddDefault: () => openVariableModal({ isFile: false }),
                    onAddAsFile: () => openVariableModal({ isFile: true }),
                    defaultLabel: 'Add variable',
                    asFileLabel: 'Add variable as file',
                  })
                ) : (
                  <>
                    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_88px] border-b border-neutral text-xs">
                      <div className="flex h-11 items-center px-4 font-code font-normal text-neutral">Name</div>
                      <div className="flex h-11 items-center border-l border-neutral px-4 font-code font-normal text-neutral">
                        Value
                      </div>
                      <div className="flex h-11 items-center justify-start border-l border-neutral px-4 font-code font-normal text-neutral">
                        Actions
                      </div>
                    </div>

                    {variables.map((variable, index) => (
                      <div
                        key={variable.id}
                        className="grid min-h-[60px] grid-cols-[minmax(0,1fr)_minmax(0,1fr)_88px] border-b border-neutral last:border-b-0"
                      >
                        <div className="flex min-w-0 flex-col justify-center gap-1 px-4 py-2">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <span className="truncate text-sm font-medium text-neutral">{variable.variable}</span>
                            {variable.description && (
                              <Tooltip content={variable.description}>
                                <span>
                                  <Icon iconName="circle-info" iconStyle="regular" className="text-neutral-subtle" />
                                </span>
                              </Tooltip>
                            )}
                          </div>
                          {variable.file?.path && (
                            <div className="flex items-center gap-1 text-xs text-neutral-subtle">
                              <Icon
                                iconName={variable.isSecret ? 'file-lock' : 'file-lines'}
                                iconStyle="regular"
                                className="text-xs"
                              />
                              <span className="truncate">{variable.file.path}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex min-w-0 items-center border-l border-neutral px-4 py-2 text-sm text-neutral">
                          {variable.isSecret ? (
                            <span className="flex items-center gap-1">
                              <Icon
                                iconName="lock-keyhole"
                                iconStyle="regular"
                                className="text-xs text-neutral-subtle"
                              />
                              ***********************
                            </span>
                          ) : (
                            <span className="truncate">{variable.value || '-'}</span>
                          )}
                        </div>

                        <div className="flex items-center justify-end gap-2 border-l border-neutral px-4 py-2">
                          <Button
                            aria-label="Edit variable"
                            type="button"
                            color="neutral"
                            variant="outline"
                            size="xs"
                            iconOnly
                            disabled={variable.isReadOnly}
                            onClick={() => openVariableModal({ isFile: !!variable.file, index })}
                          >
                            <Icon iconName="pen" />
                          </Button>
                          <Button
                            aria-label="Delete variable"
                            type="button"
                            color="neutral"
                            variant="outline"
                            size="xs"
                            iconOnly
                            disabled={variable.isReadOnly}
                            onClick={() => removeVariable(index)}
                          >
                            <Icon iconName="trash" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </section>

          <section>
            <div className="relative overflow-hidden rounded-t-lg border-x border-t border-neutral bg-surface-neutral-subtle">
              <div className="flex min-h-[52px] items-center justify-between px-4 pb-5 pt-3">
                <p className="text-sm font-medium text-neutral">External secrets</p>
                {externalSecrets.length > 0 &&
                  cardHeaderActions({
                    onAddDefault: () => openSecretModal({ isFile: false }),
                    onAddAsFile: () => openSecretModal({ isFile: true }),
                    defaultLabel: 'Add secret',
                    asFileLabel: 'Add secret as file',
                  })}
              </div>
            </div>

            <div className="relative -mt-2 rounded-lg">
              <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
                {externalSecrets.length === 0 ? (
                  emptyState({
                    title: 'No external secrets added yet',
                    onAddDefault: () => openSecretModal({ isFile: false }),
                    onAddAsFile: () => openSecretModal({ isFile: true }),
                    defaultLabel: 'Add secret',
                    asFileLabel: 'Add secret as file',
                  })
                ) : (
                  <>
                    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_88px] border-b border-neutral text-xs">
                      <div className="flex h-11 items-center px-4 font-code font-normal text-neutral">Name</div>
                      <div className="flex h-11 items-center border-l border-neutral px-4 font-code font-normal text-neutral">
                        Reference
                      </div>
                      <div className="flex h-11 items-center justify-start border-l border-neutral px-4 font-code font-normal text-neutral">
                        Actions
                      </div>
                    </div>

                    {externalSecrets.map((secret, index) => (
                      <div
                        key={secret.id}
                        className="grid min-h-[60px] grid-cols-[minmax(0,1fr)_minmax(0,1fr)_88px] border-b border-neutral last:border-b-0"
                      >
                        <div className="flex min-w-0 flex-col justify-center gap-1 px-4 py-2">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <span className="truncate text-sm font-medium text-neutral">{secret.name}</span>
                            {secret.description && (
                              <Tooltip content={secret.description}>
                                <span>
                                  <Icon iconName="circle-info" iconStyle="regular" className="text-neutral-subtle" />
                                </span>
                              </Tooltip>
                            )}
                          </div>
                          {secret.filePath && (
                            <div className="flex items-center gap-1 text-xs text-neutral-subtle">
                              <Icon iconName="file-lock" iconStyle="regular" className="text-xs" />
                              <span className="truncate">{secret.filePath}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex min-w-0 items-center border-l border-neutral px-4 py-2 text-sm text-neutral">
                          <span className="truncate">{secret.reference || '-'}</span>
                        </div>

                        <div className="flex items-center justify-end gap-2 border-l border-neutral px-4 py-2">
                          <Button
                            aria-label="Edit secret"
                            type="button"
                            color="neutral"
                            variant="outline"
                            size="xs"
                            iconOnly
                            onClick={() => openSecretModal({ isFile: !!secret.isFile, index })}
                          >
                            <Icon iconName="pen" />
                          </Button>
                          <Button
                            aria-label="Delete secret"
                            type="button"
                            color="neutral"
                            variant="outline"
                            size="xs"
                            iconOnly
                            onClick={() => removeExternalSecret(index)}
                          >
                            <Icon iconName="trash" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </section>

          <div className="flex items-center justify-between border-t border-neutral pt-4">
            <Button onClick={onBack} type="button" size="lg" variant="outline" color="neutral" className="gap-2">
              <Icon iconName="arrow-left" iconStyle="regular" />
              Back
            </Button>
            <Button data-testid="button-submit" type="submit" size="lg" className="gap-2">
              Continue
              <Icon iconName="arrow-right" iconStyle="regular" />
            </Button>
          </div>
        </form>
      </Section>
    </FunnelFlowBody>
  )
}

export default ApplicationContainerStepVariables
