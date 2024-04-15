import { type ComponentMeta, type ComponentStory } from '@storybook/react'
import FunnelFlowBody from '../funnel-flow-body/funnel-flow-body'
import InputSelect from '../inputs/input-select/input-select'
import { FunnelFlow } from './funnel-flow'

export default {
  component: FunnelFlow,
  title: 'FunnelFlow/FunnelFlow',
} as ComponentMeta<typeof FunnelFlow>

const children = (
  <FunnelFlowBody>
    <h1>FunnelFlowBody</h1>

    <InputSelect
      label="Hello"
      options={[
        { label: 'Hello', value: 'hello' },
        { label: 'hell', value: 'o' },
      ]}
      value="o"
    />
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores assumenda deleniti error id in inventore
      iure, obcaecati provident quae ratione reprehenderit similique sunt unde. Earum fugit impedit quod vero voluptate!
    </p>
    <br />
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores assumenda deleniti error id in inventore
      iure, obcaecati provident quae ratione reprehenderit similique sunt unde. Earum fugit impedit quod vero voluptate!
    </p>
    <br />
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores assumenda deleniti error id in inventore
      iure, obcaecati provident quae ratione reprehenderit similique sunt unde. Earum fugit impedit quod vero voluptate!
    </p>
    <br />
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores assumenda deleniti error id in inventore
      iure, obcaecati provident quae ratione reprehenderit similique sunt unde. Earum fugit impedit quod vero voluptate!
    </p>
    <br />
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores assumenda deleniti error id in inventore
      iure, obcaecati provident quae ratione reprehenderit similique sunt unde. Earum fugit impedit quod vero voluptate!
    </p>
    <br />
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores assumenda deleniti error id in inventore
      iure, obcaecati provident quae ratione reprehenderit similique sunt unde. Earum fugit impedit quod vero voluptate!
    </p>
    <br />
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores assumenda deleniti error id in inventore
      iure, obcaecati provident quae ratione reprehenderit similique sunt unde. Earum fugit impedit quod vero voluptate!
    </p>
    <InputSelect
      label="Hellddo"
      options={[
        { label: 'Hello', value: 'hello' },
        { label: 'hell', value: 'o' },
      ]}
      value="o"
    />
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores assumenda deleniti error id in inventore
      iure, obcaecati provident quae ratione reprehenderit similique sunt unde. Earum fugit impedit quod vero voluptate!
    </p>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores assumenda deleniti error id in inventore
      iure, obcaecati provident quae ratione reprehenderit similique sunt unde. Earum fugit impedit quod vero voluptate!
    </p>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores assumenda deleniti error id in inventore
      iure, obcaecati provident quae ratione reprehenderit similique sunt unde. Earum fugit impedit quod vero voluptate!
    </p>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores assumenda deleniti error id in inventore
      iure, obcaecati provident quae ratione reprehenderit similique sunt unde. Earum fugit impedit quod vero voluptate!
    </p>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores assumenda deleniti error id in inventore
      iure, obcaecati provident quae ratione reprehenderit similique sunt unde. Earum fugit impedit quod vero voluptate!
    </p>

    <InputSelect
      label="Hellodsd"
      options={[
        { label: 'Hello', value: 'hello' },
        { label: 'hell', value: 'o' },
      ]}
      value="o"
    />
  </FunnelFlowBody>
)

const Template: ComponentStory<typeof FunnelFlow> = (args) => <FunnelFlow {...args} />

export const Primary = Template.bind({})
Primary.args = {
  currentStep: 1,
  totalSteps: 3,
  currentTitle: 'Create new application',
  exitTo: '/',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onExit: () => {},
  children,
}
