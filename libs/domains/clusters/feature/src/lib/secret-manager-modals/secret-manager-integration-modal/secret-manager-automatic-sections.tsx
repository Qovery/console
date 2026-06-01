import { type SecretManagerAccess } from 'qovery-typescript-axios'
import { type UseFormReturn } from 'react-hook-form'
import { type Value } from '@qovery/shared/interfaces'
import { Callout, Icon } from '@qovery/shared/ui'
import { type SecretManagerOption } from '../secret-manager-integration.types'
import {
  GcpProjectIdField,
  SecretManagerNameField,
  SecretManagerRegionField,
} from './secret-manager-integration-fields'

interface SecretManagerAutomaticSectionsProps {
  methods: UseFormReturn<SecretManagerAccess>
  option: SecretManagerOption
  regions: Value[]
}

export function SecretManagerAutomaticSections({ methods, option, regions }: SecretManagerAutomaticSectionsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-medium text-neutral">Automatic integration</p>
        <p className="text-sm text-neutral-subtle">
          Qovery will use the cluster’s credentials to configure access to your Secrets Manager automatically
        </p>
      </div>
      <div className="flex flex-col gap-4">
        {option.icon === 'GCP' && <GcpProjectIdField methods={methods} />}
        <SecretManagerRegionField methods={methods} regions={regions} />
        <SecretManagerNameField methods={methods} />
      </div>
      <AutomaticIntegrationCallout provider={option.icon === 'GCP' ? 'GCP' : 'AWS'} />
    </div>
  )
}

function AutomaticIntegrationCallout({ provider }: { provider: 'AWS' | 'GCP' }) {
  return (
    <Callout.Root color="sky">
      <Callout.Icon>
        <Icon iconName="circle-info" iconStyle="regular" />
      </Callout.Icon>
      <Callout.Text>
        Automatic integration requires the secret manager to be in the same {provider} account as the cluster
      </Callout.Text>
    </Callout.Root>
  )
}
