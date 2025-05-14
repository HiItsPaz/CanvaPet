# Keyboard Navigation Documentation

This document provides comprehensive documentation on all keyboard navigation features available in CanvaPet for both users and developers.

## For Users

### Global Keyboard Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `?` | Open Keyboard Shortcuts Help | Displays this help dialog listing all available shortcuts |
| `/` | Focus Search | Moves focus to the search input field |
| `Shift + /` | Open Command Palette | Access commands quickly without using the mouse |
| `Ctrl + ,` or `Cmd + ,` | Open Settings | Opens the application settings |
| `Shift + D` | Toggle Dark Mode | Switch between light and dark themes |
| `Shift + A` | Toggle High Contrast | Enable/disable high contrast mode for better visibility |
| `Shift + Home` | Go to Home | Navigate to the home page |
| `Shift + G` | Go to Gallery | Navigate to your gallery |
| `Shift + P` | Go to Profile | Navigate to your profile |
| `Esc` | Close/Cancel | Close modals, dialogs, or cancel current operations |

### Navigation Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Tab` | Next Focusable Element | Move focus to the next interactive element |
| `Shift + Tab` | Previous Focusable Element | Move focus to the previous interactive element |
| `Enter` or `Space` | Activate | Activate the currently focused button or control |
| `Home` | First Item | Go to first item in a list, menu, or table |
| `End` | Last Item | Go to last item in a list, menu, or table |
| `Page Up` | Scroll Up | Scroll up a page |
| `Page Down` | Scroll Down | Scroll down a page |
| `Alt + ←` | Go Back | Navigate to previous page in history |
| `Alt + →` | Go Forward | Navigate to next page in history |

### Pet Customization Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl + S` or `Cmd + S` | Save | Save current customizations |
| `Ctrl + Z` or `Cmd + Z` | Undo | Undo last change |
| `Ctrl + Shift + Z` or `Cmd + Shift + Z` | Redo | Redo last undone change |
| `1-9` | Select Style Group | Quick access to style groups 1-9 |
| `[` | Previous Style | Navigate to previous style in current category |
| `]` | Next Style | Navigate to next style in current category |
| `Shift + [` | Previous Category | Switch to previous category |
| `Shift + ]` | Next Category | Switch to next category |
| `R` | Randomize | Generate random pet customizations |

### Gallery Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `←` | Previous Item | View previous item in gallery |
| `→` | Next Item | View next item in gallery |
| `+` | Zoom In | Increase image size |
| `-` | Zoom Out | Decrease image size |
| `0` | Reset Zoom | Reset to default zoom level |
| `I` | View Image Info | Show or hide image information |
| `S` | Share | Open share dialog for current item |
| `Ctrl + C` or `Cmd + C` | Copy Link | Copy link to current item |
| `Delete` | Delete | Delete the current item (with confirmation) |

### Dialog and Menu Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Esc` | Close | Close current dialog or menu |
| `↑` | Previous Menu Item | Navigate to previous menu item |
| `↓` | Next Menu Item | Navigate to next menu item |
| `←` | Collapse Submenu | Collapse current submenu or navigate left |
| `→` | Expand Submenu | Expand current submenu or navigate right |
| `Enter` or `Space` | Select | Select the currently focused menu item |
| `Home` | First Menu Item | Navigate to first menu item |
| `End` | Last Menu Item | Navigate to last menu item |

## For Developers

### Keyboard Navigation Implementation Guidelines

#### Focus Management

1. **Focus Order**
   - All interactive elements must be focusable in a logical order that follows the visual layout
   - Use proper HTML elements or add `tabindex="0"` to custom controls
   - Never use `tabindex` values greater than 0 as they disrupt natural tab order

2. **Focus Indicators**
   - All focusable elements must have a visible focus indicator
   - Focus styles are defined in `src/styles/focus-styles.css`
   - Default focus styles have a 2px outline with 2px offset in primary color
   - Never use `outline: none` without providing an alternative visual focus style

3. **Focus Trapping**
   - Modals, dialogs, and other overlay components should trap focus
   - Implementation example: `src/components/ui/focus-trap.tsx`
   - Focus should return to the triggering element when dialogs close
   - Keyboard users must be able to access all interactive elements in a modal

#### ARIA Keyboard Patterns

Follow these WAI-ARIA keyboard patterns for custom components:

1. **Buttons**
   - Focusable with `Tab`
   - Activate with `Enter` or `Space`
   - Implementation: use `<button>` element or role="button" with proper event handlers

2. **Dropdown Menus**
   - Open with `Enter`, `Space`, or `↓`
   - Navigate with `↑` and `↓`
   - Select with `Enter` or `Space`
   - Close with `Esc`
   - Implementation: `src/components/ui/select.tsx` and `src/components/ui/dropdown-menu.tsx`

3. **Carousels**
   - Navigate with `←` and `→`
   - Optional: `Home` and `End` for first/last slide
   - Implementation: `src/components/ui/carousel.tsx`

4. **Tabs**
   - Navigate between tabs with `←` and `→` 
   - Activate tab with `Enter` or `Space`
   - Implementation: `src/components/ui/tabs.tsx`

5. **Date Pickers**
   - Open with `Enter`, `Space`, or `↓`
   - Navigate dates with arrow keys
   - Select date with `Enter` or `Space`
   - Change month with `Page Up` and `Page Down`
   - Implementation: `src/components/ui/date-picker.tsx`

6. **Sliders**
   - Adjust with `←` and `→` (or `↑` and `↓`)
   - Larger jumps with `Page Up` and `Page Down`
   - `Home` and `End` for min/max values
   - Implementation: `src/components/ui/slider.tsx`

### Utility Components and Hooks

CanvaPet provides several utility components and hooks to simplify keyboard accessibility implementation:

1. **KeyboardNavigable Component**
   - Location: `src/components/ui/keyboard-enhanced-component.tsx`
   - Purpose: Adds standardized keyboard navigation to custom components
   - Usage: Wrap custom components that need keyboard navigation
   - Example:
     ```tsx
     <KeyboardNavigable
       onNavigate={(direction) => handleNavigation(direction)}
       onSelect={() => handleSelect()}
       onEscape={() => handleClose()}
     >
       {children}
     </KeyboardNavigable>
     ```

2. **useKeyboardShortcuts Hook**
   - Location: `src/hooks/useKeyboardShortcuts.ts`
   - Purpose: Register and handle keyboard shortcuts
   - Example:
     ```tsx
     const { enableShortcuts, disableShortcuts } = useKeyboardShortcuts({
       scope: 'gallery',
       enabled: true,
       onShortcut: (action) => {
         if (action === 'next-item') handleNext();
         if (action === 'previous-item') handlePrevious();
       }
     });
     ```

3. **FocusTrap Component**
   - Location: `src/components/ui/focus-trap.tsx`
   - Purpose: Traps focus within modals and dialogs
   - Example:
     ```tsx
     <FocusTrap active={isModalOpen}>
       <div className="modal">
         {modalContent}
       </div>
     </FocusTrap>
     ```

4. **SkipLink Component**
   - Location: `src/components/ui/skip-link.tsx`
   - Purpose: Allows keyboard users to skip navigation
   - Implementation: Add to the top of main layout

### Testing Keyboard Accessibility

1. **Automated Testing**
   - Run keyboard accessibility tests: `npm run a11y:audit`
   - Tests check for proper focus management, keyboard traps, etc.
   - Test reports are generated in `reports/accessibility/`

2. **Manual Testing Procedures**
   - Unplug your mouse and navigate the entire application with keyboard only
   - Ensure all interactive elements can be accessed and operated
   - Verify that focus indicators are clearly visible
   - Test with screen readers to ensure proper announcements
   - Check that keyboard shortcuts work as expected

3. **Common Keyboard Accessibility Issues**
   - Missing focus styles
   - Inability to reach all interactive elements
   - Focus traps that cannot be escaped
   - Non-standard keyboard patterns
   - Keyboard shortcuts that conflict with browser or screen reader shortcuts

### Maintenance Guidelines

1. **New Components**
   - All new components must follow WAI-ARIA keyboard patterns
   - Use the provided utility components and hooks
   - Document keyboard interactions in component comments

2. **Code Reviews**
   - Check for keyboard accessibility in all PRs
   - Ensure proper focus management for new routes and views
   - Verify that keyboard shortcuts don't conflict with existing ones

3. **Documentation**
   - Update this documentation when adding new keyboard shortcuts
   - Ensure all keyboard interactions are documented in component JSDoc comments
   - Keep the keyboard shortcuts help dialog up to date

4. **Updating Existing Components**
   - Preserve keyboard accessibility when updating existing components
   - Test keyboard interactions after making changes
   - Maintain backward compatibility for existing keyboard shortcuts

By following these guidelines, we ensure that CanvaPet remains accessible to keyboard users and complies with WCAG 2.1 AA requirements for keyboard accessibility. 