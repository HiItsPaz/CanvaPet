# CanvaPet.com Design Documentation

## 1. Visual Design System

### Brand Identity
- **Logo Design**: Custom pet-themed logo with playful elements
- **Color Palette**:
  - Primary: #4A7CFF (Blue) - Used for primary actions, highlights
  - Secondary: #FF7D54 (Coral) - Used for secondary actions, accents
  - Accent: #FFD166 (Yellow) - Used for special emphasis, highlights
  - Neutrals: #F9F9F9 (Light Gray), #EEEEEE (Mid Gray), #666666 (Dark Gray)

### Typography Hierarchy
- **Headings**: Montserrat (Sans-serif)
  - H1: 48px/56px, Bold
  - H2: 36px/44px, Bold
  - H3: 28px/36px, SemiBold
  - H4: 24px/32px, SemiBold
  - H5: 20px/28px, Medium
  - H6: 18px/24px, Medium

- **Body Text**: Open Sans (Sans-serif)
  - Body Large: 18px/28px, Regular
  - Body: 16px/24px, Regular
  - Body Small: 14px/20px, Regular
  - Caption: 12px/16px, Regular

- **Accent Text**: Caveat (Handwritten)
  - Used for personal touches, notes, special messages
  - Size varies by context, typically 18-24px

### Core UI Components

#### Button System
- **Primary Button**
  - Background: #4A7CFF
  - Text: White
  - Hover: Darken 10%
  - Active: Darken 15%
  - Disabled: 50% opacity
  - Sizes: Small (32px height), Medium (40px height), Large (48px height)
  - Border-radius: 8px

- **Secondary Button**
  - Border: 2px #4A7CFF
  - Text: #4A7CFF
  - Background: Transparent
  - Hover: Light blue background
  - Active: Slightly darker background
  - Same sizing as primary

- **Tertiary Button**
  - Text: #4A7CFF
  - Background: Transparent
  - Hover: Light gray background
  - Active: Slightly darker background
  - Same sizing as primary

#### Form Controls
- **Text Input**
  - Height: 48px
  - Border: 1px #EEEEEE
  - Border-radius: 8px
  - Focus: 2px border #4A7CFF
  - Error: 2px border #E53935
  - Placeholder: #666666 at 70% opacity

- **Checkbox/Radio**
  - Custom styled with brand colors
  - Accessible focus states
  - Clear hit areas (minimum 24x24px)

- **Select Dropdown**
  - Styled consistently with text inputs
  - Custom dropdown icon
  - Hover and focus states

- **Range Slider**
  - Custom track and thumb styling
  - Visual feedback on interaction
  - Value tooltip on hover/interaction

#### Card Components
- **Standard Card**
  - Background: White
  - Border-radius: 12px
  - Shadow: 0 4px 8px rgba(0,0,0,0.05)
  - Padding: 24px
  - Hover: Enhanced shadow

- **Pet Card**
  - Image container with 1:1 aspect ratio
  - Title area with pet name
  - Action buttons overlay on hover
  - Status indicators where needed

- **Product Card**
  - Product image (dominant)
  - Product title
  - Price
  - Quick action button
  - Hover state with enhanced shadow

### Iconography
- **Custom Pet-Themed Icon Set**
  - Standard sizes: 16px, 24px, 32px
  - Consistent stroke width
  - Rounded corners
  - Optimized for small sizes

- **UI Icons**
  - Navigation elements
  - Action icons
  - Status indicators
  - Functional icons (search, cart, etc.)

### Responsive Design System
- **Breakpoints**:
  - Mobile: 320px-767px
  - Tablet: 768px-1023px
  - Desktop: 1024px+

- **Grid System**:
  - 12-column layout
  - Responsive gutters (16px mobile, 24px tablet, 32px desktop)
  - Consistent spacing units

- **Spacing Scale**:
  - 4px, 8px, 16px, 24px, 32px, 48px, 64px, 96px
  - Used consistently throughout the interface

## 2. Page Designs

### Home/Landing Page
- **Hero Section**
  - Large pet portrait showcase
  - Clear value proposition: "Transform Your Pet into Art"
  - Primary CTA: "Create Your Pet Portrait"
  - Secondary CTA: "See Examples"

- **How It Works**
  - 3-step process visualization
  - Visual icons for each step
  - Simple explanations
  - Step 1: Upload your pet photo
  - Step 2: Customize your portrait
  - Step 3: Order prints or download

- **Gallery Showcase**
  - Rotating carousel of example pet portraits
  - Various styles displayed
  - Before/after comparisons

- **Testimonials**
  - Customer photos with their pets and portraits
  - Attribution and short quote
  - Star ratings

- **Pricing Section**
  - Clear pricing cards for different tiers
  - Feature comparison
  - Most popular option highlighted

- **FAQ Accordion**
  - Common questions grouped by category
  - Expandable/collapsible sections
  - Link to more detailed help

### Pet Upload & Creation
- **Step Indicator**
  - Clear progress visualization
  - Current step highlighted
  - Step labels

- **Upload Area**
  - Large drop zone with icon
  - "Drag & Drop or Click to Upload" message
  - Supported file types and size limits
  - Mobile camera button on small screens

- **Photo Guidelines**
  - Examples of good photos
  - Tips for best results
  - Common mistakes to avoid

- **Preview & Crop**
  - Image preview with aspect ratio overlay
  - Zoom and pan controls
  - Rotate and flip options
  - Continue button when ready

### Pet Customization Interface
- **Style Selection**
  - Visual grid of style options
  - Thumbnails showing example of each style
  - Hover state with style name
  - Selected state with clear indicator

- **Customization Controls**
  - Left sidebar with categorized controls
  - Right area showing preview
  - Collapsible sections for different parameters
  - Real-time preview updates

- **Background Selection**
  - Color picker with presets
  - Pattern options with thumbnails
  - Scene options with thumbnails
  - Transparency/opacity control

- **Advanced Controls**
  - Intensity slider
  - Color balance controls
  - Detail enhancement options
  - Mobile: Bottom sheet with controls instead of sidebar

### Processing & Preview Screen
- **Loading State**
  - Engaging pet-themed animation
  - Progress bar with percentage
  - Estimated time remaining
  - "Designing your masterpiece..." message
  - Random pet facts to entertain during wait

- **Preview Display**
  - Large image display
  - Multiple view options
  - Zoom capability
  - Before/after comparison slider

- **Action Panel**
  - Download button (if purchased)
  - Continue to merchandise button
  - Share options
  - Request revision button (if available)

### User Gallery/Dashboard
- **Gallery Grid**
  - Responsive grid of pet portraits
  - Quick action buttons on hover
  - Sort and filter controls
  - Empty state with CTA to create first portrait

- **List/Grid Toggle**
  - Option to switch view modes
  - List view shows more metadata

- **Pet Profile Cards**
  - Portrait thumbnail
  - Pet name
  - Creation date
  - Available actions

### Merchandise Store
- **Category Navigation**
  - Visual category selection
  - Filter by product type
  - Sort options (price, popularity)

- **Product Grid**
  - Product cards with images
  - Price clearly displayed
  - Quick view option
  - "New" badges where applicable

- **Product Detail**
  - Large product images (multiple angles)
  - Product description
  - Size/variant selection
  - Price and availability
  - Add to cart button
  - Related products

- **Pet Image Placement Interface**
  - Interactive product preview
  - Drag, resize, rotate controls
  - Reset button
  - Preview in different colors/variants

### Checkout Process
- **Cart Review**
  - Product thumbnails
  - Quantities with edit options
  - Subtotal calculation
  - Continue to checkout button
  - "Keep shopping" link

- **Checkout Form**
  - Shipping address entry
  - Payment method selection
  - Order summary
  - Trust indicators and security badges
  - Clear call to action

- **Order Confirmation**
  - Success message and animation
  - Order reference number
  - Estimated delivery
  - Next steps information
  - Return to gallery button

### Portrait Revision Interface
- **Current Portrait Display**
  - Large display of current portrait
  - Remaining revisions counter
  - Expiration date for revision window

- **Adjustment Controls**
  - Style adjustment controls
  - Background options
  - Slider for style intensity
  - Color adjustments

- **Version Comparison**
  - Side-by-side comparison
  - Before/after slider
  - Option to revert to previous version
  - Accept button for new version

## 3. Component Specifications

### Navigation Components
- **Main Navigation Bar**
  - Logo (left-aligned)
  - Primary navigation links (center)
  - User account menu (right)
  - Cart icon with count indicator
  - Mobile: Hamburger menu with slide-out drawer

- **User Account Menu**
  - Profile picture/avatar
  - Dropdown with links to:
    - Profile
    - Gallery
    - Orders
    - Settings
    - Sign Out

- **Mobile Navigation**
  - Collapsible hamburger menu
  - Full-screen overlay
  - Large tap targets
  - Current page indicator
  - Close button

### Authentication Components
- **Sign-In Form**
  - Email input
  - Password input with show/hide toggle
  - "Remember me" checkbox
  - Forgot password link
  - Sign in button
  - Social authentication options
  - Create account link

- **Registration Form**
  - Name inputs
  - Email input
  - Password input with strength indicator
  - Confirm password
  - Terms acceptance checkbox
  - Registration button
  - Already have account link

### Pet Components
- **Pet Card**
  - Pet image (square, rounded corners)
  - Pet name
  - Creation date
  - Action buttons (customize, order, share)
  - Status indicator if applicable

- **Pet Uploader**
  - Drag and drop zone
  - File selection button
  - Mobile camera access
  - Upload progress indicator
  - Error messages for invalid files

- **Image Editor**
  - Crop tool with aspect ratio controls
  - Rotation controls
  - Brightness/contrast adjustments
  - Auto-enhance option
  - Reset button

### Customization Components
- **Style Selector**
  - Visual grid of style options
  - Selected state indicator
  - Hover states with style name
  - Style category filters
  - Search option for many styles

- **Background Selector**
  - Color picker with swatches
  - Pattern thumbnails
  - Scene thumbnails
  - Transparency control
  - Custom upload option

- **Adjustment Controls**
  - Sliders for intensity
  - Color balance controls
  - Detail enhancement options
  - Reset to defaults button
  - Apply button

### Merchandise Components
- **Product Card**
  - Product image
  - Product name
  - Price
  - Rating (if applicable)
  - Quick view button
  - Add to cart button (where applicable)

- **Product Customizer**
  - Interactive product preview
  - Pet image positioning controls
  - Size/orientation controls
  - Color/variant selection
  - Preview button

- **Size Selector**
  - Size options with visual indicators
  - Currently selected size
  - Size guide link
  - Out of stock indicators

### Payment Components
- **Checkout Form**
  - Shipping address fields
  - Billing address option
  - Payment method selection
  - Order summary
  - Submit button

- **Order Summary**
  - Line items with thumbnails
  - Subtotal
  - Shipping cost
  - Tax calculation
  - Discount code field
  - Order total

## 4. User Flow Diagrams

### New User Flow
1. **Landing Page**
   - User views value proposition
   - User clicks "Create Portrait" CTA

2. **Upload Pet Photo**
   - User uploads or captures photo
   - System validates photo contains pet
   - User adjusts/crops photo
   - User clicks continue

3. **Customize Portrait**
   - User selects desired style
   - User customizes background
   - User adjusts parameters
   - User views preview

4. **Authentication Prompt**
   - User prompted to create account
   - User completes registration
   - Account created and linked to portrait

5. **Preview & Purchase**
   - User views final preview
   - User selects purchase option
   - User completes payment
   - Order confirmation displayed

### Returning User Flow
1. **Authentication**
   - User signs in to account
   - System displays user gallery

2. **Gallery Interaction**
   - User views existing portraits
   - User selects portrait to edit or
   - User creates new portrait

3. **Action Selection**
   - User selects desired action:
     - Edit existing portrait
     - Create merchandise
     - Request revision
     - Download/share

4. **Completion**
   - User completes selected action
   - System confirms action
   - User returned to gallery

### Merchandise Creation Flow
1. **Select Portrait**
   - User views gallery
   - User selects portrait for merchandise

2. **Select Product Type**
   - User browses product categories
   - User selects specific product

3. **Customize Product**
   - User positions portrait on product
   - User selects product variants
   - User views preview

4. **Add to Cart**
   - User adds to cart
   - System confirms addition
   - User continues shopping or proceeds to checkout

5. **Checkout Process**
   - User reviews cart
   - User enters shipping information
   - User completes payment
   - Order confirmation displayed

### Revision Flow
1. **Select Portrait**
   - User views gallery
   - User selects portrait to revise

2. **Request Revision**
   - System checks revision eligibility
   - User adjusts portrait parameters
   - User submits revision request

3. **Processing**
   - System generates new version
   - User views loading animation
   - System displays new version

4. **Comparison & Selection**
   - User compares versions
   - User selects preferred version
   - System saves final selection

## 5. Responsive Design Specifications

### Mobile Design (320px-767px)
- **Navigation**: Hamburger menu with slide-out drawer
- **Layouts**: Single column, stacked elements
- **Controls**: Large touch targets (minimum 44×44px)
- **Typography**: Slightly reduced font sizes
- **Media**: Full-width images
- **Forms**: Stacked form fields, full-width inputs
- **Customizer**: Controls in bottom sheet or tabbed interface

### Tablet Design (768px-1023px)
- **Navigation**: Compact horizontal nav or hamburger menu
- **Layouts**: Two-column grids for galleries and products
- **Controls**: Standard sizing
- **Typography**: Standard font sizes
- **Media**: Grid layouts for galleries
- **Forms**: Side-by-side fields where space permits
- **Customizer**: Sidebar controls with preview area

### Desktop Design (1024px+)
- **Navigation**: Full horizontal navigation
- **Layouts**: Multi-column grids, spacious layouts
- **Controls**: Standard sizing
- **Typography**: Full-size type scale
- **Media**: Varied grid layouts, hover states
- **Forms**: Organized multi-column layout
- **Customizer**: Full-featured sidebar controls with large preview

## 6. Animation & Transition Specifications

### Loading States
- **Portrait Generation**
  - Pet-themed animation (paw prints walking across screen)
  - Progress bar with percentage
  - Subtle background animation

- **Page Transitions**
  - Fade in/out (300ms)
  - Content slide up (400ms)
  - Staggered element reveal

### Micro-interactions
- **Button Interactions**
  - Subtle scale on hover (105%)
  - Color shift on hover
  - Quick feedback on click (150ms)

- **Form Field Interactions**
  - Label animation on focus
  - Validation feedback animations
  - Error shake animation

- **Gallery Interactions**
  - Card hover effects (slight raise, shadow increase)
  - Smooth pagination transitions
  - Image zoom on hover

### Customization Interactions
- **Style Selection**
  - Smooth transition between styles
  - Parameter adjustment animations
  - Before/after comparison slider

- **Image Positioning**
  - Smooth dragging and scaling
  - Snap-to-grid helpers
  - Rotation indicators

## 7. Accessibility Guidelines

### WCAG 2.1 AA Compliance
- **Color Contrast**
  - Text: Minimum 4.5:1 contrast ratio
  - Large Text: Minimum 3:1 contrast ratio
  - UI Components: Minimum 3:1 contrast ratio

- **Keyboard Navigation**
  - Logical tab order
  - Focus indicators for all interactive elements
  - Skip navigation link
  - No keyboard traps

- **Screen Reader Support**
  - Semantic HTML structure
  - ARIA labels where needed
  - Alternative text for all images
  - Descriptive form labels

- **Reduced Motion**
  - Respects prefers-reduced-motion setting
  - Alternative non-animated states
  - No flashing content

## 8. Copy & Microcopy Guidelines

### Tone & Voice
- **Friendly & Approachable**
  - Conversational language
  - Occasional pet-related humor
  - Enthusiasm for pets and creativity

- **Clear & Instructional**
  - Direct instructions
  - Simple explanations
  - Progressive disclosure of complex concepts

- **Emotionally Resonant**
  - Emphasis on pet bond
  - Gift-giving focused language
  - Celebration of pet personality

### Key Messaging
- **Value Proposition**
  - "Transform your beloved pet into stunning artwork"
  - "Unique, customized portraits as special as your pet"
  - "The perfect gift for pet lovers"

- **Trust Building**
  - "100% satisfaction guarantee"
  - "Free revisions to get it just right"
  - "Join thousands of happy pet owners"

- **Feature Highlighting**
  - "Choose from 20+ artistic styles"
  - "High-quality prints ready for framing"
  - "Unlimited digital access to your portraits"

### Microcopy Elements
- **Button Text**
  - Clear verbs: "Create", "Customize", "Order", "Share"
  - Success confirmation: "Portrait Saved!", "Added to Cart!"
  - Action emphasis: "Get Started Now", "See Your Pet in Art"

- **Form Labels & Help Text**
  - Clear, concise field labels
  - Specific input requirements
  - Helpful error correction guidance

- **Loading & Process Text**
  - Engaging messages: "Creating your masterpiece..."
  - Progress indication: "Almost there...", "Finalizing details..."
  - Fun facts to entertain during waits 