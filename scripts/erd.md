# Entity Relationship Diagram (ERD) - CanvaPet

This document outlines the conceptual and physical database schema for the CanvaPet application.

## Entities and Relationships

### 1. `users` (extends `auth.users` via `profiles` table)

Conceptually, this is the user entity. Physically, it leverages Supabase's `auth.users` table, extended by our `profiles` table.

**`profiles` Table**

-   **Description**: Stores public user profile information, extending `auth.users`.
-   **Columns**:
    -   `id` (UUID, PK): References `auth.users.id`. ON DELETE CASCADE.
    -   `updated_at` (TIMESTAMPTZ, Nullable): Timestamp of the last update.
    -   `username` (TEXT, Unique, Nullable): User's chosen unique username. Min length 3.
    -   `full_name` (TEXT, Nullable): User's full name.
    -   `avatar_url` (TEXT, Nullable): URL to the user's avatar image.
    -   `created_at` (TIMESTAMPTZ, Default: `NOW()`): Timestamp of creation.
-   **Relationships**:
    -   One-to-One with `auth.users` (via `id`).

### 2. `pets`

-   **Description**: Stores information about pets owned by users.
-   **Columns**:
    -   `id` (UUID, PK, Default: `uuid_generate_v4()`)
    -   `user_id` (UUID, FK): References `profiles.id` (or `auth.users.id`). ON DELETE CASCADE. NOT NULL.
    -   `name` (TEXT, NOT NULL): Pet's name.
    -   `species` (TEXT, NOT NULL): e.g., "Dog", "Cat", "Bird". (Consider an ENUM type or a separate `species` table if species have specific attributes).
    -   `breed` (TEXT, Nullable): Pet's breed.
    -   `age_years` (INTEGER, Nullable): Pet's age in years.
    -   `original_image_url` (TEXT, Nullable): URL to the primary uploaded image of the pet. (Consider linking to a `storage.objects` path if using Supabase storage directly for the main image).
    -   `additional_image_urls` (TEXT[], Nullable): Array of URLs for supplementary pet images.
    -   `created_at` (TIMESTAMPTZ, Default: `NOW()`)
    -   `updated_at` (TIMESTAMPTZ, Default: `NOW()`)
    -   `is_active` (BOOLEAN, Default: `TRUE`): Whether the pet profile is active.
-   **Relationships**:
    -   Many-to-One with `profiles` (`user_id` -> `profiles.id`). A user can have multiple pets.

### 3. `styles`

-   **Description**: Stores available art styles for portrait generation.
-   **Columns**:
    -   `id` (UUID, PK, Default: `uuid_generate_v4()`)
    -   `name` (TEXT, NOT NULL, Unique): Name of the style (e.g., "Van Gogh", "Watercolor", "Anime").
    -   `description` (TEXT, Nullable): Brief description of the style.
    -   `thumbnail_url` (TEXT, Nullable): URL to a thumbnail image representing the style.
    -   `prompt_template` (TEXT, Nullable): A template or keywords for the AI to generate this style.
    -   `is_active` (BOOLEAN, Default: `TRUE`)
    -   `created_at` (TIMESTAMPTZ, Default: `NOW()`)
    -   `updated_at` (TIMESTAMPTZ, Default: `NOW()`)

### 4. `customization_options`

-   **Description**: Stores various customization options that can be applied to portraits (e.g., backgrounds, accessories).
-   **Columns**:
    -   `id` (UUID, PK, Default: `uuid_generate_v4()`)
    -   `name` (TEXT, NOT NULL): Name of the option (e.g., "Space Background", "Crown Accessory").
    -   `type` (TEXT, NOT NULL): Type of option (e.g., "background", "accessory", "filter").
    -   `description` (TEXT, Nullable).
    -   `thumbnail_url` (TEXT, Nullable).
    -   `value` (JSONB, Nullable): Specific values or parameters for this option (e.g., color hex, position data for an accessory).
    -   `is_active` (BOOLEAN, Default: `TRUE`)
    -   `created_at` (TIMESTAMPTZ, Default: `NOW()`)
    -   `updated_at` (TIMESTAMPTZ, Default: `NOW()`)

### 5. `portraits`

-   **Description**: Stores information about generated AI pet portraits.
-   **Columns**:
    -   `id` (UUID, PK, Default: `uuid_generate_v4()`)
    -   `user_id` (UUID, FK): References `profiles.id`. ON DELETE CASCADE. NOT NULL.
    -   `pet_id` (UUID, FK): References `pets.id`. ON DELETE CASCADE. NOT NULL.
    -   `style_id` (UUID, FK, Nullable): References `styles.id`. ON DELETE SET NULL.
    -   `input_image_url` (TEXT, NOT NULL): URL of the original pet image used.
    -   `generated_image_url` (TEXT, Nullable): URL of the generated portrait (e.g., path in Supabase Storage).
    -   `thumbnail_url` (TEXT, Nullable): URL of the thumbnail for the generated portrait.
    -   `customization_params` (JSONB, Nullable): JSON object storing all selected customization parameters (e.g., chosen style, background, accessories, specific prompts).
    -   `status` (TEXT, NOT NULL, Default: 'pending'): e.g., "pending", "processing", "completed", "failed".
    -   `generation_time_seconds` (INTEGER, Nullable): Time taken to generate the portrait.
    -   `is_public` (BOOLEAN, Default: `FALSE`): If the user made this portrait public in their gallery.
    -   `created_at` (TIMESTAMPTZ, Default: `NOW()`)
    -   `updated_at` (TIMESTAMPTZ, Default: `NOW()`)
-   **Relationships**:
    -   Many-to-One with `profiles` (`user_id` -> `profiles.id`).
    -   Many-to-One with `pets` (`pet_id` -> `pets.id`).
    -   Many-to-One with `styles` (`style_id` -> `styles.id`).

### 6. `portrait_customization_options_applied` (Junction Table)

-   **Description**: Links `portraits` to `customization_options` (Many-to-Many).
-   **Columns**:
    -   `portrait_id` (UUID, PK, FK): References `portraits.id`. ON DELETE CASCADE.
    -   `customization_option_id` (UUID, PK, FK): References `customization_options.id`. ON DELETE CASCADE.
    -   `applied_at` (TIMESTAMPTZ, Default: `NOW()`)
-   **Relationships**:
    -   Many-to-Many between `portraits` and `customization_options`.

### 7. `merchandise`

-   **Description**: Stores types of physical merchandise available for purchase (e.g., mugs, t-shirts, canvases).
-   **Columns**:
    -   `id` (UUID, PK, Default: `uuid_generate_v4()`)
    -   `name` (TEXT, NOT NULL, Unique): Name of the merchandise item (e.g., "11oz Mug", "Large Canvas Print").
    -   `description` (TEXT, Nullable).
    -   `base_price` (NUMERIC(10, 2), NOT NULL): Base price of the item before any customization.
    -   `sku` (TEXT, Unique, Nullable): Stock Keeping Unit.
    -   `dimensions` (TEXT, Nullable): e.g., "12x16 inches".
    -   `provider_id` (TEXT, Nullable): ID from the print-on-demand provider (e.g., Printify).
    -   `is_active` (BOOLEAN, Default: `TRUE`)
    -   `created_at` (TIMESTAMPTZ, Default: `NOW()`)
    -   `updated_at` (TIMESTAMPTZ, Default: `NOW()`)

### 8. `orders`

-   **Description**: Stores information about user orders.
-   **Columns**:
    -   `id` (UUID, PK, Default: `uuid_generate_v4()`)
    -   `user_id` (UUID, FK): References `profiles.id`. ON DELETE SET NULL (if user account is deleted, order might still be relevant).
    -   `status` (TEXT, NOT NULL, Default: 'pending'): e.g., "pending_payment", "paid", "processing", "shipped", "delivered", "cancelled", "refunded".
    -   `total_amount` (NUMERIC(10, 2), NOT NULL): Total amount for the order.
    -   `currency` (TEXT, NOT NULL, Default: 'USD').
    -   `payment_gateway` (TEXT, Nullable): e.g., "stripe".
    -   `payment_intent_id` (TEXT, Nullable, Unique): ID from the payment gateway.
    -   `shipping_address` (JSONB, Nullable): Shipping address details.
    -   `billing_address` (JSONB, Nullable): Billing address details.
    -   `tracking_number` (TEXT, Nullable).
    -   `notes` (TEXT, Nullable): Any notes related to the order.
    -   `created_at` (TIMESTAMPTZ, Default: `NOW()`)
    -   `updated_at` (TIMESTAMPTZ, Default: `NOW()`)
-   **Relationships**:
    -   Many-to-One with `profiles` (`user_id` -> `profiles.id`).

### 9. `order_items`

-   **Description**: Details of items within an order.
-   **Columns**:
    -   `id` (UUID, PK, Default: `uuid_generate_v4()`)
    -   `order_id` (UUID, FK): References `orders.id`. ON DELETE CASCADE. NOT NULL.
    -   `portrait_id` (UUID, FK, Nullable): References `portraits.id`. ON DELETE SET NULL (if the item is a portrait product).
    -   `merchandise_id` (UUID, FK, Nullable): References `merchandise.id`. ON DELETE SET NULL (if the item is standard merchandise).
    -   `quantity` (INTEGER, NOT NULL, Default: 1).
    -   `unit_price` (NUMERIC(10, 2), NOT NULL): Price of a single unit of this item at the time of order.
    -   `customization_details` (JSONB, Nullable): If it's a customized item (e.g., portrait on a mug), stores details of that customization.
    -   `created_at` (TIMESTAMPTZ, Default: `NOW()`)
-   **Relationships**:
    -   Many-to-One with `orders` (`order_id` -> `orders.id`).
    -   Many-to-One with `portraits` (`portrait_id` -> `portraits.id`).
    -   Many-to-One with `merchandise` (`merchandise_id` -> `merchandise.id`).

### 10. `user_sessions`

-   **Description**: Supabase Auth handles sessions by default using JWTs. A custom `user_sessions` table is generally not needed unless specific session-related data beyond what Supabase provides needs to be tracked (e.g., device type, IP address for audit, active status for custom dashboards). For now, we will rely on Supabase's built-in session management.
    -   *Assumption*: Supabase's default session handling is sufficient. If custom session tracking is needed later, this table can be designed.

### 11. `feedback`

-   **Description**: Stores user-submitted feedback.
-   **Columns**:
    -   `id` (UUID, PK, Default: `uuid_generate_v4()`)
    -   `user_id` (UUID, FK, Nullable): References `profiles.id`. ON DELETE SET NULL (feedback can be anonymous or from a user).
    -   `email` (TEXT, Nullable): User's email if not logged in or provided separately.
    -   `rating` (INTEGER, Nullable): e.g., 1-5 stars.
    -   `comment` (TEXT, NOT NULL): The feedback content.
    -   `page_url` (TEXT, Nullable): URL of the page where feedback was submitted.
    -   `status` (TEXT, NOT NULL, Default: 'submitted'): e.g., "submitted", "reviewed", "archived".
    -   `created_at` (TIMESTAMPTZ, Default: `NOW()`)
-   **Relationships**:
    -   Many-to-One with `profiles` (`user_id` -> `profiles.id`).

## Data Types Legend

-   **UUID**: Universally Unique Identifier.
-   **TEXT**: Variable-length string.
-   **TIMESTAMPTZ**: Timestamp with time zone.
-   **INTEGER**: Whole number.
-   **BOOLEAN**: True/False.
-   **JSONB**: JSON binary format (efficient for querying).
-   **NUMERIC(p, s)**: Exact number with precision `p` and scale `s`.
-   **TEXT[]**: Array of TEXT.

## Assumptions

1.  **Supabase Auth**: Leveraged for user authentication and management.
2.  **Supabase Storage**: Used for storing images (pet originals, generated portraits, thumbnails).
3.  **Species Data**: Initially storing `species` as TEXT in `pets`. If species require more attributes or structured management, a separate `species` table might be created later.
4.  **Customization Granularity**: `customization_params` in `portraits` is a JSONB field for flexibility. The `portrait_customization_options_applied` junction table provides a more structured way to link to predefined options if needed for searching/filtering based on applied options.
5.  **Session Management**: Relying on Supabase built-in session handling primarily.

This ERD provides a foundation. It will likely evolve as specific features are implemented. 