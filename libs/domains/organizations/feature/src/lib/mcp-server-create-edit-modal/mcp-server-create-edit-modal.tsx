import { useParams } from '@tanstack/react-router'
import { type McpServerRequest, type McpServerResponse } from 'qovery-typescript-axios'
import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { Button, Callout, Icon, InputText, InputTextArea, InputTextSmall, ModalCrud, useModal } from '@qovery/shared/ui'
import { useCreateMcpServer } from '../hooks/use-create-mcp-server/use-create-mcp-server'
import { useEditMcpServer } from '../hooks/use-edit-mcp-server/use-edit-mcp-server'

interface HeaderField {
  name: string
  value: string
}

interface McpServerFormValues {
  name: string
  description: string
  url: string
  headers: HeaderField[]
}

export interface McpServerCreateEditModalProps {
  onClose: (response?: McpServerResponse) => void
  mcpServer?: McpServerResponse
}

function isValidHttpsUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && Boolean(url.hostname)
  } catch {
    return false
  }
}

export function McpServerCreateEditModal({ onClose, mcpServer }: McpServerCreateEditModalProps) {
  const { organizationId = '' } = useParams({ strict: false })
  const isEdit = mcpServer !== undefined
  const { enableAlertClickOutside } = useModal()
  const methods = useForm<McpServerFormValues>({
    mode: 'onChange',
    defaultValues: {
      name: mcpServer?.name ?? '',
      description: mcpServer?.description ?? '',
      url: mcpServer?.url ?? '',
      headers: Array.from(mcpServer?.header_names ?? []).map((name) => ({ name, value: '' })),
    },
  })

  methods.watch(() => enableAlertClickOutside(methods.formState.isDirty))

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'headers',
  })
  const { mutateAsync: createMcpServer, isLoading: isCreating } = useCreateMcpServer()
  const { mutateAsync: editMcpServer, isLoading: isEditing } = useEditMcpServer()

  const onSubmit = methods.handleSubmit(async (data) => {
    const headers = data.headers.reduce<Record<string, string>>((result, header) => {
      result[header.name.trim()] = header.value
      return result
    }, {})
    const mcpServerRequest: McpServerRequest = {
      name: data.name.trim(),
      description: data.description.trim() || undefined,
      url: data.url.trim(),
      headers: Object.keys(headers).length > 0 ? headers : undefined,
    }

    try {
      const response = isEdit
        ? await editMcpServer({ organizationId, mcpServerId: mcpServer.id, mcpServerRequest })
        : await createMcpServer({ organizationId, mcpServerRequest })
      onClose(response)
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={isEdit ? 'Edit MCP connector' : 'Add MCP connector'}
        description="Connect a remote HTTPS MCP server to Qovery Agent."
        onClose={onClose}
        onSubmit={onSubmit}
        loading={isCreating || isEditing}
        isEdit={isEdit}
        submitLabel={isEdit ? 'Save connector' : 'Add connector'}
      >
        <div className="space-y-4">
          <Controller
            name="name"
            control={methods.control}
            rules={{
              required: 'Please enter a connector name.',
              validate: (value) => Boolean(value.trim()) || 'Please enter a connector name.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                label="Name"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                error={error?.message}
                autoFocus
              />
            )}
          />
          <Controller
            name="url"
            control={methods.control}
            rules={{
              required: 'Please enter an MCP server URL.',
              validate: (value) => isValidHttpsUrl(value.trim()) || 'Please enter a valid HTTPS URL.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                label="Server URL"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                error={error?.message}
                placeholder="https://example.com/mcp"
              />
            )}
          />
          <Controller
            name="description"
            control={methods.control}
            render={({ field, fieldState: { error } }) => (
              <InputTextArea
                label="Description (optional)"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                error={error?.message}
              />
            )}
          />

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-neutral">HTTP headers</p>
              <p className="text-xs text-neutral-subtle">Header values are encrypted and cannot be viewed again.</p>
            </div>

            {isEdit && fields.length > 0 ? (
              <Callout.Root color="yellow" className="items-start">
                <Callout.Icon>
                  <Icon iconName="triangle-exclamation" />
                </Callout.Icon>
                <Callout.Text>
                  <Callout.TextHeading>Re-enter every header value</Callout.TextHeading>
                  <Callout.TextDescription>
                    Saving replaces all configured headers, so every value is required again.
                  </Callout.TextDescription>
                </Callout.Text>
              </Callout.Root>
            ) : null}

            {fields.length > 0 ? (
              <div className="rounded border border-neutral bg-surface-neutral-subtle p-4">
                <div className="mb-2 grid grid-cols-[1fr_1fr_32px] gap-2 text-xs font-medium text-neutral-subtle">
                  <span>Header name</span>
                  <span>Secret value</span>
                  <span className="sr-only">Actions</span>
                </div>
                <ul className="space-y-3">
                  {fields.map((header, index) => (
                    <li key={header.id} className="grid grid-cols-[1fr_1fr_32px] items-start gap-2">
                      <Controller
                        name={`headers.${index}.name`}
                        control={methods.control}
                        rules={{
                          required: 'Please enter a header name.',
                          validate: (value) => {
                            const normalizedValue = value.trim().toLowerCase()
                            const duplicateCount = methods
                              .getValues('headers')
                              .filter((item) => item.name.trim().toLowerCase() === normalizedValue).length
                            return duplicateCount <= 1 || 'Header names must be unique.'
                          },
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextSmall
                            label={`Header ${index + 1} name`}
                            name={field.name}
                            value={field.value}
                            onChange={(event) => {
                              field.onChange(event)
                              void methods.trigger('headers')
                            }}
                            error={error?.message}
                            placeholder="Authorization"
                            dataTestId={`header-name-${index}`}
                          />
                        )}
                      />
                      <Controller
                        name={`headers.${index}.value`}
                        control={methods.control}
                        rules={{ required: 'Please enter the header value.' }}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextSmall
                            label={`Header ${index + 1} value`}
                            name={field.name}
                            value={field.value}
                            onChange={field.onChange}
                            error={error?.message}
                            type="password"
                            hasShowPasswordButton
                            placeholder="Secret value"
                            dataTestId={`header-value-${index}`}
                          />
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        color="neutral"
                        size="md"
                        iconOnly
                        className="h-9 w-9"
                        aria-label={`Remove header ${index + 1}`}
                        onClick={() => remove(index)}
                      >
                        <Icon iconName="trash-can" iconStyle="regular" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <Button
              type="button"
              variant="outline"
              color="neutral"
              size="sm"
              onClick={() => append({ name: '', value: '' })}
            >
              <Icon iconName="plus" />
              Add header
            </Button>
          </div>
        </div>
      </ModalCrud>
    </FormProvider>
  )
}
