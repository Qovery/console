import { type TerraformRequestDockerfileFragment } from 'qovery-typescript-axios'
import { type DockerfileFragmentSource } from '../terraform-general-data/terraform-general-data'

export function extractDockerfileFragmentFields(fragment: TerraformRequestDockerfileFragment | null | undefined): {
  dockerfile_fragment_source: DockerfileFragmentSource
  dockerfile_fragment_path?: string
  dockerfile_fragment_content?: string
} {
  if (!fragment) {
    return { dockerfile_fragment_source: 'none' }
  }
  if (fragment.type === 'file' && 'path' in fragment) {
    return {
      dockerfile_fragment_source: 'file',
      dockerfile_fragment_path: fragment.path,
    }
  }
  if (fragment.type === 'inline' && 'content' in fragment) {
    return {
      dockerfile_fragment_source: 'inline',
      dockerfile_fragment_content: fragment.content,
    }
  }
  return { dockerfile_fragment_source: 'none' }
}
