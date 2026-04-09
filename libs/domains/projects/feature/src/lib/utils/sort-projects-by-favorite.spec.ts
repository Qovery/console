import { type Project } from 'qovery-typescript-axios'
import { sortProjectsByFavorite } from './sort-projects-by-favorite'

describe('sortProjectsByFavorite', () => {
  it('should display favorite projects before non favorite projects', () => {
    const projects = [
      { id: '2', name: 'Project B' },
      { id: '1', name: 'Project A' },
      { id: '3', name: 'Project C' },
    ] as Project[]

    const sortedProjects = sortProjectsByFavorite(projects, (projectId) => projectId === '3')

    expect(sortedProjects.map((project) => project.name)).toEqual(['Project C', 'Project A', 'Project B'])
  })

  it('should keep alphabetical order within favorites and non favorite groups', () => {
    const projects = [
      { id: '4', name: 'Zeta' },
      { id: '3', name: 'Beta' },
      { id: '2', name: 'Omega' },
      { id: '1', name: 'Alpha' },
    ] as Project[]

    const sortedProjects = sortProjectsByFavorite(projects, (projectId) => ['3', '4'].includes(projectId))

    expect(sortedProjects.map((project) => project.name)).toEqual(['Beta', 'Zeta', 'Alpha', 'Omega'])
  })

  it('should not mutate the original projects array', () => {
    const projects = [
      { id: '2', name: 'Project B' },
      { id: '1', name: 'Project A' },
    ] as Project[]

    sortProjectsByFavorite(projects, () => false)

    expect(projects.map((project) => project.name)).toEqual(['Project B', 'Project A'])
  })
})
