import { Meta, Story } from '@storybook/react'
import { StoryFnReactReturnType } from '@storybook/react/dist/ts3.9/client/preview/types'
import { FC, ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { InputSizeUnit, InputSizeUnitProps } from './input-size-unit'

const StorybookFormProvider = ({ children }: { children: ReactNode }) => {
  const methods = useForm({
    defaultValues: {
      memory: 1024,
    },
  })
  return <FormProvider {...methods}>{children}</FormProvider>
}

export const withRHF =
  () =>
  (Story: FC): StoryFnReactReturnType =>
    (
      <StorybookFormProvider>
        <Story />
      </StorybookFormProvider>
    )

export default {
  component: InputSizeUnit,
  title: 'Inputs/InputSizeUnit',
  decorators: [withRHF()],
} as Meta

const Template: Story<InputSizeUnitProps> = (args) => <InputSizeUnit {...args} />

export const Primary = Template.bind({})
Primary.args = {
  name: 'memory',
  maxSize: 5024,
  currentSize: 512,
}
