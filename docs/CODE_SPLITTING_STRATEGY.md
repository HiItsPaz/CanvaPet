# Proposed Code Splitting Strategy

This document outlines the proposed strategy for code splitting within the CanvaPet application to improve initial load times and overall performance, based on the analysis conducted for Task 15.2.

## General Principles

1.  **Leverage Next.js Defaults:** Continue to rely on Next.js's built-in route-based code splitting, which automatically creates separate chunks for each page.
2.  **Dynamic Imports for Components:** Utilize `next/dynamic` for component-level code splitting, especially for:
    *   Components that are not critical for the initial render (e.g., below-the-fold content).
    *   Components that are only rendered based on user interaction (e.g., modals, drawers, complex UI revealed on click).
    *   Large and complex components with significant JavaScript and/or heavy dependencies.
3.  **Identify Large Dependencies:** Use bundle analysis tools (e.g., `@next/bundle-analyzer` or `webpack-bundle-analyzer`, as referenced in subtask 15.1) to identify third-party libraries or large internal modules that could be candidates for strategic loading or replacement with lighter alternatives if possible.

## Specific Route/Component Splitting Opportunities

### 1. Main Landing Page (`src/app/page.tsx`)

*   **Current State:** A large page (approx. 600+ lines) rendering multiple distinct sections (Hero, Features, How it Works, Testimonials, Pricing, FAQ).
*   **Proposed Strategy:**
    *   Break down each major section (e.g., `TestimonialsSection`, `PricingSection`, `FAQSection`) into its own component.
    *   Dynamically import these section components using `next/dynamic`. This will allow the main content above the fold to load quickly, with subsequent sections loading as needed or deferred.
    *   **Example:**
        ```tsx
        import dynamic from 'next/dynamic';

        const TestimonialsSection = dynamic(() => import('@/components/landing/TestimonialsSection'));
        const PricingSection = dynamic(() => import('@/components/landing/PricingSection'));
        // ... etc.

        export default function Home() {
          // ...
          return (
            <>
              {/* Above the fold content */}
              <TestimonialsSection />
              <PricingSection />
              {/* ... */}
            </>
          );
        }
        ```
    *   Consider lazy loading for images within these sections using `next/image` properties if not already implemented.

### 2. Pets Overview Page (`src/app/pets/page.tsx`)

*   **Current State:** Lists user's pets with filtering and sorting. Fetches pet data and renders pet cards.
*   **Proposed Strategy:**
    *   If individual pet cards (`PetCard` component, assuming one exists or will be created) are complex or contain multiple images/actions, consider dynamically importing the `PetCard` component, especially if displayed in a long list.
    *   Alternatively, if the number of pets can be very large, implement a virtualized list/grid to only render visible items. `next/dynamic` can still be used for the item renderer in the virtualized list.
    *   The filter/sort controls are likely fine as they are, unless they import unusually heavy dependencies.

### 3. Pet Creation/Edit Form (`src/components/pets/PetForm.tsx`, used by `/pets/new` and `/pets/[id]/edit`)

*   **Current State:** A moderately complex form using `react-hook-form` and `zod`. Includes a "Pet Photos" section for managing image URLs and displaying previews.
*   **Proposed Strategy:**
    *   Route-based splitting handled by Next.js for the pages using this form is generally sufficient.
    *   The "Pet Photos" section within `PetForm` is the primary area of internal complexity. If this section evolves to include more advanced features (e.g., direct multi-file uploads with rich previews, client-side cropping/editing tools integrated directly into the form rather than a separate flow), consider:
        *   Extracting it into a dedicated `PetPhotoManager` component.
        *   Potentially dynamically importing `PetPhotoManager` within `PetForm` if its bundle size becomes significant and it's not immediately critical for the form's initial interaction. For now, it seems reasonably contained.

### 4. Merchandise Customization Page (`src/app/merch/[blueprintId]/customize/page.tsx`)

*   **Current State:** A highly interactive page for selecting merchandise variants, choosing a pet portrait, and customizing its placement, scale, and rotation on the product. Involves significant client-side logic and state management.
*   **Proposed Strategy:** This page is a prime candidate for component-level dynamic imports.
    *   **Interactive Customization Canvas/Area:** The core component responsible for rendering the product image, the user's portrait, and handling drag, scale, rotate interactions. This should be extracted into a dedicated component (e.g., `MerchCustomizationCanvas`) and dynamically imported:
        ```tsx
        const MerchCustomizationCanvas = dynamic(() => import('@/components/merch/MerchCustomizationCanvas'), { ssr: false }); // Often, canvas components are client-only
        ```
    *   **Portrait Selector Component:** The UI for browsing and selecting from the user's available pet portraits. If this involves loading many images or has complex UI, dynamically import it.
    *   **Variant Selector Component:** UI for selecting different product variants (colors, sizes). Dynamically import if it becomes complex or loads many images/options.
    *   **Customization Controls Panel:** The toolbar with sliders, buttons, etc., for controlling scale, rotation. Can be dynamically imported if it contains heavy UI elements or logic.

### 5. Other Potential Areas (General Recommendation)

*   **Modals & Drawers:** Any complex modal or drawer content that is not visible on initial load should be dynamically imported.
*   **Third-party Libraries:**
    *   Review large third-party libraries. If a library is used only in a specific, non-critical part of the application, ensure it's part of a dynamically imported component.
    *   For charting libraries, complex date pickers, or rich text editors that are not always needed, dynamic imports are crucial.
*   **API Route Handlers (`src/app/api/...`):** While not client-side bundles, ensure API routes are lean and only import necessary code for their specific function.

## Next Steps (Implementation Plan - Corresponds to Task 15 Subtasks)

1.  **(Done for 15.1, but relevant here)** Perform thorough bundle analysis using `@next/bundle-analyzer` to get concrete data on chunk sizes and module contributions. This will help validate the proposed strategy and identify other hotspots.
2.  **(Done: 15.2 - This document)** Review application structure and identify logical splitting points (as documented above).
3.  **(Done: 15.3)** Implement route-based code splitting (primarily by ensuring Next.js conventions are followed and page components are well-structured, including `loading.tsx` and `error.tsx` files).
4.  **(Done: 15.4)** Implement component-level code splitting using `next/dynamic` for the identified high-priority components (e.g., sections on the landing page, `MerchCustomizationCanvas`).
5.  **(Subtask 15.5 - Vendor Bundles Clarification)** Next.js employs an effective default strategy for vendor chunk splitting using Webpack's `SplitChunksPlugin`. This typically separates framework code (React, Next.js) and common libraries from `node_modules` into sensible chunks (e.g., `framework`, `lib`, `shared`). This approach is generally sufficient for good performance and caching. If detailed bundle analysis (from subtask 15.1) specifically identifies very large vendor libraries that are not optimally chunked by the default configuration (e.g., a library used by many pages that could be isolated, or multiple smaller libraries that should be grouped differently), then custom `splitChunks` rules can be implemented within the `webpack` function in `next.config.mjs`. For the current scope, the default Next.js vendor splitting mechanism is considered active and appropriate, with customization reserved for cases where specific, data-driven needs arise.
6.  **(Subtask 15.6 - Preloading and Prefetching)** Next.js provides robust built-in support for preloading and prefetching, which significantly improves navigation speed and resource loading efficiency:
    *   **Prefetching with `next/link`**: By default, Next.js automatically prefetches the necessary JavaScript and CSS for pages linked via `<Link>` components when they enter the viewport (in production builds). This behavior should be maintained by consistently using `next/link` for internal navigation. It can be disabled on a per-link basis with `prefetch={false}` if specific links are known to be rarely followed or lead to very heavy pages where prefetching might be detrimental.
    *   **Preloading for Dynamic Imports**: When using `next/dynamic` for component-level code splitting (as done in subtask 15.4), Next.js often automatically adds `<link rel="preload">` for the associated JavaScript chunks. This ensures these chunks are fetched with higher priority when the dynamically imported component is about to be rendered.
    *   **Verification**: The effectiveness of these strategies can be verified by inspecting the network activity and `<head>` section of the document in browser developer tools during a production build. Look for prefetch links when `next/link` components are visible and preload links when dynamically loaded components are triggered.
    *   **Manual Adjustments**: While Next.js defaults are generally optimal, specific critical resources (e.g., LCP images, critical font files not covered by font optimization) could be manually preloaded by adding `<link rel="preload">` tags directly in the `_document.tsx` or within specific page/layout components if absolutely necessary and proven beneficial through performance analysis. For most JavaScript chunks generated by Next.js, manual preloading is not typically required.
7.  **(Subtask 15.7 - Optimize Loading Sequence)** The loading sequence is largely optimized by leveraging Next.js features:
    *   **Critical Path CSS**: Next.js automatically inlines critical CSS for Server Components. Tailwind CSS, used for styling, generates utility-based CSS, minimizing unused styles.
    *   **JavaScript Execution**: Route-based and component-level code splitting (Subtasks 15.3, 15.4) ensure JavaScript is loaded in chunks and only when needed. `next/script` should be used with appropriate strategies if third-party scripts are added.
    *   **Font Loading**: `next/font` is used (e.g., in `src/app/layout.tsx`) for efficient font loading and self-hosting, which optimizes font delivery.
    *   **Image Prioritization**: Largest Contentful Paint (LCP) images should use the `priority` prop with `next/image` (as seen in `HeroSection.tsx`).
    *   **Chunk Loading Order**: Webpack (via Next.js) manages chunk dependencies and loading order. The preloading/prefetching strategies (Subtask 15.6) further optimize this.
    Further optimizations would involve detailed profiling to identify specific bottlenecks not addressed by these framework-level features.
8.  **(Subtask 15.8 - Measure Performance Improvements)** To measure the impact of the implemented code splitting and optimization strategies, the following steps should be performed by a developer:
    1.  **Create a Production Build:** Run `npm run build` followed by `npm start` to serve a production version of the application locally. Alternatively, deploy to a preview environment.
    2.  **Use Lighthouse:**
        *   Open Chrome DevTools on key pages (e.g., Landing Page, Pets Page, Merch Customization Page).
        *   Navigate to the Lighthouse tab and generate a new report (select "Performance" and "Mobile" or "Desktop" as needed).
        *   Record metrics: First Contentful Paint (FCP), Time to Interactive (TTI), Speed Index, Total Blocking Time (TBT), Cumulative Layout Shift (CLS), and the overall Performance score.
    3.  **Use WebPageTest (Optional but Recommended):**
        *   Go to [webpagetest.org](https://www.webpagetest.org).
        *   Test the URLs of key pages, selecting various test locations and connection types (e.g., "Mobile - 4G") to simulate different user experiences.
        *   Analyze the waterfall charts, Core Web Vitals, and other detailed metrics provided.
    4.  **Analyze Bundle Sizes:**
        *   Run `ANALYZE=true npm run build`.
        *   This will open the bundle analyzer in your browser, showing the size of each chunk.
        *   Compare the current chunk sizes (especially for pages and dynamically loaded components) against any baseline measurements taken during subtask 15.1.
    5.  **Compare with Baseline:** If baseline performance metrics and bundle sizes were recorded before these optimizations (as per subtask 15.1), compare the new measurements to quantify improvements.
    6.  **Document Findings:** Add a summary of the key performance metrics (before/after if available), bundle size changes, and Lighthouse scores to this document or a separate performance report.
9.  **(Subtask 15.9 - This document)** The following sections complete the documentation for the code splitting strategy and best practices.

## Best Practices for Maintaining Code Splitting

*   **Regularly Analyze Bundles:** After significant feature additions or dependency updates, re-run the bundle analyzer (`ANALYZE=true npm run build`) to identify new large chunks or regressions.
*   **Profile Performance:** Periodically use Lighthouse or other profiling tools to check for performance degradation, especially on key user flows.
*   **Prioritize User Experience:** When deciding to split a component or route, consider the impact on user experience. Over-aggressive splitting can lead to too many small requests or noticeable loading states if not handled well.
*   **Keep Dynamic Imports Simple:** Use `next/dynamic` for straightforward component loading. Avoid overly complex logic within the dynamic import itself.
*   **Loading States are Crucial:** Always provide meaningful loading states (skeletons, spinners) for dynamically loaded components to prevent jarring UI changes or perceived slowness. The `loading.tsx` convention in Next.js App Router helps at the route level.
*   **Test on Various Networks/Devices:** Ensure the application performs well not just on a fast developer machine but also on average user devices and network conditions.
*   **Monitor Core Web Vitals:** Continuously monitor Core Web Vitals (LCP, FID/INP, CLS) in production using analytics or RUM (Real User Monitoring) tools to catch issues early.
*   **Update Dependencies Cautiously:** Be mindful when updating large dependencies, as they can significantly impact bundle sizes. Check bundle analysis after updates.

## Troubleshooting Common Code Splitting Issues

*   **Increased CLS (Cumulative Layout Shift):**
    *   **Cause:** Dynamically loaded content pushing existing content around, or loading states not reserving proper space.
    *   **Solution:** Ensure loading skeletons or placeholders have dimensions similar to the content they replace. For images, use `width` and `height` props on `next/image` to reserve space.
*   **Flash of Unstyled Content (FOUC) or Missing Styles for Dynamic Components:**
    *   **Cause:** CSS for a dynamically loaded component might not be available immediately when the component renders.
    *   **Solution:** Next.js generally handles CSS for its chunks well. If issues occur, ensure styles are correctly associated with the component and that there are no race conditions in CSS loading. For Client Components, CSS is bundled with the JS.
*   **Slow Initial Load Despite Splitting:**
    *   **Cause:** The main entry chunk might still be too large, or there are too many synchronous render-blocking resources.
    *   **Solution:** Re-analyze the main chunk. Ensure critical CSS is minimal. Defer non-essential scripts (using `next/script` strategies). Check for large images not being optimized or prioritized correctly.
*   **Too Many Small Chunks Leading to Network Overhead:**
    *   **Cause:** Over-aggressive splitting of very small components.
    *   **Solution:** Group related small components or reconsider if splitting a very small component provides significant benefit. Webpack's `minSize` and `minChunks` options in `splitChunks` (if customizing) can help control this, but Next.js defaults are usually sensible.
*   **Errors during Dynamic Import (Chunk Load Failure):**
    *   **Cause:** Network issues, deployment errors where a chunk is missing, or incorrect paths.
    *   **Solution:** Implement robust error boundaries around dynamically imported components. Next.js App Router uses `error.tsx` for route-level errors. For component-level dynamic imports, consider using React Error Boundaries or a custom error state within the `Suspense` fallback.
*   **Prefetching/Preloading Not Working as Expected:**
    *   **Cause:** `next/link` `prefetch` prop might be `false`, or an issue with how dynamic imports are configured.
    *   **Solution:** Verify `prefetch` prop on `Link` components. Use browser developer tools (Network tab) to inspect if resources are being prefetched/preloaded. Ensure dynamic imports are standard `next/dynamic` calls.

This document now outlines the implemented code splitting strategy, steps for maintaining it, and guidance for troubleshooting common issues.

## Further Performance Optimizations (Task #16)

This section details strategies related to Task #16, building upon the code splitting work.

### Subtask 16.1: Critical Rendering Path Analysis (Done)

*   **Action:** Developer to perform analysis using browser tools and document findings in `docs/performance/CRP_ANALYSIS.md`.
*   **Outcome:** Baseline metrics and identified bottlenecks.

### Subtask 16.2: Render-Blocking Resource Optimization

*   **Objective:** Minimize resources that block the initial rendering of the page, based on findings from CRP_ANALYSIS.md.
*   **Strategies:**
    1.  **Critical CSS:**
        *   Next.js App Router automatically inlines critical CSS for Server Components.
        *   For critical above-the-fold content rendered by Client Components, if the CRP analysis identifies significant CSS blocking rendering, consider manually extracting minimal critical CSS and inlining it. This is an advanced technique and should be data-driven.
        *   Ensure Tailwind CSS is efficiently purging unused styles (default behavior).
    2.  **Asynchronous CSS Loading:** For any non-critical CSS files (if any are manually added outside of component imports or Tailwind), load them asynchronously. Example:
        ```html
        <link rel="stylesheet" href="/path/to/non-critical.css" media="print" onload="this.media='all'">
        <noscript><link rel="stylesheet" href="/path/to/non-critical.css"></noscript>
        ```
    3.  **JavaScript `async` / `defer`:**
        *   Next.js automatically handles its own JavaScript chunks with optimal loading strategies.
        *   If adding custom third-party scripts, use `next/script` with appropriate strategies (e.g., `strategy="lazyOnload"` or `strategy="afterInteractive"`).
        *   Avoid manually adding blocking `<script>` tags in `_document.tsx` or `layout.tsx`. If unavoidable, ensure they use `async` or `defer` attributes correctly based on their dependencies and execution needs.
    4.  **Code Splitting for JavaScript:** (Covered in Task #15) Ensure that route-based and component-level code splitting is effectively reducing the amount of JavaScript loaded upfront.
*   **Verification:** Re-run Lighthouse and performance analysis after changes. Check for a reduction in "Eliminate render-blocking resources" warnings and an improvement in FCP/LCP, aiming for the acceptance criteria outlined in subtask 16.2's description (e.g., FCP improvement of at least 15%).

### Subtask 16.3: Font Loading Strategy Implementation

*   **Objective:** Optimize font loading to prevent layout shifts (CLS) and improve perceived performance.
*   **Current Implementation (`src/app/layout.tsx` via `next/font`):
    *   **Self-Hosting & Optimization:** `next/font` automatically self-hosts Google Fonts (Inter, Montserrat, Open Sans, Caveat are used), optimizing them for performance and reducing external requests.
    *   **`font-display: swap`:** All configured fonts use `display: "swap"`, ensuring text renders quickly with a fallback font, then swaps to the custom font. This benefits FCP/LCP.
    *   **Subsetting:** Fonts are subsetted to `"latin"`, reducing file size.
    *   **Preloading:** `next/font` inlines critical font declarations, effectively preloading them.
*   **Further Actions & Verification (Developer Tasks):
    1.  **Verify CLS:** Use Lighthouse and Chrome DevTools (Performance tab > Web Vitals) to measure CLS related to font loading on key pages. The goal is zero or near-zero CLS caused by fonts.
    2.  **Fallback Font Metrics:** If CLS is an issue with `display: swap`, investigate the metric differences between fallback system fonts and the custom fonts. Advanced solutions (not typically needed with `next/font` v13+ but good to be aware of) could involve using the `size-adjust`, `ascent-override`, etc., descriptors in `@font-face` rules if `next/font` doesn't fully mitigate this. However, `next/font` aims to handle this well.
    3.  **Consider `display: optional`:** If CLS is persistent and a very short period of invisible text is acceptable for certain non-critical text elements, `display: "optional"` could be an alternative for those specific font instances, though `swap` is generally a good balance.
    4.  **Variable Fonts Check:** Confirm if the specific fonts being used (Inter, Montserrat, etc.) are being served as variable fonts by `next/font`. If they support variable axes (e.g., weight, slant) and the design uses multiple variations, variable fonts can be more efficient than loading many individual static font files. `next/font` typically handles this well if the source font is variable.
    5.  **Measure Font Render Time:** While difficult to isolate to precisely 100ms, aim for fast perceived font rendering. Use DevTools to observe when text becomes visible with the web fonts.
*   **Acceptance Criteria:** As per subtask description (Zero CLS from fonts, fast font rendering). The current `next/font` setup provides a strong foundation.

### Subtask 16.4: Performance Budget Implementation in CI/CD

*   **Objective:** Establish performance budgets and integrate automated checks into the CI/CD pipeline to prevent regressions.
*   **Steps & Guidance (Developer Tasks):
    1.  **Define Budgets:** Based on project goals and the baseline analysis (from 16.1), define specific budgets for key metrics. Examples:
        *   Largest Contentful Paint (LCP): `< 2.5s`
        *   Total Blocking Time (TBT): `< 200ms`
        *   Cumulative Layout Shift (CLS): `< 0.1`
        *   Size of key JavaScript bundles (e.g., main page chunk): `< 150KB`
        *   Number of requests on initial load: `< 30`
    2.  **Configure Lighthouse CI:** Lighthouse CI is a suite of tools that makes it easy to integrate Lighthouse into CI workflows.
        *   **Installation:** Add Lighthouse CI packages: `npm install -D @lhci/cli @lhci/server` (or `yarn add -D ...`). The server part is optional if you use a public results viewer or just rely on CI output.
        *   **Configuration (`lighthouserc.js` or `lighthouserc.json`):** Create a configuration file in the project root. Example `lighthouserc.js`:
            ```javascript
            module.exports = {
              ci: {
                collect: {
                  // Command to run your production build and start a server
                  // Adjust if your start command is different or needs a specific port
                  startServerCommand: 'npm run build && npm start -- -p 9000',
                  startServerReadyPattern: 'ready on http://localhost:9000',
                  url: [
                    'http://localhost:9000/',
                    'http://localhost:9000/pets',
                    // Add other key URLs to audit
                  ],
                  numberOfRuns: 3, // Run multiple times for more stable results
                },
                assert: {
                  // assertions relevant to your budgets
                  preset: 'lighthouse:recommended', // Starts with sensible defaults
                  assertions: {
                    'largest-contentful-paint': ['warn', {maxNumericValue: 2500}], // LCP < 2.5s (warning)
                    'total-blocking-time': ['error', {maxNumericValue: 200}],       // TBT < 200ms (error)
                    'cumulative-layout-shift': ['warn', {maxNumericValue: 0.1}],    // CLS < 0.1 (warning)
                    'resource-summary:script:size': ['warn', {maxNumericValue: 150 * 1024}], // JS size example
                    // 'uses-responsive-images': 'off', // Example of turning off a check if not relevant
                  },
                },
                upload: {
                  // Optional: Configure to upload reports (e.g., to LHCI Server, GCS, S3, temporary public storage)
                  // target: 'temporary-public-storage', // Easiest for quick setup
                  // For a persistent LHCI server, you'd configure `serverBaseUrl` and `token`.
                },
              },
            };
            ```
        *   **Add npm scripts to `package.json`:**
            ```json
            "scripts": {
              // ... other scripts
              "lhci:collect": "lhci collect",
              "lhci:assert": "lhci assert",
              "lhci:upload": "lhci upload", // if uploading
              "lhci:autorun": "lhci autorun" // Runs collect, assert, and upload
            },
            ```
    3.  **Integrate into CI (e.g., GitHub Actions):** Create a workflow file (e.g., `.github/workflows/lighthouse-ci.yml`):
        ```yaml
        name: Lighthouse CI

        on:
          push:
            branches: [ main ]
          pull_request:
            branches: [ main ]

        jobs:
          lhci:
            name: Lighthouse
            runs-on: ubuntu-latest
            steps:
              - uses: actions/checkout@v3
              - name: Use Node.js 18.x
                uses: actions/setup-node@v3
                with:
                  node-version: '18.x'
                  cache: 'npm' # or yarn
              
              - name: Install dependencies
                run: npm ci # or yarn install --frozen-lockfile

              # Build your Next.js app (if not done by lhci startServerCommand)
              # - name: Build application
              #   run: npm run build
              
              - name: Run Lighthouse CI
                run: npm run lhci:autorun
                # Or, if you want to fail the build on assertion errors:
                # run: |
                #   npm run lhci:collect
                #   npm run lhci:assert -- --fatal
                #   npm run lhci:upload # If uploading
                env:
                  LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }} # Optional: for status checks on PRs
        ```
        *   The `LHCI_GITHUB_APP_TOKEN` is for richer PR comments/status checks. Setup involves installing the LHCI GitHub App on your repository.
    4.  **Iterate on Budgets:** Regularly review Lighthouse CI reports. Adjust budgets as the application evolves and as optimizations are made. Budgets should be challenging but achievable.
*   **Verification:** CI pipeline runs Lighthouse checks automatically. Builds fail or warn if budgets are exceeded. Reports are available for review.
*   **Acceptance Criteria:** Functional CI/CD pipeline that enforces defined performance budgets and prevents/alerts on performance regressions.

This strategy provides a roadmap. Actual implementation will require careful component refactoring and testing to ensure functionality and measure performance gains.

### Subtask 16.5: Image Optimization Automation

*   **Objective:** Implement comprehensive image optimization using Next.js features and best practices.
*   **Key Next.js Feature: `next/image` Component**
    *   **Automatic Optimization:** The `<Image>` component from `next/image` provides automatic image optimization. It resizes, optimizes, and serves images in modern formats like WebP or AVIF (if configured and supported by the browser).
    *   **Responsive Images (`srcset` and `sizes`):** Automatically generates `srcset` based on `deviceSizes` and `imageSizes` configured in `next.config.mjs` (or defaults). The `sizes` prop on `<Image>` is crucial for correct `srcset` selection and avoiding layout shifts.
    *   **Lazy Loading:** Defaults to `loading="lazy"` for images not initially in the viewport. For above-the-fold or LCP (Largest Contentful Paint) images, use `priority={true}`.
    *   **Layout Shift Prevention (CLS):** Requires `width` and `height` props (for local images, these are often inferred) or `fill` prop with appropriate CSS to prevent layout shifts.
*   **Configuration (`next.config.mjs`):
    *   **Formats:** Ensure `images.formats: ['image/avif', 'image/webp']` is set (as done in this step) to enable these modern formats.
    *   **`deviceSizes` / `imageSizes`:** Review and customize if the default breakpoints are not optimal for the design.
    *   **Remote Patterns/Domains:** If using external images, configure `images.remotePatterns` (preferred) or `images.domains` to allow optimization.
    *   **Loader:** The default Next.js loader is generally good. For specific needs (e.g., advanced transformations, existing image CDN), a custom loader can be configured.
*   **Implementation Steps & Guidance (Developer Tasks):
    1.  **Audit `<img>` tags:** Replace all standard `<img>` tags with `next/image` where appropriate.
    2.  **Provide `width` & `height`:** For local static images, these are usually inferred. For remote images, explicitly provide `width` and `height` for the source image to allow Next.js to calculate aspect ratio and generate correct `srcset`.
    3.  **Use `sizes` Prop Correctly:** For responsive images that change width based on viewport, provide an accurate `sizes` prop. This tells the browser which image in the `srcset` to download. Example: `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"`.
    4.  **Set `priority={true}` for LCP Images:** Identify the LCP image on each critical page (e.g., hero image) and add `priority={true}` to the `<Image>` component. This disables lazy loading and preloads the image.
    5.  **Quality Prop:** Adjust the `quality` prop (1-100, default 75) on `<Image>` if finer control over compression is needed for specific images, but generally, the default is a good balance.
    6.  **Placeholders:** Use the `placeholder` prop (`blur` or `empty`) to improve perceived loading performance. `blur` requires `blurDataURL` for remote images if not automatically generated.
    7.  **Image CDN (Optional but Recommended for Scale):** For larger applications, consider integrating an image CDN (e.g., Cloudinary, Imgix, Akamai) by configuring a custom loader in `next.config.mjs`. This can offload optimization and provide more advanced features.
    8.  **Guidelines for Content Creators:** If content creators add images, provide guidelines on:
        *   Uploading reasonably sized images (not excessively large dimensions before optimization).
        *   Choosing appropriate image types (e.g., JPEG for photos, PNG for graphics with transparency, SVG for icons/logos).
*   **Verification:**
    *   Inspect image requests in browser DevTools: check for WebP/AVIF format, correct `srcset` and `sizes`, and appropriate `loading` attribute.
    *   Use Lighthouse to check for image-related optimization opportunities.
    *   Verify LCP images load quickly.
*   **Acceptance Criteria:** As per subtask (all images optimized, 40% payload reduction). Requires measurement before and after the changes.

This strategy provides a roadmap. Actual implementation will require careful component refactoring and testing to ensure functionality and measure performance gains.

### Subtask 16.6: Real User Monitoring (RUM) Implementation

*   **Objective:** Set up comprehensive RUM to track Core Web Vitals (CWV) and custom performance metrics from actual user sessions.
*   **Next.js Built-in Reporting (`reportWebVitals`):
    *   The App Router allows exporting a `reportWebVitals` function from a root `layout.tsx` or `template.tsx`.
    *   A basic implementation has been added to `src/app/layout.tsx` which logs metrics to the console:
        ```typescript
        interface WebVitalsMetric {
          id: string;
          name: 'FCP' | 'LCP' | 'CLS' | 'FID' | 'TTFB' | 'INP';
          startTime: number;
          value: number;
          label: 'web-vital' | 'custom';
          attribution?: Record<string, any>; 
          navigationType?: 'navigate' | 'reload' | 'back-forward';
        }

        export function reportWebVitals(metric: WebVitalsMetric) {
          console.log(metric);
          // Send to analytics service here
        }
        ```
*   **Implementation Steps & Guidance (Developer Tasks):
    1.  **Choose RUM Solution:** Decide whether to use a third-party RUM service (e.g., Vercel Analytics (zero-config), New Relic, Datadog, Sentry Performance) or send data to an existing analytics platform like Google Analytics 4 (GA4).
    2.  **Integrate with Analytics Service:** Modify the `reportWebVitals` function in `src/app/layout.tsx` to send the `metric` object to the chosen service. Refer to the specific service's documentation for integration details. Example for GA4 (conceptual, requires GA setup):
        ```javascript
        // Inside reportWebVitals(metric)
        if (typeof window.gtag === 'function') {
          window.gtag('event', metric.name, {
            event_category: 'Web Vitals',
            value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
            event_label: metric.id,
            non_interaction: true,
          });
        }
        ```
    3.  **Collect All Core Web Vitals:** Ensure the integration correctly captures LCP, CLS, and INP (or FID as a proxy if INP data isn't directly available/supported by the tool yet). TTFB and FCP are also commonly reported.
    4.  **Custom Performance Marks/Measures:** For more granular insights into application-specific performance, use the User Timing API (`performance.mark()`, `performance.measure()`). These custom metrics can then be collected by some RUM tools or sent manually.
    5.  **Dashboarding & Alerting:** Configure dashboards in your RUM/analytics tool to visualize performance trends. Set up alerts for significant regressions in CWV or other key metrics.
    6.  **Segmentation:** Ensure your RUM setup allows segmenting data by device type, browser, connection speed, geography, etc., to identify specific problem areas.
*   **Verification:**
    *   Confirm that Web Vitals data is appearing in the chosen analytics/RUM platform from real user sessions (after deployment).
    *   Check that data can be segmented and dashboards are correctly displaying CWV.
*   **Acceptance Criteria:** Functional RUM system collecting data from user sessions, with proper segmentation and alerting capabilities set up by the developer.

This strategy provides a roadmap. Actual implementation will require careful component refactoring and testing to ensure functionality and measure performance gains. 

### Subtask 16.7: Caching Strategy Implementation

*   **Objective:** Implement effective caching strategies to reduce load times for repeat visitors and minimize server load.
*   **Key Areas for Caching:**
    1.  **Browser Caching (HTTP Headers):** Instruct the browser how long to cache static assets.
    2.  **CDN Caching:** If a CDN is used, configure its caching policies. Next.js applications on platforms like Vercel benefit from Vercel's Edge Network (CDN) which automatically caches static assets and Server/ISR responses.
    3.  **Service Worker Caching (for PWAs):** For Progressive Web Apps, Service Workers can provide advanced caching control, enabling offline access and more granular caching strategies for assets and API responses.
    4.  **Data Caching (Server-Side & Client-Side):** Caching responses from APIs or databases.

*   **Implementation in `next.config.mjs` (HTTP Headers for Static Assets):**
    *   The `headers` function in `next.config.mjs` has been updated to set `Cache-Control` headers for static assets served from `/_next/static/` and `/fonts/`:
        ```javascript
        async headers() {
          return [
            {
              source: '/_next/static/(.*)',
              headers: [
                {
                  key: 'Cache-Control',
                  value: 'public, max-age=31536000, immutable', // Cache for 1 year
                },
              ],
            },
            {
              source: '/fonts/(.*)', // Specific rule for fonts if needed, or can be part of _next/static
              headers: [
                {
                  key: 'Cache-Control',
                  value: 'public, max-age=31536000, immutable',
                },
              ],
            },
          ];
        }
        ```
    *   `public`: Allows proxies and CDNs to cache the asset.
    *   `max-age=31536000`: Tells the browser to cache the asset for 1 year.
    *   `immutable`: Indicates the file content will never change, so the browser doesn't need to revalidate it (Next.js uses content hashing for static assets, ensuring new versions get new URLs).

*   **CDN Caching:**
    *   **Vercel (or similar platforms):** Typically handles CDN caching automatically for static assets and optimized images. For dynamic content, caching depends on `Cache-Control` headers set by ISR (Incremental Static Regeneration) or Server Components.
    *   **Self-hosted/Other CDNs:** Configure the CDN to respect `Cache-Control` headers from the origin. Define appropriate TTLs (Time To Live) for different content types.

*   **Service Worker Caching (PWA - Future Consideration):**
    *   If the application evolves into a PWA, a Service Worker can be implemented (e.g., using `next-pwa`).
    *   Strategies for a Service Worker:
        *   **Cache-first for static assets:** Serve app shell and static assets directly from cache.
        *   **Stale-while-revalidate for dynamic content/API calls:** Serve from cache for speed, then update in the background.
        *   **Network-first or network-only for critical, frequently changing data.**
        *   **Precaching:** Cache key assets when the Service Worker is installed.

*   **Data Caching:**
    *   **Server-Side (Next.js App Router):**
        *   **Full Route Cache:** Server Components are cached by default on the server.
        *   **`fetch` Caching:** Next.js extends `fetch` to automatically cache requests. Behavior can be controlled with `cache` and `next.revalidate` options.
        *   **Route Segment Config:** Use `export const revalidate = <seconds>;` in page/layout files for time-based revalidation.
        *   **On-demand Revalidation:** Use `revalidatePath` or `revalidateTag` for event-driven cache invalidation.
    *   **Client-Side:**
        *   Libraries like React Query (`@tanstack/react-query`) or SWR provide robust client-side caching, synchronization, and background updates for API data.
        *   These are beneficial for managing server state in Client Components and reducing redundant API calls.

*   **Implementation Steps & Guidance (Developer Tasks):
    1.  **Verify HTTP Headers:** After deploying changes to `next.config.mjs`, use browser DevTools (Network tab) to inspect the `Cache-Control` headers for static assets (`.js`, `.css`, image files, fonts).
    2.  **Test CDN Behavior:** If using a CDN, verify its caching behavior (e.g., by checking response headers like `X-Cache-Status`, `CF-Cache-Status`, or similar, depending on the CDN provider).
    3.  **Implement Client-Side Data Caching (If applicable):** If the application relies heavily on dynamic data in Client Components, integrate a library like React Query or SWR for routes that would benefit from it (e.g., pet lists, order history, user profile data).
    4.  **Implement Server-Side Data Caching Strategies:** Utilize Next.js App Router's data caching features for `fetch` requests in Server Components, and configure revalidation policies (time-based or on-demand) as needed for data freshness.
    5.  **Consider Service Worker for PWA (Future):** If PWA functionality becomes a requirement, plan and implement Service Worker caching using `next-pwa` or a custom setup.
*   **Verification:**
    *   Reduced load times for repeat visits (check DevTools for assets served from browser cache or CDN cache).
    *   Correct `Cache-Control` headers on assets.
    *   Reduced number of requests to the origin server for cached content.
*   **Acceptance Criteria:** Implemented caching strategies resulting in measurable performance improvements for repeat users and reduced server load. 

### Subtask 16.8: Analytics and A/B Testing Integration

*   **Objective:** Implement comprehensive analytics and A/B testing framework with performance considerations, ensuring minimal impact on load times and interactivity.
*   **Key Components & Strategy:**
    1.  **Core Event Tracking Utility (`src/lib/analytics.ts`):
        *   A foundational `trackEvent` function has been created. Initially, it logs events to the console.
        *   This utility will be the central point for sending event data to a chosen analytics provider.
        *   **Action (Developer):** Integrate this `trackEvent` function with a specific analytics service (e.g., Google Analytics 4, Mixpanel, Segment, Vercel Analytics). Ensure the integration is non-blocking (e.g., using `async` scripts or provider-recommended snippets).
    2.  **Identifying Key User Interactions for Event Tracking:
        *   **Authentication:** User sign-up, sign-in, sign-out, password reset requests.
        *   **Pet Management:** Pet creation, photo upload, pet selection for portraits/merch, pet edits, pet deletion.
        *   **Portrait Generation:** Initiating portrait generation, style selection, revision requests.
        *   **Merchandise Customization:** Blueprint selection, variant choice (color, size), portrait application to merch, customization adjustments (scale, rotation), adding to cart.
        *   **Checkout Process:** Initiating checkout, payment method selection, successful order completion, payment failures.
        *   **Navigation & Engagement:** Key button clicks (e.g., CTAs on landing page), feature usage (e.g., gallery views, order history), help/FAQ interactions.
        *   **Action (Developer):** Instrument these interactions throughout the codebase by calling `trackEvent` with appropriate event names and properties (e.g., `category`, `label`, `value`, custom properties like `petId`, `blueprintId`).
    3.  **Conversion Funnel Setup:
        *   **Define Key Funnels:**
            *   New User Registration Funnel (e.g., Visit -> Signup Page -> Signup Success).
            *   Pet Portrait Creation Funnel (e.g., Upload Pet -> Select Style -> Generate -> View Portrait).
            *   Merchandise Purchase Funnel (e.g., View Merch -> Customize -> Add to Cart -> Checkout -> Purchase Confirmation).
        *   **Action (Developer):** Configure these funnels within the chosen analytics platform using the tracked events as funnel steps.
    4.  **A/B Testing Framework Integration:
        *   **Choose a Framework:** Select an A/B testing tool (e.g., Google Optimize (sunsetting, consider alternatives like VWO, Optimizely, or a self-hosted/feature flag based solution like PostHog, LaunchDarkly, or Vercel Edge Config with middleware for simple splits).
        *   **Performance Considerations:** Ensure the A/B testing script is loaded asynchronously and efficiently. Minimize any flicker effect by applying variations server-side if possible (e.g., via edge functions/middleware) or very early client-side.
        *   **Track Experiment Data:** Send experiment and variation data as properties with relevant analytics events or as user properties to the analytics platform to segment results.
        *   **Action (Developer):** Integrate the chosen A/B testing framework. Set up an initial simple A/B test (e.g., CTA button text) to verify integration.
    5.  **Custom Dimensions for Performance Metrics:
        *   While `reportWebVitals` captures Core Web Vitals, consider sending these (or derived scores/categories) as custom dimensions to your main analytics platform if it doesn't integrate them natively from RUM.
        *   This allows segmenting user behavior by their performance experience.
        *   **Action (Developer):** If needed, configure custom dimensions in the analytics platform and send relevant performance data (e.g., LCP category: good/needs-improvement/poor) via `trackEvent` or user properties.
    6.  **Analytics Data Layer (Conceptual):
        *   A data layer (e.g., a JavaScript object `window.dataLayer`) can centralize data for analytics and tag management systems. While not strictly necessary for a direct integration, it's a best practice for more complex setups or if using Google Tag Manager.
        *   For now, direct calls to `trackEvent` are simpler. This can be revisited if requirements grow.
    7.  **Performance Optimization of Analytics Code:
        *   **Asynchronous Loading:** All third-party analytics/tag manager scripts must be loaded asynchronously to avoid blocking rendering.
        *   **Minimal Impact:** The chosen analytics solution and A/B testing tool should have minimal impact on page load times and interactivity. Aim for well under 50ms total script execution time for analytics as per the acceptance criteria.
        *   **Event Batching:** If the analytics provider supports it and event volume is high, consider event batching to reduce network requests (though many modern providers handle this efficiently).
        *   **Action (Developer):** Profile the impact of analytics scripts using browser DevTools and Lighthouse. Choose lightweight solutions where possible.

*   **Implementation Steps & Guidance (Developer Tasks - Summary):
    1.  Integrate `src/lib/analytics.ts` with a chosen analytics provider.
    2.  Instrument key user interactions using `trackEvent`.
    3.  Configure conversion funnels in the analytics platform.
    4.  Select and integrate an A/B testing framework, focusing on performance.
    5.  If necessary, set up custom dimensions for performance data in analytics.
    6.  Continuously monitor and optimize the performance impact of all analytics/testing scripts.
*   **Verification:**
    *   Events are correctly tracked and appear in the analytics platform.
    *   Funnels correctly report user progression.
    *   A/B tests can be run and data segmented.
    *   Lighthouse and DevTools show minimal performance impact from analytics/testing scripts (script execution time < 50ms for these tools).
*   **Acceptance Criteria:** Complete analytics implementation with minimal performance impact, enabling event tracking, funnel analysis, and A/B testing. 

### Subtask 16.11: Performance Testing Automation

*   **Objective:** Establish a robust, automated performance testing strategy that runs regularly across different environments, devices, and network conditions, providing comprehensive reports and alerts.
*   **Key Strategies (Expanding on Lighthouse CI from 16.4):
    1.  **Synthetic Testing with WebPageTest API:
        *   WebPageTest (WPT) offers more in-depth analysis and testing from real browsers in global locations with various connection types.
        *   **Tooling:** Use the `webpagetest` npm package or other WPT API wrappers to integrate tests into scripts or CI.
        *   **API Key:** A WPT API key is usually required for automated tests (free keys have limitations, consider a paid plan for heavy usage).
        *   **Test Scripts:** Define WPT scripts to test key user flows, not just single page loads (e.g., login, add to cart, checkout).
        *   **Metrics:** Track Core Web Vitals, Speed Index, custom metrics, and capture video/filmstrips.
        *   **Action (Developer):** Set up scripts to trigger WPT tests for critical pages/flows. Integrate WPT result summaries into CI reports or a performance dashboard. This typically runs less frequently than Lighthouse CI due to WPT test duration and API limits (e.g., nightly or weekly).
    2.  **Multi-Environment Testing:
        *   **Staging/Pre-production:** Run comprehensive performance tests (Lighthouse CI, WPT) in a staging environment that closely mirrors production before deploying changes.
        *   **Production Monitoring (RUM):** Real User Monitoring (Subtask 16.6) provides data from production, complementing synthetic tests.
        *   **Production Synthetic Tests (Cautiously):** Running light synthetic checks against production can be useful, but be mindful of the load on production servers.
        *   **Action (Developer):** Configure CI jobs or scheduled tasks to run performance tests against the staging environment. Ensure RUM is actively monitoring production.
    3.  **Device & Network Profile Configuration:
        *   **Lighthouse CI:** Can be configured to simulate different device form factors (mobile, desktop) and network throttling (e.g., in `lighthouserc.js` under `collect.settings.emulatedFormFactor` and `collect.settings.throttlingMethod`).
        *   **WebPageTest:** Provides a wide range of real device profiles and network connectivity options through its UI and API.
        *   **Action (Developer):** Define a set of representative device profiles (e.g., average mobile, high-end mobile, desktop) and network conditions (e.g., slow 4G, fast 4G, WiFi) for testing in both Lighthouse CI and WPT.
    4.  **Historical Performance Reports & Trend Analysis:
        *   **Lighthouse CI Server / Storage:** Upload Lighthouse reports to a persistent store (LHCI server, cloud storage) to track trends over time. The LHCI server provides a dashboard for this.
        *   **WPT History:** WPT test results can be stored and accessed via their UI if using an account, or results can be programmatically saved and aggregated.
        *   **Action (Developer):** Ensure performance test results are stored historically. Set up dashboards or reporting to visualize performance trends and identify regressions or improvements over time.
    5.  **Visual Comparison Testing for Layout Shifts (CLS):
        *   Tools like Percy, Applitools, or BackstopJS can be used for visual regression testing, which helps catch unexpected visual changes, including those contributing to CLS.
        *   Some tools can integrate with Lighthouse or WPT filmstrips.
        *   **Action (Developer):** Evaluate and potentially integrate a visual regression testing tool into the CI pipeline, focusing on pages prone to layout shifts or critical UI elements.
    6.  **Alerting for Regressions:
        *   Lighthouse CI assertions (defined in `lighthouserc.js`) already provide a form of alerting by failing builds or issuing warnings.
        *   Extend alerting to WPT results (e.g., if key metrics degrade beyond a threshold).
        *   Integrate alerts with team communication channels (e.g., Slack, email).
        *   **Action (Developer):** Refine alerting mechanisms from Lighthouse CI. Implement alerts for WPT if significant regressions are detected in its scheduled runs.

*   **Implementation Steps & Guidance (Developer Tasks - Summary):
    1.  Set up automated WebPageTest API scripts for key user flows.
    2.  Configure performance tests to run in staging environments.
    3.  Define and apply diverse device and network profiles for testing.
    4.  Implement historical storage and trend analysis for performance reports.
    5.  Evaluate and integrate visual comparison testing tools to monitor CLS.
    6.  Enhance and broaden alerting for performance regressions from all automated tests.
*   **Verification:**
    *   Automated performance tests (Lighthouse CI, WPT) run regularly (e.g., daily/weekly) as scheduled or on CI triggers.
    *   Comprehensive reports are generated, showing historical data and trends.
    *   Alerts are triggered for significant performance regressions.
    *   Visual regression tests (if implemented) catch layout shifts.
*   **Acceptance Criteria:** Automated performance testing pipeline running daily, generating comprehensive reports with historical data and effective alerting for regressions.

### Subtask 16.12: Documentation and Knowledge Transfer

*   **Objective:** Consolidate all performance optimization documentation, establish ongoing best practices and maintenance strategies, and ensure the development team is equipped to maintain and build upon these optimizations.
*   **Completed Documentation (within this document - `docs/CODE_SPLITTING_STRATEGY.md`):
    *   Detailed strategies and implementation guidance for code splitting (Task #15).
    *   Critical Rendering Path analysis guidance (16.1).
    *   Render-blocking resource optimization (16.2).
    *   Font loading strategy (16.3).
    *   Performance budget implementation in CI/CD (16.4).
    *   Image optimization automation (16.5).
    *   Real User Monitoring (RUM) implementation (16.6).
    *   Caching strategy (16.7).
    *   Analytics and A/B testing integration with performance considerations (16.8).
    *   Server response time optimization (TTFB) (16.9).
    *   JavaScript optimization (16.10).
    *   Performance testing automation (16.11).
    *   Troubleshooting tips have been included within relevant sections.

*   **Consolidated Performance Best Practices & Maintenance (Summary for Developers):
    1.  **Ongoing Bundle Analysis:** Regularly run `ANALYZE=true npm run build` after new features or dependency updates to monitor bundle sizes and composition. Act on unexpected increases.
    2.  **Adherence to Code Splitting:** Continue to use `next/dynamic` for non-critical, large, or conditionally rendered components. Review new UI for splitting opportunities.
    3.  **Image Optimization Discipline:** Consistently use `next/image` with correct `priority`, `width`, `height`, and `sizes` props. Audit new image additions.
    4.  **Efficient Data Fetching & Caching:** Apply Next.js App Router caching (`fetch` options, `revalidate`) thoughtfully. Optimize database queries and use indexes. Profile server response times.
    5.  **JavaScript Best Practices:** Write tree-shakeable code. Defer non-critical tasks (`requestIdleCallback`). Profile and optimize long-running client-side JS. Consider Web Workers for heavy computations. Manage bundle sizes diligently.
    6.  **Monitor CI/CD Performance Budgets:** Pay attention to Lighthouse CI alerts. Investigate and address budget violations promptly. Update budgets сознательно as the application evolves.
    7.  **Review RUM Data:** Regularly check Real User Monitoring dashboards to understand real-world performance and identify regressions or areas needing attention based on user experience.
    8.  **Iterate on Automated Tests:** Keep performance test scripts (Lighthouse CI, WPT) up-to-date with new key pages and user flows.
    9.  **Mindful Dependency Management:** Evaluate the performance impact of adding new third-party libraries. Prefer lightweight alternatives where possible.
    10. **Stay Updated:** Keep abreast of Next.js performance features and web performance best practices.

*   **Performance Budget Maintenance Strategy (Summary):
    *   Budgets are defined in `lighthouserc.js` and checked by Lighthouse CI (Subtask 16.4).
    *   Regularly review CI reports. If budgets are consistently hit or easily beaten, consider tightening them. If consistently failed, investigate regressions or re-evaluate if the budget is too aggressive for the current application state (but aim to fix regressions first).
    *   Major features might require a conscious decision to adjust budgets, documented with reasoning.

*   **Troubleshooting Performance Issues (General Approach):
    1.  **Isolate:** Is the issue page-specific, component-specific, or global? Does it affect all users or specific segments (browser, network, device)? (Use RUM data).
    2.  **Reproduce:** Can it be reproduced locally or in staging? Use DevTools throttling.
    3.  **Profile:**
        *   **Client-Side:** Use Lighthouse for an overview. Use DevTools Performance tab for detailed CPU profiling, long tasks, layout shifts, rendering bottlenecks. Check Network tab for resource loading issues (waterfalls, sizes, caching).
        *   **Server-Side:** Check TTFB. Use APM tools or hosting platform logs to identify slow API routes, database queries, or server-side computations.
    4.  **Analyze Bundles:** `ANALYZE=true npm run build` to check for unexpected large modules or incorrect chunking.
    5.  **Consult Documentation:** Refer to this document (`docs/CODE_SPLITTING_STRATEGY.md`) and specific subtask details for relevant optimization techniques.
    6.  **Iterate & Verify:** Implement a fix, test, and measure again.

*   **Knowledge Transfer (Developer/Team Actions):
    1.  **Review This Document:** The development team should thoroughly review this consolidated performance documentation.
    2.  **Scheduled Knowledge Transfer Sessions:** Conduct at least two sessions:
        *   Session 1: Overview of key performance strategies implemented (code splitting, image opt, caching, RUM, CI budgets).
        *   Session 2: Deep dive into ongoing maintenance, monitoring (RUM, CI reports), and troubleshooting common performance issues using the established tools and practices.
    3.  **Team Survey:** After sessions and documentation review, conduct a survey to gauge team confidence in understanding and maintaining the performance optimizations (aiming for 90% confidence).

*   **Acceptance Criteria (for this AI-driven part of the subtask):
    *   This document (`docs/CODE_SPLITTING_STRATEGY.md`) is updated to serve as the comprehensive documentation for implemented performance strategies, best practices, and maintenance/troubleshooting guidance.
    *   The remaining actions (knowledge transfer sessions, team survey) are for the development team to execute.

This concludes the planned performance optimization tasks. The focus now shifts to developer implementation, ongoing monitoring, and maintenance based on this guidance.