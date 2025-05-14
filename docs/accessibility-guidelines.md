# CanvaPet Accessibility Guidelines

This document outlines the essential accessibility practices to follow when developing the CanvaPet application. Following these guidelines ensures that our application is usable by people with various disabilities and meets WCAG 2.1 AA compliance standards.

## Keyboard Accessibility

### Focus Management
- All interactive elements must be focusable and have a visible focus indicator
- Focus order must follow a logical sequence (top-to-bottom, left-to-right)
- Focus must be trapped within modals and dialogs when open
- When modals/dialogs close, focus must return to the triggering element
- Use the `FocusTrap` component for implementing proper focus management

### Keyboard Navigation
- All functionality must be available using the keyboard alone without requiring specific timing for individual keystrokes
- Ensure logical tab order matches the visual layout
- Include a "skip to main content" link at the start of the page
- Avoid keyboard traps (where keyboard focus gets stuck)
- Provide visible focus styles that meet contrast requirements (see our standard focus styles in `src/styles/focus-styles.css`)

### Keyboard Shortcuts
- All keyboard shortcuts must have an accessible alternative
- Use standard keyboard patterns when possible (e.g., Esc to close)
- Document all keyboard shortcuts in the help section
- Allow users to disable or customize keyboard shortcuts
- Ensure shortcuts don't interfere with assistive technology 
- Add clear visual indicators for available shortcuts
- Use the `useKeyboardShortcuts` hook and context for consistent implementation
- Test all keyboard shortcuts with screen readers

### Implementation Details
- Use the `FocusTrap` component for modals, dialogs, and other interactive components
- Use the `SkipLink` component at the beginning of each page
- Implement standard focus styles from `src/styles/focus-styles.css`
- Add keyboard shortcuts through the `KeyboardShortcutsContext`
- Test keyboard navigation using the accessibility audit script `npm run a11y:audit`

## Screen Readers

### Semantic HTML
- Use proper HTML elements for their intended purpose
- Use heading levels (`h1`-`h6`) to create a logical document outline
- Use landmarks like `<main>`, `<nav>`, `<aside>`, and `<footer>`
- Use lists (`<ul>`, `<ol>`) for groups of related items
- Use tables (`<table>`) for tabular data with proper headers

### ARIA Attributes
- Only use ARIA when necessary (prefer semantic HTML)
- Always include accessible names for interactive elements
- Use `aria-label` or `aria-labelledby` for unlabeled elements
- Use `aria-describedby` for additional descriptions
- Use `aria-expanded`, `aria-haspopup`, etc. for interactive components
- Use `aria-live` regions for dynamic content

### Alternative Text
- Provide alternative text for all images
- Make alt text descriptive and concise
- Use empty alt text (`alt=""`) for decorative images
- Provide transcripts or captions for audio and video
- Test with screen readers to ensure all content is accessible

## Color and Contrast

### Color Contrast
- Ensure text contrast ratio of at least 4.5:1 for normal text
- Ensure text contrast ratio of at least 3:1 for large text
- Ensure contrast ratio of at least 3:1 for UI components and graphics
- Use the design system's color tokens to maintain proper contrast

### Color Independence
- Don't use color alone to convey information
- Provide additional indicators (icons, patterns, text)
- Ensure the application is usable in high contrast mode
- Test the application in grayscale

## Responsive Design

### Zoom and Text Resize
- Ensure the application works at 200% zoom
- Allow text to be resized up to 200% without loss of content
- Avoid using fixed sizes for containers that hold text
- Test with browser zoom and text resizing

### Mobile Accessibility
- Ensure touch targets are at least 44x44 pixels
- Provide sufficient spacing between interactive elements
- Ensure the application is usable in both portrait and landscape orientations
- Test with mobile screen readers (VoiceOver, TalkBack)

## Form Accessibility

### Form Controls
- Associate labels with form controls using `<label>` elements or aria-label
- Provide clear instructions and error messages
- Group related form elements with `<fieldset>` and `<legend>`
- Mark required fields with the `required` attribute and visual indicators
- Ensure form validation errors are accessible

### Input Assistance
- Provide clear error identification and suggestions
- Allow users to review and correct information before submitting
- Use appropriate input types (`email`, `tel`, etc.)
- Implement autocomplete attributes where appropriate

## Implementation Resources

### Components
- `FocusTrap`: Keeps focus within a component (e.g., modals)
- `SkipLink`: Allows users to skip to main content
- Standardized focus styles in `src/styles/focus-styles.css`
- `KeyboardShortcutsHelp`: Displays available keyboard shortcuts
- `useKeyboardShortcuts`: Hook for implementing keyboard shortcuts

### Testing Tools
- Accessibility audit script: `npm run a11y:audit`
- Manual checklist generator: `npm run a11y:checklist`

## Testing Guidelines
- Test with keyboard navigation only
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Test with high contrast mode
- Test with zoom (up to 200%)
- Test with reduced motion settings
- Use automated testing tools regularly

## Semantic HTML & ARIA

### Proper Semantic Structure
- Use appropriate semantic elements (`<nav>`, `<main>`, `<section>`, etc.)
- Ensure a logical heading hierarchy (h1, h2, h3, etc.)
- Use lists (`<ul>`, `<ol>`) for presenting lists of items
- Use `<button>` for clickable actions and `<a>` for navigation

### ARIA Attributes
- Only use ARIA when necessary (prefer native HTML semantics)
- Always test ARIA implementations with screen readers
- Common ARIA roles to use correctly:
  - `role="dialog"` or `role="alertdialog"` for modals
  - `aria-label` for elements without visible text
  - `aria-expanded` for expandable elements
  - `aria-controls` to associate controls with their targets
  - `aria-live` for dynamic content updates

### Form Accessibility
- All form inputs must have associated labels
- Error messages must be programmatically associated with inputs
- Group related form controls with `<fieldset>` and `<legend>`
- Provide clear error messages and validation feedback
- Use `autocomplete` attributes where appropriate

## Visual Design & Content

### Text & Typography
- Use relative units (rem, em) for text sizing
- Ensure text can be resized up to 200% without loss of content
- Maintain adequate line spacing (1.5x for body text)
- Avoid justified text alignment
- Provide sufficient contrast between text and background

### Images & Media
- All images must have appropriate alt text
- Decorative images must have empty alt text (`alt=""`)
- Complex images should have extended descriptions
- Videos must have captions and audio descriptions
- Allow users to pause, stop, or hide any moving content

## Interaction Design

### Error Prevention
- Provide clear instructions and error messages
- Allow users to review and correct form submissions
- Confirm user actions that have significant consequences
- Provide undo functionality where possible

### Timing
- Avoid time limits where possible
- If time limits are necessary, provide options to extend
- Warn users before their session times out
- Store user input to prevent data loss

### Navigation
- Provide multiple ways to navigate the application
- Include breadcrumbs for complex navigation structures
- Maintain consistent navigation throughout the application
- Clearly indicate the current location

## Testing & Validation

### Automated Testing
- Run the accessibility audit script regularly: `npm run a11y:audit`
- Review automated test results and address all issues
- Integrate accessibility testing into the CI/CD pipeline

### Manual Testing
- Use the accessibility checklist: `npm run a11y:checklist`
- Test with keyboard navigation only
- Test with screen readers (NVDA, VoiceOver, JAWS)
- Test with browser zoom and text resizing
- Test with high contrast mode

### User Testing
- Include users with disabilities in user testing
- Consider various types of disabilities in your testing
- Use feedback to improve accessibility features

## Development Components & Utilities

### Available Components
- `FocusTrap`: For trapping focus within modal dialogs
- `SkipLink`: For bypassing repetitive navigation
- Custom focus styles in `focus-styles.css`

### Best Practices
- Use the correct semantic HTML elements
- Test all components with keyboard navigation
- Ensure all interactive elements have appropriate ARIA attributes
- Follow the component library documentation for accessibility features

## Resources

### Standards & Guidelines
- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices-1.1/)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/)
- [WAVE Web Accessibility Evaluation Tool](https://wave.webaim.org/)
- [Lighthouse Accessibility Audit](https://developers.google.com/web/tools/lighthouse)

### Learning Resources
- [MDN Web Docs: Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/) 