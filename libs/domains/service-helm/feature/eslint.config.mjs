import nx from '@nx/eslint-plugin'
import baseConfig from '../../../../eslint.config.mjs'

export default [...nx.configs['flat/react'], ...baseConfig]
