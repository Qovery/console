export type BuildOptimizationConfidence = 'HIGH' | 'MEDIUM' | 'LOW'

export interface BuildOptimizationAnalysis {
  confidence: BuildOptimizationConfidence
  estimatedTimeSavedSec: { min: number; max: number }
  reviewedAssets: string[]
  summary: string
  improvements: string[]
  // Instructions to hand over to an AI coding agent
  agentPrompt: string
}

// TODO: replace with the analysis of the build from the API once it exists
export const SAMPLE_BUILD_OPTIMIZATION_ANALYSIS: BuildOptimizationAnalysis = {
  confidence: 'HIGH',
  estimatedTimeSavedSec: { min: 50, max: 90 },
  reviewedAssets: ['Dockerfile', '.dockerignore', 'Build logs', 'Build settings'],
  summary:
    'The dependency install step is not cached: npm ci ran from scratch in this build (~55s) because the source code is copied before package.json. Any code change invalidates that layer. The final image also ships with build tools and node_modules (~480 MB), which slows down the push.',
  improvements: [
    'Copy package.json and package-lock.json before the rest of the code, so the install stays cached until dependencies change',
    'Use a multi-stage build and keep only dist/ in an nginx:alpine image',
    'Add a .dockerignore (node_modules, .git, *.log). The build context sent in this build was 210 MB',
  ],
  agentPrompt: `Speed up the Docker build of this Node.js app without changing its behavior:
1. In the Dockerfile, copy package.json and package-lock.json and run npm ci before copying the rest of the source code, so the dependency layer stays cached until dependencies change.
2. Use a multi-stage build: build the app in a node image, then copy only the dist/ folder into an nginx:alpine image.
3. Add a .dockerignore excluding node_modules, .git and *.log, to shrink the build context (210 MB today).
Explain each change in the pull request description.`,
}
