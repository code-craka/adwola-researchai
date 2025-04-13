import { simpleGit } from 'simple-git';
import fs from 'fs/promises';
import path from 'path';

// GitHub repository URL
const GITHUB_REPO_URL = 'https://github.com/code-craka/adwola-researchai.git';

// Initialize Git repository and push to GitHub
async function initializeAndPushToGitHub() {
  try {
    console.log('Starting Git repository initialization process...');
    
    // Initialize simple-git
    const git = simpleGit();
    
    // Check if .git directory already exists
    try {
      await fs.access('.git');
      console.log('Git repository already initialized.');
    } catch (error) {
      // Initialize Git repository
      console.log('Initializing Git repository...');
      await git.init();
      console.log('Git repository initialized successfully.');
    }
    
    // Create README.md file if it doesn't exist
    try {
      await fs.access('README.md');
      console.log('README.md already exists.');
    } catch (error) {
      console.log('Creating README.md file...');
      const readmeContent = `# Adwola Research AI

A powerful AI-driven platform for transforming research papers into engaging presentations, podcasts, and visual content.

## Features

- Document upload and processing
- AI-powered content extraction
- Multiple output formats (presentations, podcasts, visuals)
- Collaboration tools
- Version control

## Getting Started

1. Clone the repository
2. Install dependencies with \`npm install\`
3. Set up environment variables
4. Run the development server with \`npm run dev\`

## Technologies

- Next.js
- React
- Tailwind CSS
- Framer Motion
- OpenAI
- AWS S3
`;
      await fs.writeFile('README.md', readmeContent);
      console.log('README.md created successfully.');
    }
    
    // Check Git status
    const status = await git.status();
    
    // Add files if there are changes
    if (status.not_added.length > 0 || status.modified.length > 0) {
      console.log('Adding files to Git...');
      await git.add('.');
      console.log('Files added successfully.');
      
      // Commit changes
      console.log('Committing changes...');
      await git.commit('Initial commit');
      console.log('Changes committed successfully.');
    } else {
      console.log('No changes to commit.');
    }
    
    // Get current branch name
    const branchSummary = await git.branch();
    const currentBranch = branchSummary.current;
    
    // Rename branch to 'main' if it's not already named 'main'
    if (currentBranch !== 'main') {
      console.log(`Renaming branch from '${currentBranch}' to 'main'...`);
      await git.branch(['-M', 'main']);
      console.log('Branch renamed to main successfully.');
    } else {
      console.log('Branch is already named main.');
    }
    
    // Check if remote origin exists
    try {
      const remotes = await git.getRemotes();
      const originExists = remotes.some(remote => remote.name === 'origin');
      
      if (!originExists) {
        // Add remote origin
        console.log('Adding remote origin...');
        await git.addRemote('origin', GITHUB_REPO_URL);
        console.log('Remote origin added successfully.');
      } else {
        console.log('Remote origin already exists.');
      }
    } catch (error) {
      console.log('Adding remote origin...');
      await git.addRemote('origin', GITHUB_REPO_URL);
      console.log('Remote origin added successfully.');
    }
    
    // Push to GitHub
    console.log('Pushing to GitHub...');
    await git.push('origin', 'main', ['--set-upstream']);
    console.log('Successfully pushed to GitHub!');
    
    console.log('\n✅ Git repository initialization and GitHub push completed successfully!');
    console.log(`Repository URL: ${GITHUB_REPO_URL}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the function
initializeAndPushToGitHub();