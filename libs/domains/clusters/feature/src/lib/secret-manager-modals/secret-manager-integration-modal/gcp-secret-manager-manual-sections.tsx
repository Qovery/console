import { type SecretManagerAccess } from 'qovery-typescript-axios'
import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { type Value } from '@qovery/shared/interfaces'
import { Button, CopyButton, Dropzone, ExternalLink, Heading, Icon, Section } from '@qovery/shared/ui'
import {
  GcpProjectIdField,
  SecretManagerNameField,
  SecretManagerRegionField,
} from './secret-manager-integration-fields'

interface GcpSecretManagerManualSectionsProps {
  methods: UseFormReturn<SecretManagerAccess>
  regions: Value[]
}

export function GcpSecretManagerManualSections({ methods, regions }: GcpSecretManagerManualSectionsProps) {
  const [fileDetails, setFileDetails] = useState<{ name: string; size: number }>()
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles?.[0]
      if (!file || file.type !== 'application/json') return

      setFileDetails({
        name: file.name,
        size: file.size / 1000,
      })

      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = async () => {
        const binaryStr = reader.result
        methods.setValue('authentication.mode', 'GCP_JSON_CREDENTIALS', { shouldValidate: true })
        const credentials = binaryStr ? btoa(binaryStr.toString()) : undefined
        methods.setValue('authentication.json_credentials', credentials, { shouldValidate: true })
      }
    },
  })

  return (
    <>
      <Section className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral p-4">
        <Heading level={3} className="text-sm font-medium text-neutral">
          1. Connect to your GCP Console and create/open a project
        </Heading>
        <p className="text-sm text-neutral-subtle">Make sure you are connected to the right GCP account</p>
        <ExternalLink href="https://console.cloud.google.com/" size="sm">
          https://console.cloud.google.com/
        </ExternalLink>
      </Section>
      <Section className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral p-4">
        <Heading level={3} className="text-sm font-medium text-neutral">
          2. Open the embedded Google shell and run the following command
        </Heading>
        <div className="flex gap-6 rounded border border-neutral bg-surface-neutral-subtle p-3 text-neutral retina:border-[0.5px]">
          <div>
            <span className="select-none">$ </span>
            curl https://setup.qovery.com/create_secret_manager_credentials_gcp.sh | bash -s -- $GOOGLE_CLOUD_PROJECT
            qovery_secrets_manager_role qovery-secrets-manager-sa{' '}
          </div>
          <CopyButton content="curl https://setup.qovery.com/create_secret_manager_credentials_gcp.sh | bash -s -- $GOOGLE_CLOUD_PROJECT qovery_secrets_manager_role qovery-secrets-manager-sa" />
        </div>
      </Section>
      <Section className="flex flex-col gap-4 rounded-md border border-neutral bg-surface-neutral p-4">
        <Heading level={3} className="text-sm font-medium text-neutral">
          3. Download the key.json generated and drag and drop it here
        </Heading>
        <Controller
          name="authentication.json_credentials"
          control={methods.control}
          rules={{
            required: 'Please enter your credentials JSON',
          }}
          render={({ field }) => {
            if (!field.value) {
              return (
                <div {...getRootProps()}>
                  <input data-testid="input-credentials-json" className="hidden" {...getInputProps()} />
                  <Dropzone typeFile=".json" isDragActive={isDragActive} />
                </div>
              )
            }

            if (fileDetails) {
              return (
                <div className="flex items-center justify-between rounded-md border border-neutral p-4">
                  <div className="flex items-center pl-2 text-neutral">
                    <Icon iconName="file-arrow-down" className="mr-4" />
                    <p className="flex flex-col gap-1">
                      <span className="text-sm font-medium">{fileDetails.name}</span>
                      <span className="text-xs text-neutral-subtle">{fileDetails.size} Ko</span>
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    color="neutral"
                    size="md"
                    className="h-7 w-7 justify-center"
                    onClick={() => {
                      field.onChange(undefined)
                      setFileDetails(undefined)
                    }}
                  >
                    <Icon iconName="trash" />
                  </Button>
                </div>
              )
            }

            return <div />
          }}
        />
        <GcpProjectIdField methods={methods} />
        <SecretManagerRegionField methods={methods} regions={regions} />
        <SecretManagerNameField methods={methods} />
      </Section>
    </>
  )
}
