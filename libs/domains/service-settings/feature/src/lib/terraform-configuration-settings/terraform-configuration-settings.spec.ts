import {
  type TerraformGeneralData,
  buildDockerfileFragment,
  extractDockerfileFragmentFields,
} from './terraform-configuration-settings'

describe('Dockerfile Fragment utility functions', () => {
  describe('buildDockerfileFragment', () => {
    it('should return null when source is "none"', () => {
      const data = { dockerfile_fragment_source: 'none' } as TerraformGeneralData
      expect(buildDockerfileFragment(data)).toBeNull()
    })

    it('should return null when source is "file" but path is empty', () => {
      const data = {
        dockerfile_fragment_source: 'file',
        dockerfile_fragment_path: '',
      } as TerraformGeneralData
      expect(buildDockerfileFragment(data)).toBeNull()
    })

    it('should return null when source is "file" but path is undefined', () => {
      const data = {
        dockerfile_fragment_source: 'file',
        dockerfile_fragment_path: undefined,
      } as TerraformGeneralData
      expect(buildDockerfileFragment(data)).toBeNull()
    })

    it('should return file fragment when source is "file" with valid path', () => {
      const data = {
        dockerfile_fragment_source: 'file',
        dockerfile_fragment_path: '/scripts/install-tools.dockerfile',
      } as TerraformGeneralData
      expect(buildDockerfileFragment(data)).toEqual({
        type: 'file',
        path: '/scripts/install-tools.dockerfile',
      })
    })

    it('should return null when source is "inline" but content is empty', () => {
      const data = {
        dockerfile_fragment_source: 'inline',
        dockerfile_fragment_content: '',
      } as TerraformGeneralData
      expect(buildDockerfileFragment(data)).toBeNull()
    })

    it('should return null when source is "inline" but content is undefined', () => {
      const data = {
        dockerfile_fragment_source: 'inline',
        dockerfile_fragment_content: undefined,
      } as TerraformGeneralData
      expect(buildDockerfileFragment(data)).toBeNull()
    })

    it('should return inline fragment when source is "inline" with valid content', () => {
      const data = {
        dockerfile_fragment_source: 'inline',
        dockerfile_fragment_content: 'RUN apt-get update && apt-get install -y curl',
      } as TerraformGeneralData
      expect(buildDockerfileFragment(data)).toEqual({
        type: 'inline',
        content: 'RUN apt-get update && apt-get install -y curl',
      })
    })

    it('should return null for unknown source type', () => {
      const data = {
        dockerfile_fragment_source: 'unknown' as 'none',
      } as TerraformGeneralData
      expect(buildDockerfileFragment(data)).toBeNull()
    })
  })

  describe('extractDockerfileFragmentFields', () => {
    it('should return "none" source when fragment is null', () => {
      expect(extractDockerfileFragmentFields(null)).toEqual({
        dockerfile_fragment_source: 'none',
      })
    })

    it('should return "none" source when fragment is undefined', () => {
      expect(extractDockerfileFragmentFields(undefined)).toEqual({
        dockerfile_fragment_source: 'none',
      })
    })

    it('should extract file fragment fields correctly', () => {
      const fragment = { type: 'file' as const, path: '/scripts/install.dockerfile' }
      expect(extractDockerfileFragmentFields(fragment)).toEqual({
        dockerfile_fragment_source: 'file',
        dockerfile_fragment_path: '/scripts/install.dockerfile',
      })
    })

    it('should extract inline fragment fields correctly', () => {
      const fragment = { type: 'inline' as const, content: 'RUN apt-get update' }
      expect(extractDockerfileFragmentFields(fragment)).toEqual({
        dockerfile_fragment_source: 'inline',
        dockerfile_fragment_content: 'RUN apt-get update',
      })
    })

    it('should return "none" for unknown fragment type', () => {
      const fragment = { type: 'unknown' } as { type: 'file'; path: string }
      expect(extractDockerfileFragmentFields(fragment)).toEqual({
        dockerfile_fragment_source: 'none',
      })
    })
  })

  describe('buildDockerfileFragment and extractDockerfileFragmentFields roundtrip', () => {
    it('should roundtrip file fragment correctly', () => {
      const original = {
        dockerfile_fragment_source: 'file',
        dockerfile_fragment_path: '/path/to/file.dockerfile',
      } as TerraformGeneralData

      const fragment = buildDockerfileFragment(original)
      const extracted = extractDockerfileFragmentFields(fragment)

      expect(extracted.dockerfile_fragment_source).toBe('file')
      expect(extracted.dockerfile_fragment_path).toBe('/path/to/file.dockerfile')
    })

    it('should roundtrip inline fragment correctly', () => {
      const original = {
        dockerfile_fragment_source: 'inline',
        dockerfile_fragment_content: 'RUN echo "hello"',
      } as TerraformGeneralData

      const fragment = buildDockerfileFragment(original)
      const extracted = extractDockerfileFragmentFields(fragment)

      expect(extracted.dockerfile_fragment_source).toBe('inline')
      expect(extracted.dockerfile_fragment_content).toBe('RUN echo "hello"')
    })

    it('should roundtrip none source correctly', () => {
      const original = {
        dockerfile_fragment_source: 'none',
      } as TerraformGeneralData

      const fragment = buildDockerfileFragment(original)
      const extracted = extractDockerfileFragmentFields(fragment)

      expect(extracted.dockerfile_fragment_source).toBe('none')
      expect(extracted.dockerfile_fragment_path).toBeUndefined()
      expect(extracted.dockerfile_fragment_content).toBeUndefined()
    })
  })
})
