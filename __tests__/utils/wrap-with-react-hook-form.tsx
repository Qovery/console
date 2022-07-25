import { FormProvider, useForm } from 'react-hook-form'
import React from 'react'

/**
 * Testing Library utility function to wrap tested component in React Hook Form
 * @param {ReactElement} ui A React component
 * @param objectParameters
 * @param {Object} objectParameters.defaultValues Initial form values to pass into
 * React Hook Form, which you can then assert against
 */
export function wrapWithReactHookForm(ui: React.ReactElement, { defaultValues = {} } = {}) {
  const Wrapper = ({ children }: { children: React.ReactElement }) => {
    const methods = useForm({ defaultValues, mode: 'onChange' })
    return <FormProvider {...methods}>{children}</FormProvider>
  }

  return <Wrapper>{ui}</Wrapper>
}
