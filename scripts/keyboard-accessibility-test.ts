/**
 * Automated Keyboard Accessibility Tests
 * 
 * This script runs automated tests for keyboard navigation functionality
 * across the application, checking for proper focus management, keyboard
 * traps, and other keyboard accessibility issues.
 */

// @ts-ignore -- Playwright will be installed as a dev dependency
import { chromium, devices, Page, Browser, BrowserContext } from 'playwright';
// @ts-ignore -- axe-core will be installed as a dev dependency
import { AxeBuilder } from '@axe-core/playwright';
import * as fs from 'fs';
import * as path from 'path';
// @ts-ignore -- chalk will be installed as a dev dependency
import chalk from 'chalk';

// Configuration
const CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  outputDir: path.join(process.cwd(), 'reports', 'accessibility'),
  routes: [
    { path: '/', name: 'Home' },
    { path: '/pets/new', name: 'New Pet' },
    { path: '/pets/upload', name: 'Upload Pet' },
    { path: '/profile/gallery', name: 'Gallery' },
    { path: '/merch', name: 'Merchandise' },
    { path: '/design/components/buttons', name: 'Buttons Component' },
  ],
  keyboardElements: [
    { selector: 'button', description: 'Buttons' },
    { selector: 'a[href]', description: 'Links' },
    { selector: 'input', description: 'Input fields' },
    { selector: 'select', description: 'Select dropdowns' },
    { selector: '[role="tablist"]', description: 'Tab lists' },
    { selector: '[role="menu"]', description: 'Menus' },
    { selector: '[role="listbox"]', description: 'Listboxes' },
    { selector: '[role="slider"]', description: 'Sliders' },
    { selector: '[role="dialog"]', description: 'Dialogs' },
    { selector: '[aria-haspopup]', description: 'Popup elements' },
  ],
};

// Types
interface AccessibilityViolation {
  id: string;
  impact: string;
  help: string;
  description: string;
  tags: string[];
  nodes: Array<{
    html: string;
    [key: string]: any;
  }>;
}

interface ElementWithoutAccess {
  outerHTML: string;
  innerText?: string;
}

interface KeyboardTrap {
  outerHTML: string;
  role: string;
}

interface FocusedElement {
  tagName: string;
  id: string;
  className: string;
  textContent?: string;
  hasFocusStyle: boolean;
}

// Results tracking
interface TestResult {
  route: string;
  routeName: string;
  issues: Array<{
    type: string;
    element: string;
    details: string;
  }>;
  focusableCount: number;
  tabbableCount: number;
  accessibilityIssues: AccessibilityViolation[];
  success: boolean;
}

interface ReportSummary {
  timestamp: string;
  summary: {
    totalRoutes: number;
    passedRoutes: number;
    failedRoutes: number;
    totalIssues: number;
  };
  results: TestResult[];
}

// Helper functions
async function ensureDirectoryExists(dir: string): Promise<void> {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Main test functions
async function runKeyboardAccessibilityTests(): Promise<void> {
  console.log(chalk.blue('🔑 Starting Keyboard Accessibility Tests'));
  
  await ensureDirectoryExists(CONFIG.outputDir);
  
  const browser = await chromium.launch();
  let results: TestResult[] = [];
  
  try {
    // Test each route with both desktop and mobile views
    const contexts = [
      { context: await browser.newContext(devices['Desktop Chrome']), name: 'desktop' },
      { context: await browser.newContext(devices['iPhone 13']), name: 'mobile' },
    ];
    
    for (const { context, name } of contexts) {
      console.log(chalk.yellow(`\nTesting on ${name} viewport:`));
      
      for (const route of CONFIG.routes) {
        const result = await testRoute(context, route.path, route.name, name);
        results.push(result);
        
        // Save individual route results
        fs.writeFileSync(
          path.join(CONFIG.outputDir, `keyboard-a11y-${name}-${route.name.toLowerCase().replace(/\s/g, '-')}.json`),
          JSON.stringify(result, null, 2)
        );
        
        if (result.success) {
          console.log(chalk.green(`✓ ${route.name}: Passed keyboard accessibility checks`));
        } else {
          console.log(chalk.red(`✗ ${route.name}: Failed keyboard accessibility checks (${result.issues.length} issues)`));
        }
      }
      
      await context.close();
    }
    
    // Save overall report
    const overallReport: ReportSummary = {
      timestamp: new Date().toISOString(),
      summary: {
        totalRoutes: results.length,
        passedRoutes: results.filter(r => r.success).length,
        failedRoutes: results.filter(r => !r.success).length,
        totalIssues: results.reduce((acc, r) => acc + r.issues.length, 0),
      },
      results,
    };
    
    fs.writeFileSync(
      path.join(CONFIG.outputDir, 'keyboard-accessibility-report.json'),
      JSON.stringify(overallReport, null, 2)
    );
    
    // Generate Markdown report
    generateMarkdownReport(overallReport);
    
    const successRate = Math.round((overallReport.summary.passedRoutes / overallReport.summary.totalRoutes) * 100);
    console.log(chalk.blue(`\n📊 Testing complete - Success rate: ${successRate}%`));
    console.log(chalk.blue(`📝 Report saved to ${path.join(CONFIG.outputDir, 'keyboard-accessibility-report.md')}`));
    
    if (overallReport.summary.failedRoutes > 0) {
      console.log(chalk.yellow(`⚠️ Failed routes: ${overallReport.summary.failedRoutes}`));
      process.exit(1);
    }
    
  } catch (error) {
    console.error(chalk.red('Error running keyboard accessibility tests:'), error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

async function testRoute(context: BrowserContext, routePath: string, routeName: string, viewportName: string): Promise<TestResult> {
  const page = await context.newPage();
  await page.goto(`${CONFIG.baseUrl}${routePath}`);
  
  // Allow for client-side navigation and hydration
  await page.waitForTimeout(1000);
  
  const result: TestResult = {
    route: routePath,
    routeName: `${routeName} (${viewportName})`,
    issues: [],
    focusableCount: 0,
    tabbableCount: 0,
    accessibilityIssues: [],
    success: true
  };
  
  // Take a screenshot for reference
  await page.screenshot({ 
    path: path.join(CONFIG.outputDir, `${viewportName}-${routeName.toLowerCase().replace(/\s/g, '-')}.png`),
    fullPage: true
  });
  
  // Run axe for accessibility violations
  const axeResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'keyboard'])
    .analyze();
  
  // Cast violations to our defined type and ignore TS mismatch
  // @ts-ignore
  result.accessibilityIssues = axeResults.violations as unknown as AccessibilityViolation[];
  
  if (axeResults.violations.length > 0) {
    result.success = false;
    
    // Add keyboard-related violations to issues
    for (const violation of axeResults.violations) {
      if (violation.tags.some((tag: string) => 
          tag.includes('keyboard') || 
          tag.includes('focus') || 
          tag.includes('navigation')
      )) {
        for (const node of violation.nodes) {
          result.issues.push({
            type: 'axe-violation',
            element: node.html,
            details: `${violation.help}: ${violation.description}`
          });
        }
      }
    }
  }
  
  // Test keyboard focus order
  try {
    const focusableElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      return elements.length;
    });
    
    result.focusableCount = focusableElements;
    
    // Check for missing tabindex or keyboard access
    for (const element of CONFIG.keyboardElements) {
      const elementsWithoutKeyboardAccess = await page.evaluate((selector: string) => {
        const elements = Array.from(document.querySelectorAll(selector));
        return elements
          .filter(el => {
            // Check for non-interactive elements with click handlers but no keyboard access
            const hasClickHandler = el.hasAttribute('onclick') || 
                                   el.getAttribute('role') === 'button' || 
                                   el.classList.contains('clickable');
            
            // Check if element is focusable via keyboard
            const isFocusable = el.hasAttribute('tabindex') || 
                               el.tagName === 'BUTTON' || 
                               el.tagName === 'A' || 
                               el.tagName === 'INPUT' || 
                               el.tagName === 'SELECT' || 
                               el.tagName === 'TEXTAREA';
            
            return hasClickHandler && !isFocusable;
          })
          .map(el => ({
            outerHTML: el.outerHTML,
            innerText: el.textContent?.trim().substring(0, 50)
          }));
      }, element.selector);
      
      for (const el of elementsWithoutKeyboardAccess) {
        result.issues.push({
          type: 'not-keyboard-accessible',
          element: el.outerHTML,
          details: `${element.description} has click handling but no keyboard access`
        });
        result.success = false;
      }
    }
    
    // Check for keyboard traps
    const keyboardTraps = await page.evaluate(() => {
      // Get all elements that could trap keyboard focus
      const potentialTraps = document.querySelectorAll('dialog, [role="dialog"], [aria-modal="true"]');
      
      const traps = [];
      
      for (const trap of potentialTraps) {
        // Check if it's visible in the DOM
        if (!(trap as HTMLElement).offsetParent) continue;
        
        // Check if it has an escape handler or close button
        const hasEscapeHandler = trap.hasAttribute('data-esc-close') || 
                                trap.querySelector('[aria-label="Close"], [aria-label="close"], .close, .dismiss, button[data-dismiss], .esc-close');
        
        if (!hasEscapeHandler) {
          traps.push({
            outerHTML: trap.outerHTML.substring(0, 200) + '...',
            role: trap.getAttribute('role') || trap.tagName.toLowerCase()
          });
        }
      }
      
      return traps;
    });
    
    for (const trap of keyboardTraps) {
      result.issues.push({
        type: 'keyboard-trap',
        element: trap.outerHTML,
        details: `${trap.role} may trap keyboard focus without escape mechanism`
      });
      result.success = false;
    }
    
    // Simulate keyboard navigation (Tab key press)
    let lastFocusedElement: FocusedElement | null = null;
    let tabCount = 0;
    let maxTabs = Math.min(focusableElements * 2, 50); // Limit to prevent infinite loops
    
    for (let i = 0; i < maxTabs; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100); // Give time for focus to change
      
      const focusedElement = await page.evaluate(() => {
        const active = document.activeElement;
        if (!active || active === document.body) return null;
        return {
          tagName: active.tagName,
          id: active.id,
          className: (active as HTMLElement).className,
          textContent: active.textContent?.substring(0, 50).trim(),
          hasFocusStyle: window.getComputedStyle(active).outlineStyle !== 'none' ||
                         window.getComputedStyle(active).boxShadow !== 'none'
        };
      });
      
      if (focusedElement) {
        tabCount++;
        
        if (!focusedElement.hasFocusStyle) {
          result.issues.push({
            type: 'missing-focus-style',
            element: `<${focusedElement.tagName.toLowerCase()} id="${focusedElement.id}" class="${focusedElement.className}">`,
            details: `Element lacks visible focus style: ${focusedElement.textContent || focusedElement.tagName}`
          });
          result.success = false;
        }
        
        lastFocusedElement = focusedElement;
      }
      
      // Break if we've cycled through all focusable elements
      if (tabCount > 0 && i > tabCount && JSON.stringify(focusedElement) === JSON.stringify(lastFocusedElement)) {
        break;
      }
    }
    
    result.tabbableCount = tabCount;
    
    // Check if we can reach all focusable elements via Tab
    if (tabCount < focusableElements && focusableElements > 0) {
      result.issues.push({
        type: 'unreachable-elements',
        element: 'page',
        details: `Only ${tabCount} of ${focusableElements} focusable elements can be reached with Tab key`
      });
      result.success = false;
    }
    
  } catch (error) {
    console.error(`Error testing keyboard access on ${routePath}:`, error);
    result.issues.push({
      type: 'test-error',
      element: 'page',
      details: `Error testing keyboard access: ${error}`
    });
    result.success = false;
  }
  
  await page.close();
  return result;
}

function generateMarkdownReport(report: ReportSummary): void {
  const timestamp = new Date().toLocaleString();
  let markdown = `# Keyboard Accessibility Test Report\n\n`;
  markdown += `Generated: ${timestamp}\n\n`;
  
  markdown += `## Summary\n\n`;
  markdown += `- **Total Routes Tested:** ${report.summary.totalRoutes}\n`;
  markdown += `- **Passed:** ${report.summary.passedRoutes}\n`;
  markdown += `- **Failed:** ${report.summary.failedRoutes}\n`;
  markdown += `- **Total Issues:** ${report.summary.totalIssues}\n\n`;
  
  markdown += `## Route Details\n\n`;
  
  for (const result of report.results) {
    const icon = result.success ? '✅' : '❌';
    markdown += `### ${icon} ${result.routeName}\n\n`;
    markdown += `- **Path:** \`${result.route}\`\n`;
    markdown += `- **Focusable Elements:** ${result.focusableCount}\n`;
    markdown += `- **Tabbable Elements:** ${result.tabbableCount}\n`;
    markdown += `- **Issues:** ${result.issues.length}\n\n`;
    
    if (result.issues.length > 0) {
      markdown += `#### Issues\n\n`;
      for (const issue of result.issues) {
        markdown += `- **Type:** ${issue.type}\n`;
        markdown += `  **Element:** \`${issue.element.replace(/</g, '&lt;').replace(/>/g, '&gt;')}\`\n`;
        markdown += `  **Details:** ${issue.details}\n\n`;
      }
    } else {
      markdown += `No keyboard accessibility issues found.\n\n`;
    }
    
    if (result.accessibilityIssues.length > 0) {
      markdown += `#### Axe Accessibility Issues\n\n`;
      for (const violation of result.accessibilityIssues) {
        if (violation.tags.some((tag: string) => 
            tag.includes('keyboard') || 
            tag.includes('focus') || 
            tag.includes('navigation')
        )) {
          markdown += `- **${violation.id}:** ${violation.help}\n`;
          markdown += `  - Impact: ${violation.impact}\n`;
          markdown += `  - Description: ${violation.description}\n`;
          markdown += `  - WCAG: ${violation.tags.filter((t: string) => t.startsWith('wcag')).join(', ')}\n\n`;
        }
      }
    }
  }
  
  markdown += `## Testing Parameters\n\n`;
  markdown += `- **Base URL:** ${CONFIG.baseUrl}\n`;
  markdown += `- **Routes Tested:** ${CONFIG.routes.length}\n`;
  markdown += `- **Elements Checked:** ${CONFIG.keyboardElements.map(e => e.description).join(', ')}\n\n`;
  
  markdown += `## Next Steps\n\n`;
  markdown += `1. Fix all reported keyboard accessibility issues\n`;
  markdown += `2. Ensure all interactive elements have visible focus styles\n`;
  markdown += `3. Verify that all modal dialogs can be closed with the Escape key\n`;
  markdown += `4. Test keyboard shortcuts for proper functionality\n`;
  
  fs.writeFileSync(
    path.join(CONFIG.outputDir, 'keyboard-accessibility-report.md'),
    markdown
  );
}

// Run the tests
runKeyboardAccessibilityTests().catch(error => {
  console.error(chalk.red('Fatal error running keyboard accessibility tests:'), error);
  process.exit(1);
});

export {}; 