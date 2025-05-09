# CanvaPet

Transform your pet photos into beautiful AI-generated portraits with custom styles and effects. CanvaPet allows users to upload photos of their pets, have them validated by AI to ensure a pet is present, apply various artistic customizations, and even order physical merchandise featuring their creations.

## 🚀 Features

-   **User Authentication**: Secure email/password signup & login (Supabase Auth).
-   **Pet Photo Management**:
    -   Drag-and-drop uploads with client-side validation & compression.
    -   Secure, user-specific storage (Supabase Storage).
    -   AI Pet Detection (Google Cloud Vision API).
-   **AI Portrait Generation**:
    -   Integration with OpenAI DALL-E 3.
    -   Customization options (styles, backgrounds, etc. - UI implemented).
    -   Asynchronous processing with status tracking.
-   **Image Upscaling**: Integration with Replicate Clarity Upscaler for high-resolution output.
-   **User Gallery**:
    -   View generated portraits (grid view implemented, list view pending).
    -   Filter, sort, download, share, favorite, tag, set as pet profile pic.
    -   Pagination with "Load More".
-   **Mock Payment System**: Simulate purchases using mock card details (designed for easy swap with real provider).
-   **Print-on-Demand**: Integration with Printify:
    -   Browse merchandise catalog.
    -   Select product variants (size, color).
    -   Checkout flow with shipping calculation.
    -   Order submission to Printify after mock payment.
    -   Order status tracking via webhooks and detail page.
-   **Backend**: Powered by Supabase (Auth, Postgres DB, Storage).
-   **Responsive Design**: Using TailwindCSS and shadcn/ui.
-   **Dark/Light Mode**: Theme support via `next-themes`.

## 📚 Documentation

The project includes comprehensive documentation for developers:

- [Component Documentation](docs/components/ui/loading.md) - Usage guides for UI components
- [Project Documentation Index](docs/index.md) - Main entry point for all documentation

For more details on the project structure and implementation, see the [Documentation](docs/) directory.

## 🛠️ Tech Stack

-   **Framework**: Next.js 14 (App Router)
-   **Language**: TypeScript
-   **Backend**: Supabase (Auth, Database, Storage)
-   **Styling**: Tailwind CSS
-   **Component Library**: shadcn/ui
-   **State Management**: Zustand (for cart), React Context/useState
-   **AI Services**:
    -   OpenAI API (DALL-E 3)
    -   Replicate API (Clarity Upscaler)
    -   Google Cloud Vision API (Pet Detection)
-   **Print-on-Demand**: Printify API
-   **Image Handling**: `react-dropzone`, `browser-image-compression`, `image-size`
-   **Date Formatting**: `date-fns`
-   **Unique IDs**: `uuid`
-   **Icons**: `lucide-react`

## 📋 Prerequisites

-   Node.js 18+ and npm
-   A Supabase account and project.
-   Credentials/API Keys for:
    -   OpenAI
    -   Replicate
    -   Printify (API Key & Shop ID)
    -   Google Cloud Platform (Vision API enabled, Service Account JSON key)

## 🔧 Installation & Setup

1.  **Clone & Install**:
    ```bash
    git clone https://github.com/yourusername/CanvaPet.git 
    cd CanvaPet
    npm install
    ```

2.  **Environment Variables**:
    Copy `.env.example` to `.env.local`:
    ```bash
    cp .env.example .env.local
    ```
    Update `.env.local` with your credentials:
    ```env
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-project-anon-key
    SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key # Needed for webhooks/admin actions
    
    # AI Services
    OPENAI_API_KEY=your-openai-api-key
    REPLICATE_API_KEY=your-replicate-api-key
    GOOGLE_APPLICATION_CREDENTIALS=your-gcp-service-account-key.json # Path to file
    
    # Printify
    PRINTIFY_API_KEY=your-printify-api-key
    PRINTIFY_SHOP_ID=your-printify-shop-id
    PRINTIFY_WEBHOOK_SECRET=your-printify-webhook-signing-secret
    ```
    *Place the Google Cloud JSON key file in the project root or update the path.* 

3.  **Supabase Setup**:
    -   Link your local project to your Supabase project:
        ```bash
        npx supabase login
        npx supabase link --project-ref <your-project-id>
        ```
    -   Apply database migrations:
        ```bash
        npx supabase db push
        ```
    -   Generate TypeScript types (run this after any migration changes):
        ```bash
        npx supabase gen types typescript --local > src/types/supabase.ts
        ```
    -   *Note: The old `/api/init-storage` endpoint is likely unnecessary if migrations handle bucket creation and policies correctly. Verify your Supabase project Storage settings and policies.* 

## 🚀 Usage

1.  **Start the development server:**
    ```bash
    npm run dev
    ```
2.  Open [http://localhost:3000](http://localhost:3000).

## 🧪 Running Tests

This project uses [Jest](https://jestjs.io/) for unit and integration testing and [Cypress](https://www.cypress.io/) for end-to-end testing.

**1. Unit & Integration Tests (Jest):**

-   **Run all tests:**
    ```bash
    npm test
    ```
-   **Run tests in watch mode:**
    ```bash
    npm test -- --watch
    ```
-   **Run tests with coverage report:**
    ```bash
    npm test -- --coverage
    ```
    (Coverage reports will be generated in the `coverage/` directory.)

**2. End-to-End Tests (Cypress):**

-   **Open Cypress Test Runner (Interactive Mode):**
    ```bash
    npx cypress open
    ```
    *This is recommended for writing and debugging tests.*

-   **Run Cypress Tests Headlessly (CI Mode):**
    ```bash
    npm run build
    npm start & # Start the production server in the background
    npx cypress run # Run tests against the local server
    # Remember to kill the server process afterwards
    ```
    *Ensure necessary `CYPRESS_*` environment variables (like test user credentials) are set if required by your tests.*

## 📁 Project Structure

The project follows a standard Next.js App Router structure:

```
.
├── public/                 # Static assets
├── src/
│   ├── app/                # Next.js App Router pages and API routes
│   │   ├── (auth)/         # Routes related to authentication (e.g., login, signup)
│   │   ├── (main)/         # Main application routes (e.g., dashboard, pet galleries)
│   │   │   ├── pets/       # Pet management pages (upload, view, edit)
│   │   │   └── profile/    # User profile page
│   │   ├── api/            # API Route Handlers
│   │   │   ├── pet-detection/ # Handles AI pet detection
│   │   │   └── init-storage/  # Initializes Supabase storage buckets & policies
│   │   └── layout.tsx      # Main app layout
│   │   └── page.tsx        # Homepage
│   ├── components/         # Reusable React components (UI, auth, forms, etc.)
│   │   ├── auth/           # Auth-specific components
│   │   ├── customization/  # Components for image customization
│   │   ├── pets/           # Pet-related components
│   │   ├── profile/        # Profile components
│   │   └── ui/             # shadcn/ui components and general UI elements
│   ├── contexts/           # React Context providers (e.g., ThemeProvider)
│   ├── lib/                # Utility functions, Supabase client, helper modules
│   │   ├── google.ts       # Google Cloud Vision API client logic
│   │   ├── supabase/       # Supabase client and server helpers
│   │   └── storageUtils.ts # Utilities for Supabase storage
│   └── types/              # TypeScript type definitions (database, custom types)
├── supabase/               # Supabase local development setup (migrations, etc.)
├── .env.local              # Local environment variables (Supabase keys, GCP creds)
├── next.config.mjs         # Next.js configuration
├── tailwind.config.js      # TailwindCSS configuration
└── tsconfig.json           # TypeScript configuration
```

## ✨ Key Functionalities Status

| Feature                       | Status         | Notes                                                                 |
|-------------------------------|----------------|-----------------------------------------------------------------------|
| User Authentication           | ✅ Complete    | Supabase Auth email/password.                                          |
| Pet Photo Upload/Mgmt       | ✅ Complete    | Upload, validation, compression, storage, basic pet profiles.         |
| AI Pet Detection              | ✅ Complete    | Google Vision API integrated.                                         |
| Portrait Customization UI     | ✅ Complete    | Interface for selecting styles, colors, etc. exists.                    |
| AI Portrait Generation        | ✅ Complete    | OpenAI DALL-E 3 integration, async processing.                        |
| Image Upscaling               | ✅ Complete    | Replicate Clarity Upscaler integration.                               |
| User Gallery                  | ✅ Complete    | Grid view, filters, sort, download, share, favorite, tag display/edit.| 
| Mock Payment System           | ✅ Complete    | Simulates checkout flow.                                              |
| Printify Integration (Core)   | ✅ Complete    | Catalog browsing, variant selection, shipping, order submission, webhooks. |
| ------                        | ---            | ---                                                                   |
| Gallery List View             | ⏳ Pending    | UI needs implementation.                                              |
| Merchandise Customization     | ⏳ Pending    | UI for placing portrait on merch needed.                              |
| Receipt Generation            | ⏳ Pending    | Not implemented.                                                      |
| Portrait Revision System (UI) | ⏳ Pending    | Backend exists, UI needed.                                            |
| Advanced Tagging Features     | ⏳ Pending    | Autocomplete, filter UI needed.                                       |
| Pet Profile Management (Full) | ⏳ Pending    | Dedicated UI for editing pet details.                                 |
| Custom Theming                | ⏳ Pending    | Apply specific brand colors from PRD.                                 |
| Enhanced Error Handling/UX    | ⏳ Pending    | Refinements based on PRD needed.                                      |
| Testing Strategy              | ⏳ Pending    | Unit/Integration/E2E tests need implementation.                       |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request after discussing the proposed changes.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the `LICENSE` file for details (if one exists, otherwise assume MIT or specify).