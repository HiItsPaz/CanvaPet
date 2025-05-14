---
description: when updating the readme file
globs: 
alwaysApply: false
---
# README Maintenance Guidelines

## Structure

- **Essential Sections**
  - Project Title and Description
  - Installation Instructions
  - Usage Examples
  - Configuration Options
  - Contributing Guidelines
  - License Information

- **Optional Sections**
  - Screenshots/Demo
  - API Documentation
  - Roadmap
  - Troubleshooting/FAQ

## Content Standards

- **Installation Instructions**
  ```markdown
  ## Installation
  
  1. Clone the repository:
     ```bash
     git clone https://github.com/username/repo.git
     cd repo
     ```
  
  2. Install dependencies:
     ```bash
     npm install
     ```
  
  3. Set up environment variables:
     ```bash
     cp .env.example .env.local
     # Edit .env.local with your values
     ```
  ```

- **Usage Examples**
  ```markdown
  ## Usage
  
  Run the development server:
  ```bash
  npm run dev
  ```
  
  Visit http://localhost:3000 in your browser.
  ```

## Update Frequency

- Update README after:
  - Adding new features
  - Changing installation steps
  - Updating requirements
  - Modifying configuration options

See [800-manual-setup.md](mdc:.roo/rules/800-manual-setup.md) for detailed setup documentation guidelines.
