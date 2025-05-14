#!/usr/bin/env node

/**
 * Accessibility Audit Script
 * 
 * This script helps automate accessibility audits for the CanvaPet application,
 * focusing on keyboard navigation issues.
 * 
 * It uses Axe-core (via Playwright) to scan the application and generate reports
 * on accessibility issues, particularly focusing on keyboard navigation.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// URLs to test - add important application pages here
const PAGES_TO_TEST = [
  'http://localhost:3000/', // Home page
  'http://localhost:3000/pets/new', // Create new pet
  'http://localhost:3000/pets/upload', // Upload pet
  'http://localhost:3000/profile/gallery', // User gallery
  'http://localhost:3000/merch', // Merchandise
  'http://localhost:3000/auth/signin', // Sign in page
];

// Main accessibility audit function
async function runAccessibilityAudit() {
  console.log(chalk.blue('\n🔍 Starting Accessibility Audit\n'));
  
  // Create output directory if it doesn't exist
  const reportDir = path.join(__dirname, '..', 'accessibility-reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  // Initialize results object
  const auditResults = {
    timestamp: new Date().toISOString(),
    summary: {
      totalIssues: 0,
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0,
    },
    pageResults: [],
  };

  // Launch browser
  const browser = await chromium.launch();
  const context = await browser.newContext();
  
  // Inject axe-core into the page
  await context.addInitScript({
    path: require.resolve('axe-core/axe.min.js')
  });
  
  const page = await context.newPage();
  
  // Test each page
  for (const url of PAGES_TO_TEST) {
    console.log(chalk.cyan(`Testing page: ${url}`));
    
    try {
      // Navigate to page
      await page.goto(url, { waitUntil: 'networkidle' });
      
      // Run axe analysis
      const accessibilityScanResults = await page.evaluate(() => {
        return new Promise(resolve => {
          // Focus on keyboard accessibility issues
          const options = {
            runOnly: {
              type: 'tag',
              values: ['keyboard', 'focus', 'tabindex'],
            }
          };
          
          window.axe.run(document, options).then(results => {
            resolve(results);
          });
        });
      });
      
      // Process and categorize results
      const pageResult = {
        url,
        violations: accessibilityScanResults.violations,
        passes: accessibilityScanResults.passes,
        incomplete: accessibilityScanResults.incomplete,
        issueCount: accessibilityScanResults.violations.length,
      };
      
      // Update summary statistics
      auditResults.summary.totalIssues += pageResult.issueCount;
      accessibilityScanResults.violations.forEach(violation => {
        switch (violation.impact) {
          case 'critical': auditResults.summary.critical++; break;
          case 'serious': auditResults.summary.serious++; break;
          case 'moderate': auditResults.summary.moderate++; break;
          case 'minor': auditResults.summary.minor++; break;
        }
      });
      
      auditResults.pageResults.push(pageResult);
      
      // Log immediate results
      if (pageResult.issueCount > 0) {
        console.log(chalk.yellow(`  Found ${pageResult.issueCount} keyboard accessibility issues`));
      } else {
        console.log(chalk.green('  No keyboard accessibility issues found'));
      }
      
    } catch (error) {
      console.error(chalk.red(`Error testing ${url}: ${error.message}`));
      auditResults.pageResults.push({
        url,
        error: error.message,
        issueCount: 0,
      });
    }
  }
  
  // Close browser
  await browser.close();
  
  // Generate detailed report
  const reportPath = path.join(reportDir, `keyboard-a11y-audit-${new Date().toISOString().replace(/:/g, '-')}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(auditResults, null, 2));
  
  // Generate summary report
  const summaryPath = path.join(reportDir, 'keyboard-a11y-summary.md');
  
  let summaryContent = `# Keyboard Accessibility Audit Summary\n\n`;
  summaryContent += `*Generated on: ${new Date().toLocaleString()}*\n\n`;
  summaryContent += `## Overall Statistics\n\n`;
  summaryContent += `- Total Issues: ${auditResults.summary.totalIssues}\n`;
  summaryContent += `- Critical: ${auditResults.summary.critical}\n`;
  summaryContent += `- Serious: ${auditResults.summary.serious}\n`;
  summaryContent += `- Moderate: ${auditResults.summary.moderate}\n`;
  summaryContent += `- Minor: ${auditResults.summary.minor}\n\n`;
  
  summaryContent += `## Page-by-Page Results\n\n`;
  
  auditResults.pageResults.forEach(result => {
    summaryContent += `### ${result.url}\n\n`;
    
    if (result.error) {
      summaryContent += `- ❌ Error during testing: ${result.error}\n\n`;
      return;
    }
    
    if (result.issueCount === 0) {
      summaryContent += `- ✅ No keyboard accessibility issues found\n\n`;
      return;
    }
    
    summaryContent += `- Found ${result.issueCount} keyboard accessibility issues\n\n`;
    
    if (result.violations && result.violations.length > 0) {
      summaryContent += `#### Issues\n\n`;
      
      result.violations.forEach(violation => {
        summaryContent += `- **${violation.impact.toUpperCase()}**: ${violation.help} (${violation.id})\n`;
        summaryContent += `  - ${violation.description}\n`;
        summaryContent += `  - Affected elements: ${violation.nodes.length}\n`;
        summaryContent += `  - [More info](${violation.helpUrl})\n\n`;
      });
    }
  });
  
  summaryContent += `\n## Next Steps\n\n`;
  summaryContent += `1. Prioritize fixing critical and serious issues\n`;
  summaryContent += `2. Review each page in order of most to least issues\n`;
  summaryContent += `3. Check the detailed JSON report for specific element selectors\n`;
  summaryContent += `4. Implement fixes and run the audit again to confirm improvements\n`;
  
  fs.writeFileSync(summaryPath, summaryContent);
  
  // Final output
  console.log(chalk.blue('\n📊 Accessibility Audit Complete'));
  console.log(chalk.green(`\nDetailed report saved to: ${reportPath}`));
  console.log(chalk.green(`Summary report saved to: ${summaryPath}`));
  console.log(chalk.yellow(`\nTotal keyboard accessibility issues found: ${auditResults.summary.totalIssues}`));
  
  return auditResults;
}

// Manual audit checklist generator
function generateManualAuditChecklist() {
  console.log(chalk.blue('\n📋 Generating Manual Keyboard Accessibility Audit Checklist\n'));
  
  const checklistPath = path.join(__dirname, '..', 'accessibility-reports', 'manual-keyboard-audit-checklist.md');
  
  let checklistContent = `# Manual Keyboard Accessibility Audit Checklist\n\n`;
  checklistContent += `*Generated on: ${new Date().toLocaleString()}*\n\n`;
  
  checklistContent += `## Instructions\n\n`;
  checklistContent += `1. For each page, use only the keyboard (no mouse) to complete all listed tasks\n`;
  checklistContent += `2. Use Tab to navigate forward, Shift+Tab to navigate backward\n`;
  checklistContent += `3. Use Enter/Space to activate buttons, links, and other controls\n`;
  checklistContent += `4. Use arrow keys for certain interactive elements like dropdowns\n`;
  checklistContent += `5. Document any issues encountered with each task\n\n`;
  
  checklistContent += `## Key Areas to Check\n\n`;
  checklistContent += `- [ ] Tab order follows a logical sequence\n`;
  checklistContent += `- [ ] All interactive elements are reachable by keyboard\n`;
  checklistContent += `- [ ] Focus indicators are visible for all interactive elements\n`;
  checklistContent += `- [ ] No keyboard traps (can't tab out of an element)\n`;
  checklistContent += `- [ ] Modal dialogs trap focus properly\n`;
  checklistContent += `- [ ] Custom components follow expected keyboard patterns\n`;
  checklistContent += `- [ ] Skip links are available for bypassing navigation\n\n`;
  
  checklistContent += `## Pages to Test\n\n`;
  
  // Add each page and relevant tasks
  checklistContent += `### Home Page\n\n`;
  checklistContent += `- [ ] Navigate to all main navigation links\n`;
  checklistContent += `- [ ] Access all featured content sections\n`;
  checklistContent += `- [ ] Use any carousel or tabbed interfaces\n`;
  checklistContent += `- [ ] Access main call-to-action buttons\n`;
  checklistContent += `- [ ] Open and navigate dropdowns/menus\n\n`;
  
  checklistContent += `### Pet Creation/Upload\n\n`;
  checklistContent += `- [ ] Fill out all form fields\n`;
  checklistContent += `- [ ] Upload a file\n`;
  checklistContent += `- [ ] Navigate between form steps (if multi-step)\n`;
  checklistContent += `- [ ] Submit the form\n`;
  checklistContent += `- [ ] Access form validation errors\n\n`;
  
  checklistContent += `### User Gallery\n\n`;
  checklistContent += `- [ ] Navigate between gallery items\n`;
  checklistContent += `- [ ] Interact with gallery controls\n`;
  checklistContent += `- [ ] Open and navigate detail views\n`;
  checklistContent += `- [ ] Use filtering/sorting controls\n`;
  checklistContent += `- [ ] Access edit/delete functionality\n\n`;
  
  checklistContent += `### Merchandise Page\n\n`;
  checklistContent += `- [ ] Browse merchandise items\n`;
  checklistContent += `- [ ] Use product filters\n`;
  checklistContent += `- [ ] Access product details\n`;
  checklistContent += `- [ ] Add items to cart\n`;
  checklistContent += `- [ ] Complete checkout process\n\n`;
  
  checklistContent += `### Authentication\n\n`;
  checklistContent += `- [ ] Navigate login form\n`;
  checklistContent += `- [ ] Navigate registration form\n`;
  checklistContent += `- [ ] Access password recovery\n`;
  checklistContent += `- [ ] Submit forms and handle errors\n\n`;
  
  checklistContent += `## Results Template\n\n`;
  checklistContent += `For each issue found, document using this format:\n\n`;
  checklistContent += `- **Page**: [page name]\n`;
  checklistContent += `- **Element**: [button, link, form field, etc.]\n`;
  checklistContent += `- **Issue**: [describe the problem]\n`;
  checklistContent += `- **Expected Behavior**: [what should happen]\n`;
  checklistContent += `- **Current Behavior**: [what actually happens]\n`;
  checklistContent += `- **Screenshot/Recording**: [if applicable]\n`;
  checklistContent += `- **Priority**: [Critical/High/Medium/Low]\n`;
  
  fs.writeFileSync(checklistPath, checklistContent);
  
  console.log(chalk.green(`Manual audit checklist created at: ${checklistPath}`));
}

// Execute audit if called directly
if (require.main === module) {
  console.log(chalk.blue('Keyboard Accessibility Audit Tool'));
  console.log(chalk.blue('============================\n'));
  
  // Create directory for reports
  const reportDir = path.join(__dirname, '..', 'accessibility-reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  // Generate manual audit checklist
  generateManualAuditChecklist();
  
  // Check if dev server is running
  console.log(chalk.yellow('\nTo run the automated audit:'));
  console.log('1. Make sure your development server is running (npm run dev)');
  console.log('2. Run this script again with the --audit flag');
  console.log('\nExample: node scripts/accessibility-audit.js --audit\n');
  
  // Check command arguments
  if (process.argv.includes('--audit')) {
    // Run the automated audit
    runAccessibilityAudit()
      .catch(err => {
        console.error(chalk.red('Error running accessibility audit:'), err);
        process.exit(1);
      });
  }
}

// Export functions for use in other scripts
module.exports = {
  runAccessibilityAudit,
  generateManualAuditChecklist
}; 