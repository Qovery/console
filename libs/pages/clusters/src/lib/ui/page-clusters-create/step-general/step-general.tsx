import { type CloudProvider, CloudProviderEnum, type ClusterRegion } from 'qovery-typescript-axios'
import { type FormEventHandler, useMemo, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { ClusterSetup } from '@qovery/domains/clusters/feature'
import { ClusterCredentialsSettingsFeature, ClusterGeneralSettings } from '@qovery/shared/console-shared'
import { type ClusterGeneralData, type ClusterResourcesData, type Value } from '@qovery/shared/interfaces'
import { CLUSTERS_URL } from '@qovery/shared/routes'
import {
  BlockContent,
  Button,
  Callout,
  ExternalLink,
  Heading,
  Icon,
  IconFlag,
  InputSelect,
  LoaderSpinner,
  Popover,
  RadioGroup,
  Section,
} from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { defaultResourcesData } from '../../../feature/page-clusters-create-feature/page-clusters-create-feature'

export interface StepGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  cloudProviders: CloudProvider[]
  currentCloudProvider?: CloudProviderEnum
  setResourcesData?: (data: ClusterResourcesData) => void
}

export function StepGeneral(props: StepGeneralProps) {
  const { onSubmit, cloudProviders = [], currentCloudProvider, setResourcesData } = props
  const { control, formState, watch } = useFormContext<ClusterGeneralData>()
  const { organizationId = '' } = useParams()
  const navigate = useNavigate()

  const [currentProvider, setCurrentProvider] = useState<CloudProvider | undefined>(
    cloudProviders.filter((cloudProvider: CloudProvider) => cloudProvider.short_name === currentCloudProvider)[0]
  )

  const buildCloudProviders: Value[] = useMemo(
    () =>
      cloudProviders.map((value) => ({
        label: upperCaseFirstLetter(value.name),
        value: value.short_name || '',
        icon: <Icon name={value.short_name || CloudProviderEnum.AWS} className="w-4" />,
      })),
    [cloudProviders]
  )

  const buildRegions: Value[] = useMemo(
    () =>
      currentProvider?.regions?.map((region: ClusterRegion) => ({
        label: `${region.city} (${region.name})`,
        value: region.name,
        icon: <IconFlag code={region.country_code} />,
      })) || [],
    [currentProvider?.regions]
  )

  return (
    <Section>
      <div className="mb-10">
        <Heading className="mb-2">General information</Heading>
        <p className="text-neutral-400 text-sm mb-2">Provide here some general information for your cluster.</p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="text-sm mb-10">
          <Controller
            name="installation_type"
            control={control}
            rules={{
              required: 'Please select an installation type.',
            }}
            render={({ field }) => (
              <BlockContent title="Installation type">
                <Popover.Root>
                  <Popover.Trigger>
                    <span className="text-sm cursor-pointer text-brand-500 hover:text-brand-600 transition font-medium">
                      Which should I choose? <Icon className="text-xs" name="circle-question" />
                    </span>
                  </Popover.Trigger>
                  <Popover.Content side="left" className="text-neutral-350 text-sm relative" style={{ width: 440 }}>
                    <span className="text-neutral-400 font-medium mb-2">How to choose the installation type</span>
                    <p>
                      <ul className="list-disc pl-4">
                        <li>
                          Choose Qovery Managed if you are not familiar with Kubernetes or you don't want to bother with
                          it and delegate infrastructure management to Qovery. Additional Qovery Managed clusters have
                          an impact to your bill (depending on your contract type).
                        </li>
                        <li>
                          Choose Self-Managed otherwise. Note that you will have to manage any upgrade on your
                          Kubernetes cluster and the Helm charts deployed within it (including the Qovery applications).{' '}
                        </li>
                        <li>Choose Local Demo if you want to install Qovery on your local machine for demo/testing.</li>
                      </ul>
                    </p>
                    <Popover.Close className="absolute top-4 right-4">
                      <button type="button">
                        <Icon name="icon-solid-xmark text-lg leading-4 font-thin text-neutral-400" />
                      </button>
                    </Popover.Close>
                  </Popover.Content>
                </Popover.Root>
                <RadioGroup.Root
                  className="flex flex-col gap-4 mt-3"
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <label className="flex gap-3">
                    <span>
                      <RadioGroup.Item value="LOCAL_DEMO" />
                    </span>
                    <span>
                      <span className="text-neutral-400 font-medium">
                        Local Demo{' '}
                        <span className="ml-0.5 inline-block bg-brand-500 text-neutral-50 px-1 rounded text-xs font-normal">
                          3min to setup
                        </span>
                      </span>
                      <p className="text-neutral-350">
                        You will install Qovery on your local machine. Only for demo/testing purposes.
                      </p>
                    </span>
                  </label>
                  <label className="flex gap-3">
                    <span>
                      <RadioGroup.Item value="MANAGED" />
                    </span>
                    <span>
                      <span className="text-neutral-400 font-medium">Qovery Managed</span>
                      <p className="text-neutral-350">
                        Qovery will install and manage the Kubernetes cluster and the underlying infrastructure on your
                        cloud provider account.
                      </p>
                    </span>
                  </label>
                  <label className="flex gap-3">
                    <span>
                      <RadioGroup.Item value="SELF_MANAGED" />
                    </span>
                    <span>
                      <span className="text-neutral-400 font-medium">Self-Managed</span>
                      <p className="text-neutral-350">
                        You will manage the infrastructure, including any update/ upgrade. <br /> Advanced Kubernetes
                        knowledge required.
                      </p>
                    </span>
                  </label>
                </RadioGroup.Root>
              </BlockContent>
            )}
          />
        </div>

        {watch('installation_type') === 'MANAGED' && (
          <>
            <div className="mb-10">
              <h4 className="mb-4 text-neutral-400 text-sm">General</h4>
              <ClusterGeneralSettings />
            </div>
            <div className="mb-10">
              <h4 className="mb-3 text-neutral-400 text-sm">Provider credentials</h4>
              {cloudProviders.length > 0 ? (
                <>
                  {watch('cloud_provider') === CloudProviderEnum.GCP && (
                    <Callout.Root color="yellow" className="mb-2">
                      <Callout.Icon>
                        <Icon iconName="triangle-exclamation" />
                      </Callout.Icon>
                      <Callout.Text className="text-xs">
                        GCP integration is beta, keep an eye on your cluster costs and report any bugs and/or weird
                        behavior.
                        <ExternalLink
                          className="flex mt-1"
                          href="https://cloud.google.com/billing/docs/how-to/budgets"
                          size="xs"
                        >
                          Setup budget alerts
                        </ExternalLink>
                        <ExternalLink
                          className="flex mt-1"
                          href="https://discuss.qovery.com/t/new-feature-google-cloud-platform-gcp-beta-support/2307"
                          size="xs"
                        >
                          More details
                        </ExternalLink>
                      </Callout.Text>
                    </Callout.Root>
                  )}
                  <Controller
                    name="cloud_provider"
                    control={control}
                    rules={{
                      required: 'Please select a cloud provider.',
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <InputSelect
                        dataTestId="input-cloud-provider"
                        label="Cloud provider"
                        className="mb-3"
                        options={buildCloudProviders}
                        onChange={(value) => {
                          const currentProvider = cloudProviders?.filter(
                            (cloud) => cloud.short_name === value && cloud.regions
                          )[0]
                          setCurrentProvider(currentProvider as CloudProvider)
                          field.onChange(value)
                          setResourcesData && setResourcesData(defaultResourcesData)
                        }}
                        value={field.value}
                        error={error?.message}
                        portal
                      />
                    )}
                  />
                  {currentProvider && (
                    <>
                      <Controller
                        name="region"
                        control={control}
                        rules={{
                          required: 'Please select a region.',
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <InputSelect
                            dataTestId="input-region"
                            label="Region"
                            className="mb-3"
                            options={buildRegions}
                            onChange={field.onChange}
                            value={field.value}
                            error={error?.message}
                            isSearchable
                            portal
                          />
                        )}
                      />
                      <ClusterCredentialsSettingsFeature
                        cloudProvider={currentProvider.short_name as CloudProviderEnum}
                      />
                    </>
                  )}
                </>
              ) : (
                <div className="flex justify-center mt-2">
                  <LoaderSpinner className="w-4" />
                </div>
              )}
            </div>
          </>
        )}

        {watch('installation_type') !== 'MANAGED' && (
          <div className="mb-10">
            <h4 className="text-neutral-400 text-sm">Installation instruction</h4>
            {watch('installation_type') === 'LOCAL_DEMO' ? (
              <ExternalLink className="mb-4" href="https://hub.qovery.com/docs/getting-started/install-qovery/local/">
                See documentation
              </ExternalLink>
            ) : (
              <ExternalLink
                className="mb-4"
                href="https://hub.qovery.com/docs/getting-started/install-qovery/kubernetes/quickstart/"
              >
                See documentation
              </ExternalLink>
            )}

            {match(watch('installation_type'))
              .with('LOCAL_DEMO', 'SELF_MANAGED', (type) => <ClusterSetup type={type} />)
              .otherwise(() => null)}
          </div>
        )}

        <div className="flex justify-between">
          <Button
            size="lg"
            type="button"
            variant="plain"
            color="neutral"
            onClick={() => navigate(CLUSTERS_URL(organizationId))}
          >
            Cancel
          </Button>
          {watch('installation_type') === 'MANAGED' ? (
            <Button size="lg" data-testid="button-submit" type="submit" disabled={!formState.isValid}>
              Continue
            </Button>
          ) : (
            <Button size="lg" type="button" onClick={() => navigate(CLUSTERS_URL(organizationId))}>
              Close
            </Button>
          )}
        </div>
      </form>
    </Section>
  )
}

export default StepGeneral
