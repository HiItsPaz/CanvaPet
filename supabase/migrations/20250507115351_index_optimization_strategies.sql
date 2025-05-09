/*
 * Index Optimization Strategies for CanvaPet Database
 * -----------------------------------------------
 * This migration file documents the indexing strategy for the CanvaPet application database.
 * It provides a detailed analysis of query patterns and rationale behind each index.
 */

-- Note: Most indexes are created in the initial schema migration file.
-- This file serves as documentation and optimization strategy analysis.

/*
 * QUERY PATTERNS ANALYSIS
 * ======================
 * 
 * This section analyzes the expected query patterns for each table and
 * identifies the indexes needed for optimal performance.
 */

/*
 * PROFILES TABLE
 * --------------
 * Common query patterns:
 * 1. Lookup by ID (primary key, already indexed)
 * 2. Lookup by username (for profile pages, unique usernames)
 * 3. Joins with other tables via ID
 * 
 * Indexes:
 * - idx_profiles_id: Profile lookup by ID for frequent joins
 * - idx_profiles_username: Username lookup for profile pages and checks
 */
COMMENT ON INDEX idx_profiles_id IS 'Optimizes joins with other tables and direct user lookups';
COMMENT ON INDEX idx_profiles_username IS 'Accelerates username searches and uniqueness checks';

/*
 * PETS TABLE
 * ----------
 * Common query patterns:
 * 1. Lookup by user_id (for displaying a user's pets)
 * 2. Lookup by species (for filtering pets by type)
 * 3. Lookup by ID (primary key, already indexed)
 * 
 * Indexes:
 * - idx_pets_user_id: Filter pets by owner
 * - idx_pets_species: Filter pets by species
 */
COMMENT ON INDEX idx_pets_user_id IS 'Accelerates queries for displaying a user''s pets, very frequent operation';
COMMENT ON INDEX idx_pets_species IS 'Supports filtering pets by species, commonly used in search and filtering';

/*
 * PORTRAITS TABLE
 * --------------
 * Common query patterns:
 * 1. Lookup by user_id (for displaying a user's portraits)
 * 2. Lookup by pet_id (for displaying a pet's portraits)
 * 3. Lookup by style_id (for finding portraits with a specific style)
 * 4. Lookup by status (for processing/monitoring)
 * 5. Lookup by is_public (for public galleries)
 * 
 * Indexes:
 * - idx_portraits_user_id: Filter portraits by owner
 * - idx_portraits_pet_id: Filter portraits by pet
 * - idx_portraits_style_id: Filter portraits by style
 * - idx_portraits_status: Filter portraits by processing status
 */
COMMENT ON INDEX idx_portraits_user_id IS 'Accelerates queries for user galleries and dashboards';
COMMENT ON INDEX idx_portraits_pet_id IS 'Supports filtering portraits by specific pet';
COMMENT ON INDEX idx_portraits_style_id IS 'Enables quick filtering by art style';
COMMENT ON INDEX idx_portraits_status IS 'Critical for monitoring and processing portrait generation queue';

/* 
 * Additional index for public galleries:
 * Create partial index for public portraits to optimize the public gallery
 */
CREATE INDEX IF NOT EXISTS idx_portraits_public 
ON public.portraits (created_at DESC) 
WHERE is_public = TRUE;

COMMENT ON INDEX idx_portraits_public IS 'Optimizes queries for public gallery display, ordered by creation date';

/*
 * ORDERS TABLE
 * -----------
 * Common query patterns:
 * 1. Lookup by user_id (for displaying a user's orders)
 * 2. Lookup by status (for processing/monitoring)
 * 3. Lookup by created_at (for recent orders)
 * 
 * Indexes:
 * - idx_orders_user_id: Filter orders by owner
 * - idx_orders_status: Filter orders by status
 */
COMMENT ON INDEX idx_orders_user_id IS 'Enables quick access to a user''s order history';
COMMENT ON INDEX idx_orders_status IS 'Supports order fulfillment workflows and status filtering';

/* 
 * Additional index for recent orders:
 * Create index on creation date for sorting and recency filtering
 */
CREATE INDEX IF NOT EXISTS idx_orders_created_at
ON public.orders (created_at DESC);

COMMENT ON INDEX idx_orders_created_at IS 'Optimizes queries that sort orders by creation date, common in dashboards';

/*
 * ORDER_ITEMS TABLE
 * ----------------
 * Common query patterns:
 * 1. Lookup by order_id (for displaying items in an order)
 * 2. Lookup by portrait_id (for finding orders containing a specific portrait)
 * 3. Lookup by merchandise_id (for popularity analysis)
 * 
 * Indexes:
 * - idx_order_items_order_id: Filter items by order
 */
COMMENT ON INDEX idx_order_items_order_id IS 'Accelerates retrieval of items within a specific order';

/* 
 * Additional indexes for order items analysis:
 */
CREATE INDEX IF NOT EXISTS idx_order_items_portrait_id
ON public.order_items (portrait_id)
WHERE portrait_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_order_items_merchandise_id
ON public.order_items (merchandise_id)
WHERE merchandise_id IS NOT NULL;

COMMENT ON INDEX idx_order_items_portrait_id IS 'Supports queries tracking which portraits have been ordered';
COMMENT ON INDEX idx_order_items_merchandise_id IS 'Enables merchandise popularity analysis';

/*
 * STYLES TABLE
 * -----------
 * Common query patterns:
 * 1. Lookup by name (for style selection)
 * 2. Lookup by is_active (for available styles)
 * 
 * Create an index for name lookups, though this table is small and might not need many indexes
 */
CREATE INDEX IF NOT EXISTS idx_styles_name
ON public.styles (name);

COMMENT ON INDEX idx_styles_name IS 'Supports style lookups by name, though with a small table the performance impact is minimal';

/*
 * MERCHANDISE TABLE
 * ----------------
 * Common query patterns:
 * 1. Lookup by name (for merchandise selection)
 * 2. Lookup by is_active (for available merchandise)
 * 3. Lookup by base_price (for price filtering)
 * 
 * Create indexes for price range searches
 */
CREATE INDEX IF NOT EXISTS idx_merchandise_base_price
ON public.merchandise (base_price);

COMMENT ON INDEX idx_merchandise_base_price IS 'Supports price-based filtering and sorting of merchandise';

/*
 * CUSTOMIZATION_OPTIONS TABLE
 * --------------------------
 * Common query patterns:
 * 1. Lookup by type (for filtering options by type)
 * 2. Lookup by is_active (for available options)
 */
CREATE INDEX IF NOT EXISTS idx_customization_options_type
ON public.customization_options (type);

COMMENT ON INDEX idx_customization_options_type IS 'Enables filtering customization options by their type (background, accessory, etc.)';

/*
 * FEEDBACK TABLE
 * -------------
 * Common query patterns:
 * 1. Lookup by user_id (for user feedback history)
 * 2. Lookup by status (for feedback management)
 * 3. Lookup by rating (for analytics)
 */
CREATE INDEX IF NOT EXISTS idx_feedback_user_id
ON public.feedback (user_id)
WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_feedback_status
ON public.feedback (status);

CREATE INDEX IF NOT EXISTS idx_feedback_rating
ON public.feedback (rating)
WHERE rating IS NOT NULL;

COMMENT ON INDEX idx_feedback_user_id IS 'Supports queries for a user''s feedback history';
COMMENT ON INDEX idx_feedback_status IS 'Enables filtering feedback by status for review workflows';
COMMENT ON INDEX idx_feedback_rating IS 'Supports analytics queries based on user ratings';

/*
 * COMPOSITE INDEXES FOR COMMON COMPLEX QUERIES
 * ------------------------------------------
 * These indexes optimize specific complex query patterns that involve
 * multiple conditions or sorting requirements.
 */

-- Composite index for searching pets by user and species
CREATE INDEX IF NOT EXISTS idx_pets_user_species
ON public.pets (user_id, species);

COMMENT ON INDEX idx_pets_user_species IS 'Optimizes queries that filter a user''s pets by species';

-- Composite index for portraits by user and status (for monitoring portrait generation)
CREATE INDEX IF NOT EXISTS idx_portraits_user_status
ON public.portraits (user_id, status);

COMMENT ON INDEX idx_portraits_user_status IS 'Accelerates queries showing a user''s portraits filtered by status';

-- Composite index for orders by user and status (for order tracking)
CREATE INDEX IF NOT EXISTS idx_orders_user_status
ON public.orders (user_id, status);

COMMENT ON INDEX idx_orders_user_status IS 'Optimizes queries filtering a user''s orders by status';

/*
 * SPECIAL CONSIDERATIONS
 * ---------------------
 */

-- For JSONB fields, consider adding GIN indexes if complex query patterns emerge
-- CREATE INDEX IF NOT EXISTS idx_orders_shipping_address
-- ON public.orders USING GIN (shipping_address);

-- For text search in portrait customization parameters
-- CREATE INDEX IF NOT EXISTS idx_portraits_customization_params
-- ON public.portraits USING GIN (customization_params);

/*
 * PERFORMANCE MONITORING STRATEGY
 * ------------------------------
 * 
 * To ensure these indexes are effective:
 * 
 * 1. Monitor query performance using EXPLAIN ANALYZE
 * 2. Regularly review unused indexes with:
 *    SELECT * FROM pg_stat_user_indexes
 *    WHERE idx_scan = 0 AND idx_is_unique IS false;
 * 3. Consider dropping unused indexes after confirming they're unnecessary
 * 4. Monitor index size with:
 *    SELECT pg_size_pretty(pg_relation_size('index_name')) as index_size;
 * 5. Reindex periodically for optimal performance:
 *    REINDEX INDEX index_name;
 */
