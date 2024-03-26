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

export const HighlightDetails = {
  render: () => (
    <>
      <div className="dark bg-neutral-550">
        <DescriptionList.Root>
          <DescriptionList.Term>Name:</DescriptionList.Term>
          <DescriptionList.Details>Foobar</DescriptionList.Details>

          <DescriptionList.Term>Version:</DescriptionList.Term>
          <DescriptionList.Details>1.2.3</DescriptionList.Details>
        </DescriptionList.Root>
      </div>
      <DescriptionList.Root>
        <DescriptionList.Term>Name:</DescriptionList.Term>
        <DescriptionList.Details>Foobar</DescriptionList.Details>

        <DescriptionList.Term>Version:</DescriptionList.Term>
        <DescriptionList.Details>1.2.3</DescriptionList.Details>
      </DescriptionList.Root>
    </>
  ),
}

export const HighlightTerm = {
  render: () => (
    <>
      <div className="dark bg-neutral-550">
        <DescriptionList.Root hightlight="term">
          <DescriptionList.Term>Name:</DescriptionList.Term>
          <DescriptionList.Details>Foobar</DescriptionList.Details>

          <DescriptionList.Term>Version:</DescriptionList.Term>
          <DescriptionList.Details>1.2.3</DescriptionList.Details>
        </DescriptionList.Root>
      </div>
      <DescriptionList.Root hightlight="term">
        <DescriptionList.Term>Name:</DescriptionList.Term>
        <DescriptionList.Details>Foobar</DescriptionList.Details>

        <DescriptionList.Term>Version:</DescriptionList.Term>
        <DescriptionList.Details>1.2.3</DescriptionList.Details>
      </DescriptionList.Root>
    </>
  ),
}
