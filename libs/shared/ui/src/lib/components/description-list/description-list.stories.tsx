import type { Meta } from '@storybook/react'
import { DescriptionList } from './description-list'

const Story: Meta<typeof DescriptionList.Root> = {
  component: DescriptionList.Root,
  title: 'Description List',
  decorators: [
    (Story) => (
      <div style={{ background: 'white', padding: '3em' }}>
        <Story />
      </div>
    ),
  ],
}
export default Story

export const Primary = {
  render: () => (
    <DescriptionList.Root>
      <DescriptionList.Term>Name:</DescriptionList.Term>
      <DescriptionList.Details>Foobar</DescriptionList.Details>

      <DescriptionList.Term>Version:</DescriptionList.Term>
      <DescriptionList.Details>1.2.3</DescriptionList.Details>
    </DescriptionList.Root>
  ),
}
