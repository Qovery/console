import type { Meta } from '@storybook/react'
import Editor from './editor'

const example = `labels: 
  qovery.labels.service
  mylabel: mylabel
  mylabel: mylabel
  mylabel: mylabel
  mylabel: mylabel
  mylabel: mylabel 

postgres: 
  dabatase_url: qovery.env.DATABASE_URL 
  database_user: qovery.env.DATABASE_USER 
  dabatase_url: qovery.env.DATABASE_URL 
  database_user: qovery.env.DATABASE_USER 
  dabatase_url: qovery.env.DATABASE_URL 
  database_user: qovery.env.DATABASE_USER 
  database_user: qovery.env.DATABASE_USER 
  dabatase_url: qovery.env.DATABASE_URL 
  database_user: qovery.env.DATABASE_USER 
  database_user: qovery.env.DATABASE_USER 
  dabatase_url: qovery.env.DATABASE_URL 
  database_user: qovery.env.DATABASE_USER 
  database_user: qovery.env.DATABASE_USER 
  dabatase_url: qovery.env.DATABASE_URL 
  database_user: qovery.env.DATABASE_USER 
`

const Story: Meta<typeof Editor> = {
  component: Editor,
  title: 'Editor',
  decorators: [
    (Story) => (
      <div style={{ background: 'white', padding: '1em' }}>
        <Story />
      </div>
    ),
  ],
}

export const Primary = {
  args: {
    height: '90vh',
    defaultLanguage: 'yaml',
    defaultValue: example,
  },
}

export default Story
