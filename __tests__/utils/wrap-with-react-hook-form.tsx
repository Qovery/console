import { type ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

/**
 * Testing Library utility function to wrap tested component in React Hook Form
 * @param {ReactElement} ui A React component
 * @param objectParameters
 * @param {Object} objectParameters.defaultValues Initial form values to pass into
 * React Hook Form, which you can then assert against
 */
export function wrapWithReactHookForm<T extends { [x: string]: any } | undefined>(
  ui: ReactNode,
  { defaultValues }: { defaultValues?: T } = {}
) {
  const Wrapper = ({ children }: { children: ReactNode }) => {
    const methods = useForm({ defaultValues, mode: 'all' })
    return <FormProvider {...methods}>{children}</FormProvider>
  }

  return <Wrapper>{ui}</Wrapper>
}
