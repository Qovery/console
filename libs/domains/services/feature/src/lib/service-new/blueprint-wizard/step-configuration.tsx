import { type ReactNode, useRef, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Button, Heading, Icon, InputSelect, InputText, Section } from '@qovery/shared/ui'
import { type BlueprintEntry } from '../blueprints'
import { type BlueprintWizardFormData, getSetupParameters } from './types'

export interface StepConfigurationProps {
  blueprint: BlueprintEntry
  onNext: () => void
}

type ConfigStage = 'service' | 'setup' | 'overrides'
type OverrideSection = 'bucket' | 'resources' | 'network' | 'authentication'

const CARD_CLASSNAME =
  'rounded-[12px] border border-neutral bg-surface-neutral shadow-[0_0_2px_rgba(0,0,0,0.01),0_2px_1.5px_rgba(0,0,0,0.02)]'

function WizardStickyFooter({ children }: { children: ReactNode }) {
  return (
    <div className="shrink-0 border-t border-neutral bg-background-secondary pb-6 pt-4">
      {children}
    </div>
  )
}

export function StepConfiguration({ blueprint, onNext }: StepConfigurationProps) {
  const methods = useFormContext<BlueprintWizardFormData>()
  const setupParams = getSetupParameters(blueprint)
  const [activeStage, setActiveStage] = useState<ConfigStage>('service')
  const [isServiceCompleted, setIsServiceCompleted] = useState(false)
  const [isSetupCompleted, setIsSetupCompleted] = useState(false)
  const [openOverrideSection, setOpenOverrideSection] = useState<OverrideSection | null>(null)

  const defaultResourcesRef = useRef({
    cpuMilli: methods.getValues('cpuMilli'),
    memoryMib: methods.getValues('memoryMib'),
    timeoutSec: methods.getValues('timeoutSec'),
  })
  const savedResourcesRef = useRef({ ...defaultResourcesRef.current })

  const cpuMilli = methods.watch('cpuMilli')
  const memoryMib = methods.watch('memoryMib')
  const timeoutSec = methods.watch('timeoutSec')

  const hasResourceOverrides =
    cpuMilli !== defaultResourcesRef.current.cpuMilli ||
    memoryMib !== defaultResourcesRef.current.memoryMib ||
    timeoutSec !== defaultResourcesRef.current.timeoutSec

  const isResourceDirty =
    cpuMilli !== savedResourcesRef.current.cpuMilli ||
    memoryMib !== savedResourcesRef.current.memoryMib ||
    timeoutSec !== savedResourcesRef.current.timeoutSec

  const versionOptions = blueprint.versions.map((version, index) => ({
    label: index === 0 ? `${version.version} (latest)` : version.version,
    value: version.version,
  }))

  const continueService = async () => {
    const valid = await methods.trigger(['serviceName', 'majorServiceVersion'], { shouldFocus: true })
    if (!valid) return

    setIsServiceCompleted(true)
    setActiveStage('setup')
  }

  const continueSetup = async () => {
    const setupFieldNames = setupParams.map((param) => `setupParams.${param.id}`)
    const valid = await methods.trigger(setupFieldNames as never, { shouldFocus: true })
    if (!valid) return

    setIsSetupCompleted(true)
    setActiveStage('overrides')
  }

  const saveResourceOverrides = () => {
    savedResourcesRef.current = { cpuMilli, memoryMib, timeoutSec }
    setOpenOverrideSection(null)
  }

  const resetResourceOverrides = () => {
    methods.setValue('cpuMilli', defaultResourcesRef.current.cpuMilli, { shouldDirty: true, shouldTouch: true })
    methods.setValue('memoryMib', defaultResourcesRef.current.memoryMib, { shouldDirty: true, shouldTouch: true })
    methods.setValue('timeoutSec', defaultResourcesRef.current.timeoutSec, { shouldDirty: true, shouldTouch: true })
  }

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-[620px] flex-col bg-background-secondary text-sm">
      <form className="flex min-h-0 flex-1 flex-col overflow-hidden" onSubmit={methods.handleSubmit(() => onNext())}>
        <Section className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-6">
          <div className="flex flex-col gap-2">
            <Heading className="text-2xl">{blueprint.name} configuration</Heading>
            <p className="text-base text-neutral-subtle">Configure your service for a successful deployment.</p>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <div className={CARD_CLASSNAME}>
            {activeStage === 'service' ? (
              <>
                <div className="flex items-center gap-1.5 p-4">
                  <Icon iconName="circle-info" className="text-sm text-neutral" />
                  <p className="text-base font-medium text-neutral">Service informations</p>
                </div>
                <div className="flex flex-col gap-4 px-4 pb-4">
                  <div className="flex flex-col gap-3">
                    <Controller
                      name="serviceName"
                      control={methods.control}
                      rules={{
                        required: 'Enter a service name.',
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputText
                          name={field.name}
                          value={field.value}
                          onChange={field.onChange}
                          label="Service name"
                          error={error?.message}
                        />
                      )}
                    />

                    <Controller
                      name="majorServiceVersion"
                      control={methods.control}
                      rules={{ required: 'Pick a version.' }}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelect
                          label="Service version"
                          value={field.value}
                          onChange={field.onChange}
                          options={versionOptions}
                          error={error?.message}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <Button type="button" size="md" color="neutral" variant="solid" radius="rounded" onClick={continueService}>
                      <span className="inline-flex items-center gap-2">
                        Continue
                        <Icon iconName="arrow-right" iconStyle="regular" className="text-sm" />
                      </span>
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <button
                type="button"
                className="flex w-full items-center justify-between p-4 text-left"
                onClick={() => setActiveStage('service')}
              >
                <div className="flex items-center gap-1.5">
                  <Icon iconName="circle-info" className="text-sm text-neutral" />
                  <p className="text-base font-medium text-neutral">Service informations</p>
                </div>
                {isServiceCompleted ? <Icon iconName="circle-check" className="text-sm text-positive" /> : null}
              </button>
            )}
          </div>

          <div className={CARD_CLASSNAME}>
            {activeStage === 'setup' ? (
              <>
                <div className="flex items-center gap-1.5 p-4">
                  <Icon iconName="chart-bullet" className="text-sm text-neutral" />
                  <p className="text-base font-medium text-neutral">Blueprint setup</p>
                </div>
                <div className="flex flex-col gap-4 px-4 pb-4">
                  {setupParams.length === 0 ? (
                    <p className="text-neutral-subtle">This blueprint has no parameters to configure.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {setupParams.map((param) => (
                        <Controller
                          key={param.id}
                          name={`setupParams.${param.id}`}
                          control={methods.control}
                          rules={param.required ? { required: `${param.label} is required.` } : undefined}
                          render={({ field, fieldState: { error } }) =>
                            param.type === 'select' && param.options ? (
                              <InputSelect
                                label={param.label}
                                value={field.value}
                                onChange={field.onChange}
                                options={param.options}
                                error={error?.message}
                              />
                            ) : (
                              <InputText
                                name={field.name}
                                value={field.value}
                                onChange={field.onChange}
                                label={param.label}
                                type={param.type === 'number' ? 'number' : 'text'}
                                error={error?.message}
                              />
                            )
                          }
                        />
                      ))}
                    </div>
                  )}

                  <div>
                    <Button type="button" size="md" color="neutral" variant="solid" radius="rounded" onClick={continueSetup}>
                      <span className="inline-flex items-center gap-2">
                        Continue
                        <Icon iconName="arrow-right" iconStyle="regular" className="text-sm" />
                      </span>
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <button
                type="button"
                className="flex w-full items-center justify-between p-4 text-left"
                disabled={!isServiceCompleted}
                onClick={() => {
                  if (isServiceCompleted) {
                    setActiveStage('setup')
                  }
                }}
              >
                <div className="flex items-center gap-1.5">
                  <Icon iconName="chart-bullet" className="text-sm text-neutral" />
                  <p className={`text-base font-medium ${isServiceCompleted ? 'text-neutral' : 'text-neutral-subtle'}`}>
                    Blueprint setup
                  </p>
                </div>
                {isSetupCompleted ? <Icon iconName="circle-check" className="text-sm text-positive" /> : null}
              </button>
            )}
          </div>

          <div className={CARD_CLASSNAME}>
            {activeStage === 'overrides' ? (
              <>
                <div className="flex flex-col gap-1 p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <Icon iconName="code" className="text-sm text-neutral" />
                      <p className="text-base font-medium text-neutral">Overrides</p>
                    </div>
                    <span className="text-neutral-subtle">·</span>
                    <p className="text-sm text-neutral-subtle">For advanced users</p>
                  </div>
                  <p className="text-sm text-neutral-subtle">
                    Use overrides to customize how your service is built or run. Entirely optional.
                  </p>
                </div>

                <div className="border-t border-neutral">
                  <button
                    type="button"
                    className="group flex h-12 w-full items-center justify-between px-4"
                    onClick={() => setOpenOverrideSection((value) => (value === 'bucket' ? null : 'bucket'))}
                  >
                    <span className="font-medium text-neutral-subtle transition-colors group-hover:text-neutral">Bucket</span>
                    <Icon
                      iconName={openOverrideSection === 'bucket' ? 'angle-up' : 'angle-down'}
                      className="text-sm text-neutral-subtle transition-colors group-hover:text-neutral"
                    />
                  </button>

                  <div className="border-t border-neutral">
                    <button
                      type="button"
                      className="group flex h-12 w-full items-center justify-between px-4"
                      onClick={() => setOpenOverrideSection((value) => (value === 'resources' ? null : 'resources'))}
                    >
                      <span
                        className={`font-medium transition-colors ${
                          openOverrideSection === 'resources' ? 'text-neutral' : 'text-neutral-subtle group-hover:text-neutral'
                        }`}
                      >
                        Resources
                      </span>
                      <Icon
                        iconName={openOverrideSection === 'resources' ? 'angle-up' : 'angle-down'}
                        className={`text-sm transition-colors ${
                          openOverrideSection === 'resources' ? 'text-neutral' : 'text-neutral-subtle group-hover:text-neutral'
                        }`}
                      />
                    </button>

                    {openOverrideSection === 'resources' ? (
                      <div className="flex flex-col gap-3 px-4 pb-4">
                        <div className="grid grid-cols-2 gap-3">
                          <Controller
                            name="cpuMilli"
                            control={methods.control}
                            rules={{ required: true, min: 100 }}
                            render={({ field, fieldState: { error } }) => (
                              <InputText
                                name={field.name}
                                value={String(field.value)}
                                onChange={(event) => field.onChange(Number(event.target.value))}
                                label="vCPU (milli)"
                                type="number"
                                error={error?.message}
                              />
                            )}
                          />
                          <Controller
                            name="memoryMib"
                            control={methods.control}
                            rules={{ required: true, min: 64 }}
                            render={({ field, fieldState: { error } }) => (
                              <InputText
                                name={field.name}
                                value={String(field.value)}
                                onChange={(event) => field.onChange(Number(event.target.value))}
                                label="Memory (MiB)"
                                type="number"
                                error={error?.message}
                              />
                            )}
                          />
                        </div>

                        <Controller
                          name="timeoutSec"
                          control={methods.control}
                          rules={{ required: true, min: 60 }}
                          render={({ field, fieldState: { error } }) => (
                            <InputText
                              name={field.name}
                              value={String(field.value)}
                              onChange={(event) => field.onChange(Number(event.target.value))}
                              label="Timeout (ms)"
                              type="number"
                              error={error?.message}
                            />
                          )}
                        />

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="md"
                            color="neutral"
                            variant="solid"
                            radius="rounded"
                            disabled={!isResourceDirty}
                            onClick={saveResourceOverrides}
                          >
                            <span className="inline-flex items-center gap-2">
                              <Icon iconName="floppy-disk" className="text-sm" />
                              Save
                            </span>
                          </Button>
                          {hasResourceOverrides ? (
                            <Button
                              type="button"
                              size="md"
                              color="neutral"
                              variant="outline"
                              radius="rounded"
                              onClick={resetResourceOverrides}
                            >
                              <span className="inline-flex items-center gap-2">
                                <Icon iconName="rotate-left" className="text-sm" />
                                Reset to default
                              </span>
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="border-t border-neutral">
                    <button
                      type="button"
                      className="group flex h-12 w-full items-center justify-between px-4"
                      onClick={() => setOpenOverrideSection((value) => (value === 'network' ? null : 'network'))}
                    >
                      <span className="font-medium text-neutral-subtle transition-colors group-hover:text-neutral">Network</span>
                      <Icon
                        iconName={openOverrideSection === 'network' ? 'angle-up' : 'angle-down'}
                        className="text-sm text-neutral-subtle transition-colors group-hover:text-neutral"
                      />
                    </button>
                  </div>

                  <div className="border-t border-neutral">
                    <button
                      type="button"
                      className="group flex h-12 w-full items-center justify-between px-4"
                      onClick={() => setOpenOverrideSection((value) => (value === 'authentication' ? null : 'authentication'))}
                    >
                      <span className="font-medium text-neutral-subtle transition-colors group-hover:text-neutral">
                        Authentication
                      </span>
                      <Icon
                        iconName={openOverrideSection === 'authentication' ? 'angle-up' : 'angle-down'}
                        className="text-sm text-neutral-subtle transition-colors group-hover:text-neutral"
                      />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <button
                type="button"
                className="flex w-full items-center gap-2 p-4 text-left"
                disabled={!isSetupCompleted}
                onClick={() => {
                  if (isSetupCompleted) {
                    setActiveStage('overrides')
                  }
                }}
              >
                <div className="flex items-center gap-1.5">
                  <Icon iconName="code" className="text-sm text-neutral" />
                  <p className={`text-base font-medium ${isSetupCompleted ? 'text-neutral' : 'text-neutral-subtle'}`}>Overrides</p>
                </div>
                <span className="text-neutral-subtle">·</span>
                <p className="text-sm text-neutral-subtle">For advanced users</p>
              </button>
            )}
          </div>
        </div>
        </Section>
        <WizardStickyFooter>
          <Button
            type="submit"
            size="lg"
            color="brand"
            variant="solid"
            radius="rounded"
            className="w-full justify-center"
            disabled={!isSetupCompleted}
            onClick={methods.handleSubmit(() => onNext())}
          >
            <span className="inline-flex items-center gap-2">
              Confirm blueprint configuration
              <Icon iconName="arrow-right" iconStyle="regular" />
            </span>
          </Button>
        </WizardStickyFooter>
      </form>
    </div>
  )
}

export default StepConfiguration
