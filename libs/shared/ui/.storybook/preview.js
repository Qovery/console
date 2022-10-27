import { addDecorator } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'
import '../src/lib/styles/main.scss'

addDecorator((story) => <MemoryRouter initialEntries={['/']}>{story()}</MemoryRouter>)
