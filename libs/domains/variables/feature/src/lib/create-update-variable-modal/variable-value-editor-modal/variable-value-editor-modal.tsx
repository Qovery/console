import * as Dialog from '@radix-ui/react-dialog'
import { type FormEventHandler, useEffect } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { type VariableScope } from '@qovery/domains/variables/data-access'
import { Button, CodeEditor, Icon, ModalCrud } from '@qovery/shared/ui'
import { CodeEditorVariable } from '../../code-editor-variable/code-editor-variable'

type VariableValueEditorModalScope = Extract<VariableScope, 'APPLICATION' | 'CONTAINER' | 'JOB' | 'HELM' | 'TERRAFORM'>

const VALUE_EDITOR_HEIGHT = 'calc(100vh - 238px)'

export interface VariableValueEditorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  value?: string | null
  onSave: (value: string) => void
  title: string
  description: string
  language: string
  environmentId?: string
  serviceId?: string
  scope?: VariableValueEditorModalScope
}

export function VariableValueEditorModal({
  open,
  onOpenChange,
  value,
  onSave,
  title,
  description,
  language,
  environmentId,
  serviceId,
  scope,
}: VariableValueEditorModalProps) {
  const methods = useForm<{ value: string }>({
    mode: 'onChange',
    defaultValues: {
      value: value ?? '',
    },
  })

  useEffect(() => {
    if (open) {
      methods.reset({ value: value ?? '' })
    }
  }, [methods, open, value])

  const handleClose = () => onOpenChange(false)
  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.stopPropagation()

    return methods.handleSubmit(({ value }) => {
      onSave(value)
      handleClose()
    })(event)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background-overlay" />
        <Dialog.Content
          data-testid="value-full-screen-editor"
          className="fixed left-1/2 top-6 z-modal h-[calc(100vh-48px)] w-[calc(100vw-48px)] -translate-x-1/2 rounded-md border border-neutral bg-background shadow-[0_0_32px_rgba(0,0,0,0.08)]"
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <Dialog.Description className="sr-only">{description}</Dialog.Description>
          <div className="h-full overflow-auto">
            <Button
              type="button"
              onClick={handleClose}
              aria-label="Close fullscreen editor"
              variant="plain"
              size="md"
              radius="full"
              className="absolute right-4 top-4"
              iconOnly
            >
              <Icon iconName="xmark" iconStyle="solid" />
            </Button>
            <FormProvider {...methods}>
              <ModalCrud
                title={title}
                description={description}
                onSubmit={handleSubmit}
                onClose={handleClose}
                submitLabel="Confirm"
              >
                <div className="overflow-hidden rounded-md border border-neutral">
                  <Controller
                    name="value"
                    control={methods.control}
                    render={({ field }) =>
                      environmentId ? (
                        <CodeEditorVariable
                          environmentId={environmentId}
                          serviceId={serviceId}
                          scope={scope}
                          width="100%"
                          height={VALUE_EDITOR_HEIGHT}
                          language={language}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      ) : (
                        <CodeEditor
                          width="100%"
                          height={VALUE_EDITOR_HEIGHT}
                          language={language}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )
                    }
                  />
                </div>
              </ModalCrud>
            </FormProvider>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default VariableValueEditorModal
