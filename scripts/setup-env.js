#!/usr/bin/env node

/**
 * Environment Setup Helper
 * 
 * This script helps developers set up their local environment variables
 * and ensures consistent configuration across environments.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Define the paths
const rootDir = path.resolve(__dirname, '..');
const exampleEnvPath = path.join(rootDir, '.env.example');
const localEnvPath = path.join(rootDir, '.env.local');

// List of critical environment variables that must be set
const CRITICAL_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

// Read the example env file
if (!fs.existsSync(exampleEnvPath)) {
  console.error('Error: .env.example file not found!');
  process.exit(1);
}

const exampleEnvContent = fs.readFileSync(exampleEnvPath, 'utf8');
const envVars = parseEnvFile(exampleEnvContent);

// Check if .env.local already exists
const envLocalExists = fs.existsSync(localEnvPath);
let currentEnvVars = {};

if (envLocalExists) {
  const localEnvContent = fs.readFileSync(localEnvPath, 'utf8');
  currentEnvVars = parseEnvFile(localEnvContent);
  console.log('Found existing .env.local file. Will only prompt for missing variables.');
}

console.log('\n========== CanvaPet Environment Setup ==========');
console.log('This script will help you set up your local environment variables.');
console.log('For CI environments, please configure GitHub secrets directly.');
console.log('===================================================\n');

askForVariables(0);

function askForVariables(index) {
  if (index >= Object.keys(envVars).length) {
    saveEnvFile();
    return;
  }

  const varName = Object.keys(envVars)[index];
  const defaultValue = envVars[varName] || '';
  const currentValue = currentEnvVars[varName] || '';
  
  const isCritical = CRITICAL_VARS.includes(varName);
  const criticalTag = isCritical ? ' (REQUIRED)' : '';
  
  if (currentValue && !process.argv.includes('--reset')) {
    console.log(`${varName}${criticalTag}: Using existing value`);
    envVars[varName] = currentValue;
    askForVariables(index + 1);
  } else {
    rl.question(`${varName}${criticalTag} ${defaultValue ? `(default: ${defaultValue})` : ''}: `, (answer) => {
      envVars[varName] = answer || defaultValue;
      
      if (isCritical && !envVars[varName]) {
        console.log(`Warning: ${varName} is required and has no value. Please provide a value.`);
        askForVariables(index); // Re-ask for this variable
      } else {
        askForVariables(index + 1);
      }
    });
  }
}

function saveEnvFile() {
  let content = '';
  
  for (const [key, value] of Object.entries(envVars)) {
    content += `${key}=${value}\n`;
  }
  
  fs.writeFileSync(localEnvPath, content);
  console.log(`\nEnvironment variables saved to ${localEnvPath}`);
  console.log('Note: This file is ignored by .gitignore and .cursorignore to protect secrets.');
  console.log('\nFor CI/CD, ensure these variables are set as GitHub secrets:');
  CRITICAL_VARS.forEach(variable => {
    console.log(`- ${variable}`);
  });
  
  rl.close();
}

function parseEnvFile(content) {
  const result = {};
  const lines = content.split('\n');
  
  lines.forEach(line => {
    // Skip comments and empty lines
    if (!line || line.startsWith('#')) return;
    
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      result[key] = value;
    }
  });
  
  return result;
} 