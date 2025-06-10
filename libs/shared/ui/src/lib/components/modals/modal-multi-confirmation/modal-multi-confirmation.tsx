import * as Dialog from '@radix-ui/react-dialog'
import { type PropsWithChildren, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Button from '../../button/button'
import { Callout } from '../../callout/callout'
import { Checkbox } from '../../checkbox/checkbox'
import { Heading } from '../../heading/heading'
import { Icon } from '../../icon/icon'
import useModal from '../../modal/use-modal/use-modal'
import { Section } from '../../section/section'

export interface ModalMultiConfirmationProps extends PropsWithChildren {
  title: string
  checks: string[]
  callback: () => void
  description?: ReactNode
  warning?: ReactNode
  ctaButton?: string
  isDelete?: boolean
}

export function ModalMultiConfirmation({
  title,
  description,
  callback,
  warning,
  isDelete = false,
  ctaButton = 'Confirm',
  children,
  checks,
}: ModalMultiConfirmationProps) {
  const {
    handleSubmit,
    control,
    formState: { isValid },
  } = useForm()
  const { closeModal } = useModal()

  const onSubmit = handleSubmit((data) => {
    if (data) {
      closeModal()
      callback()
    }
  })

  return (
    <Section className="p-5">
      <Dialog.Title asChild>
        <Heading level={1} className="mb-2 max-w-sm text-2xl text-neutral-400">
          {title}
        </Heading>
      </Dialog.Title>
      <Dialog.Description className="mb-6 text-sm text-neutral-350">{description}</Dialog.Description>

      <form onSubmit={onSubmit}>
        {children}
        {(warning || checks) && (
          <Callout.Root className="mb-5 grid grid-cols-[1fr_auto] gap-y-3" color="red">
            <Callout.Icon>
              <Icon iconName="triangle-exclamation" className="text-red-600" />
            </Callout.Icon>

            <Callout.Text>
              <div className="flex flex-col gap-3">
                <div className="font-semibold">{warning}</div>
              </div>
            </Callout.Text>

            <Callout.Text className="col-span-2 flex flex-col gap-2">
              {checks &&
                checks.map((check) => (
                  <div key={check}>
                    <Controller
                      name={check.toLowerCase().replace(' ', '_')}
                      control={control}
                      rules={{
                        required: 'Please check the box to confirm.',
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <div className="flex flex-col gap-3">
                          <div className="ml-[2px] flex items-start gap-3">
                            <Checkbox
                              name={field.name}
                              id={field.name}
                              className="mt-0.5 shrink-0"
                              color="red"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <label htmlFor={field.name}>{check}</label>
                          </div>
                          {error && <p className="text-sm text-red-500">{error.message}</p>}
                        </div>
                      )}
                    />
                  </div>
                ))}
            </Callout.Text>
          </Callout.Root>
        )}
        <div className="flex justify-end gap-3">
          <Button type="button" color="neutral" variant="plain" size="lg" onClick={() => closeModal()}>
            Cancel
          </Button>
          <Button type="submit" size="lg" color={isDelete ? 'red' : 'brand'} disabled={!isValid}>
            {ctaButton}
          </Button>
        </div>
      </form>
    </Section>
  )
}

export default ModalMultiConfirmation
