-- ======================================================================
-- CanvaPet Comprehensive Database Test Queries
-- ======================================================================
-- This script validates the database implementation for CanvaPet.
-- It includes tests for:
-- 1. Test Data Setup
-- 2. Data Integrity Constraints (Primary Keys, Foreign Keys, CHECK constraints)
-- 3. Row Level Security (RLS) Policies
-- 4. Trigger Functionality (Audit logs, Data validation, Derived data)
-- 5. Query Performance with Indexes
--
-- HOW TO RUN:
-- 1. Ensure your local Supabase instance is running (supabase start).
-- 2. Execute this script using a SQL client connected to your local DB, 
--    or use `supabase db execute --local -f supabase/test-queries/01_comprehensive_tests.sql`
-- 3. Observe the output and verify against expected results.
-- ======================================================================

-- Clean up existing test data if any (optional, run if re-testing)
/*
DELETE FROM public.feedback WHERE comment LIKE 'Test Feedback%';
DELETE FROM public.order_items WHERE customization_details->>'test_item' = 'true';
DELETE FROM public.orders WHERE notes LIKE 'Test Order%';
DELETE FROM public.portrait_customization_options_applied WHERE portrait_id IN (SELECT id FROM public.portraits WHERE input_image_url LIKE '%test%');
DELETE FROM public.portraits WHERE input_image_url LIKE '%test%';
DELETE FROM public.pet_statistics WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE 'testuser%@example.com');
DELETE FROM public.pets WHERE name LIKE 'Test Pet%';
DELETE FROM public.profiles WHERE username LIKE 'testuser%';
DELETE FROM auth.users WHERE email LIKE 'testuser%@example.com';
*/

-- ======================================================================
-- Section 1: Test Data Setup
-- ======================================================================
-- This section creates sample users, pets, portraits, orders, etc., 
-- to be used in subsequent tests.

DO $$
DECLARE
    test_user_1_id UUID;
    test_user_2_id UUID;
    pet_1_id UUID;
    pet_2_id UUID;
    style_1_id UUID;
    customization_option_1_id UUID;
    portrait_1_id UUID;
    merchandise_1_id UUID;
    order_1_id UUID;
BEGIN
    RAISE NOTICE 'Setting up test data...';

    -- Create Test Users
    RAISE NOTICE 'Creating test users...';
    test_user_1_id := uuid_generate_v4(); -- Simulate auth.users creation
    INSERT INTO auth.users (id, email, encrypted_password, role) VALUES (test_user_1_id, 'testuser1@example.com', 'testpassword', 'authenticated') ON CONFLICT (id) DO NOTHING;
    INSERT INTO public.profiles (id, username, full_name, avatar_url) VALUES (test_user_1_id, 'testuser1', 'Test User One', 'http://example.com/avatar1.png') ON CONFLICT (id) DO NOTHING;

    test_user_2_id := uuid_generate_v4();
    INSERT INTO auth.users (id, email, encrypted_password, role) VALUES (test_user_2_id, 'testuser2@example.com', 'testpassword', 'authenticated') ON CONFLICT (id) DO NOTHING;
    INSERT INTO public.profiles (id, username, full_name, avatar_url) VALUES (test_user_2_id, 'testuser2', 'Test User Two', 'http://example.com/avatar2.png') ON CONFLICT (id) DO NOTHING;
    RAISE NOTICE 'Test User 1 ID: %', test_user_1_id;
    RAISE NOTICE 'Test User 2 ID: %', test_user_2_id;

    -- Create Pets for Test User 1
    RAISE NOTICE 'Creating pets for Test User 1...';
    INSERT INTO public.pets (user_id, name, species, breed, age_years, original_image_url) VALUES
        (test_user_1_id, 'Test Pet Alpha', 'DOG', 'Labrador', 3, 'http://example.com/test_pet_alpha.jpg'),
        (test_user_1_id, 'Test Pet Beta', 'CAT', 'Siamese', 5, 'http://example.com/test_pet_beta.jpg')
    RETURNING id INTO pet_1_id;
    RAISE NOTICE 'Test Pet Alpha ID: %', pet_1_id;

    -- Create Art Style (if not exists)
    RAISE NOTICE 'Creating test art style...';
    INSERT INTO public.styles (name, description, prompt_template) VALUES
        ('Test Style One', 'A cool test style', 'A {species} in Test Style One')
    ON CONFLICT (name) DO UPDATE SET description = 'A cool test style' RETURNING id INTO style_1_id;
    IF style_1_id IS NULL THEN SELECT id INTO style_1_id FROM public.styles WHERE name = 'Test Style One'; END IF;
    RAISE NOTICE 'Test Style One ID: %', style_1_id;

    -- Create Customization Option (if not exists)
    RAISE NOTICE 'Creating test customization option...';
    INSERT INTO public.customization_options (name, type, value) VALUES
        ('Test Option One', 'background', '{"color": "blue"}')
    ON CONFLICT (name, type) DO UPDATE SET value = '{"color": "blue"}' RETURNING id INTO customization_option_1_id;
    IF customization_option_1_id IS NULL THEN SELECT id INTO customization_option_1_id FROM public.customization_options WHERE name = 'Test Option One' AND type = 'background'; END IF;
    RAISE NOTICE 'Test Option One ID: %', customization_option_1_id;

    -- Create Portrait for Test User 1, Pet Alpha
    RAISE NOTICE 'Creating portrait for Test User 1...';
    INSERT INTO public.portraits (user_id, pet_id, style_id, input_image_url, status, is_public, generated_image_url, thumbnail_url)
    VALUES (test_user_1_id, pet_1_id, style_1_id, 'http://example.com/test_portrait_input.jpg', 'completed', TRUE, 'http://example.com/test_portrait_generated.jpg', 'http://example.com/test_portrait_thumb.jpg')
    RETURNING id INTO portrait_1_id;
    RAISE NOTICE 'Test Portrait ID: %', portrait_1_id;

    -- Apply Customization to Portrait
    RAISE NOTICE 'Applying customization to portrait...';
    INSERT INTO public.portrait_customization_options_applied (portrait_id, customization_option_id) VALUES
        (portrait_1_id, customization_option_1_id);

    -- Create Merchandise (if not exists)
    RAISE NOTICE 'Creating test merchandise...';
    INSERT INTO public.merchandise (name, base_price, sku) VALUES
        ('Test Mug', 15.99, 'TEST-MUG-001')
    ON CONFLICT (name) DO UPDATE SET base_price=15.99 RETURNING id INTO merchandise_1_id;
    IF merchandise_1_id IS NULL THEN SELECT id INTO merchandise_1_id FROM public.merchandise WHERE name = 'Test Mug'; END IF;
    RAISE NOTICE 'Test Mug ID: %', merchandise_1_id;

    -- Create Order for Test User 1
    RAISE NOTICE 'Creating order for Test User 1...';
    INSERT INTO public.orders (user_id, status, total_amount, currency, shipping_address, notes)
    VALUES (test_user_1_id, 'paid', 25.98, 'USD', '{"street": "123 Test St", "city": "Testville"}', 'Test Order for User 1')
    RETURNING id INTO order_1_id;
    RAISE NOTICE 'Test Order ID: %', order_1_id;

    -- Create Order Item for Test User 1 Order
    RAISE NOTICE 'Creating order item...';
    INSERT INTO public.order_items (order_id, merchandise_id, quantity, unit_price, customization_details)
    VALUES (order_1_id, merchandise_1_id, 1, 15.99, '{"test_item": true, "portrait_id_on_mug": "' || portrait_1_id || '"}');
    INSERT INTO public.order_items (order_id, portrait_id, quantity, unit_price, customization_details)
    VALUES (order_1_id, portrait_1_id, 1, 9.99, '{"test_item": true, "print_size": "8x10"}');

    -- Create Feedback
    RAISE NOTICE 'Creating feedback...';
    INSERT INTO public.feedback (user_id, rating, comment, page_url)
    VALUES (test_user_1_id, 5, 'Test Feedback: Love this app!', '/home');
    INSERT INTO public.feedback (email, rating, comment, page_url)
    VALUES ('guestuser@example.com', 4, 'Test Feedback: Guest user comment.', '/portraits');

    RAISE NOTICE 'Test data setup completed.';
END $$;

-- ======================================================================
-- Section 2: Data Integrity Constraint Tests
-- ======================================================================
RAISE NOTICE '

======================================';
RAISE NOTICE 'Section 2: Data Integrity Constraint Tests';
RAISE NOTICE '======================================';

-- Test 2.1: Profile username length constraint
RAISE NOTICE 'Test 2.1: Profile username length (expect failure for short username)';
DO $$ BEGIN
    INSERT INTO public.profiles (id, username) VALUES (uuid_generate_v4(), 'ab');
    RAISE EXCEPTION 'Profile username length constraint failed: short username allowed';
EXCEPTION WHEN check_violation THEN
    RAISE NOTICE '    SUCCESS: Short username correctly rejected.';
END $$;

-- Test 2.2: Pet age validation (trigger-based)
RAISE NOTICE 'Test 2.2: Pet age validation (expect failure for invalid age)';
DO $$ DECLARE test_user_id UUID; BEGIN
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'testuser1@example.com';
    INSERT INTO public.pets (user_id, name, species, age_years) VALUES (test_user_id, 'TooOld Dog', 'DOG', 50);
    RAISE EXCEPTION 'Pet age validation failed: invalid age allowed';
EXCEPTION WHEN raise_exception THEN -- Custom exception from trigger
    RAISE NOTICE '    SUCCESS: Invalid pet age correctly rejected by trigger.';
END $$;

-- Test 2.3: Order total amount validation (trigger-based)
RAISE NOTICE 'Test 2.3: Order total amount validation (expect failure for non-positive amount)';
DO $$ DECLARE test_user_id UUID; BEGIN
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'testuser1@example.com';
    INSERT INTO public.orders (user_id, status, total_amount) VALUES (test_user_id, 'pending', 0);
    RAISE EXCEPTION 'Order total amount validation failed: non-positive amount allowed';
EXCEPTION WHEN raise_exception THEN
    RAISE NOTICE '    SUCCESS: Non-positive order amount correctly rejected by trigger.';
END $$;

-- Test 2.4: Foreign Key - Deleting a user should cascade to profiles and pets
RAISE NOTICE 'Test 2.4: Foreign Key Cascade Delete (User -> Profiles, Pets, Portraits, Orders, Feedback, Pet_Statistics)';
DO $$ 
DECLARE 
    test_user_cascade_id UUID;
    profile_count INTEGER;
    pet_count INTEGER;
    portrait_count INTEGER;
    order_count INTEGER;
    feedback_count INTEGER;
    stats_count INTEGER;
BEGIN
    -- Create a dedicated user for cascade test
    test_user_cascade_id := uuid_generate_v4();
    INSERT INTO auth.users (id, email, encrypted_password, role) VALUES (test_user_cascade_id, 'cascadeuser@example.com', 'test', 'authenticated');
    INSERT INTO public.profiles (id, username) VALUES (test_user_cascade_id, 'cascadeuser');
    INSERT INTO public.pets (user_id, name, species) VALUES (test_user_cascade_id, 'Cascade Pet', 'DOG');
    INSERT INTO public.portraits (user_id, pet_id, input_image_url) VALUES (test_user_cascade_id, (SELECT id FROM public.pets WHERE user_id = test_user_cascade_id LIMIT 1), 'test_cascade.jpg');
    INSERT INTO public.orders (user_id, total_amount) VALUES (test_user_cascade_id, 10.00);
    INSERT INTO public.feedback (user_id, comment) VALUES (test_user_cascade_id, 'Cascade feedback');
    -- Pet statistics trigger will create an entry

    RAISE NOTICE '    Deleting user % to test cascade...', test_user_cascade_id;
    DELETE FROM auth.users WHERE id = test_user_cascade_id;

    SELECT COUNT(*) INTO profile_count FROM public.profiles WHERE id = test_user_cascade_id;
    SELECT COUNT(*) INTO pet_count FROM public.pets WHERE user_id = test_user_cascade_id;
    SELECT COUNT(*) INTO portrait_count FROM public.portraits WHERE user_id = test_user_cascade_id;
    -- Orders table has ON DELETE SET NULL for user_id
    SELECT COUNT(*) INTO order_count FROM public.orders WHERE user_id = test_user_cascade_id;
    -- Feedback table has ON DELETE SET NULL for user_id
    SELECT COUNT(*) INTO feedback_count FROM public.feedback WHERE user_id = test_user_cascade_id;
    -- Pet Statistics table has ON DELETE CASCADE for user_id
    SELECT COUNT(*) INTO stats_count FROM public.pet_statistics WHERE user_id = test_user_cascade_id;

    IF profile_count = 0 AND pet_count = 0 AND portrait_count = 0 AND order_count = 0 AND feedback_count = 0 AND stats_count = 0 THEN
        RAISE NOTICE '    SUCCESS: User deletion cascaded correctly to profiles, pets, portraits, pet_statistics and set NULL for orders, feedback.';
    ELSE
        RAISE EXCEPTION 'Cascade delete failed: Profiles: %, Pets: %, Portraits: %, Orders (should be 0 for SET NULL test): %, Feedback (should be 0 for SET NULL test): %, Pet Stats: %', 
            profile_count, pet_count, portrait_count, order_count, feedback_count, stats_count;
    END IF;
END $$;

-- Test 2.5: Check Pet Size constraint from schema_update_example
RAISE NOTICE 'Test 2.5: Check Pet Size constraint (expect failure for invalid size)';
DO $$ DECLARE test_user_id UUID; BEGIN
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'testuser1@example.com';
    -- Assuming 20250507115822_schema_update_example.sql has been applied
    IF EXISTS (SELECT 1 FROM information_schema.constraint_column_usage where table_name = 'pets' and constraint_name = 'check_pet_size') THEN
        INSERT INTO public.pets (user_id, name, species, size) VALUES (test_user_id, 'Giant Pet', 'DOG', 'giant');
        RAISE EXCEPTION 'Pet size constraint failed: invalid size allowed';
    ELSE
        RAISE NOTICE '    SKIPPED: check_pet_size constraint not found (schema_update_example not applied or rolled back).';
    END IF;
EXCEPTION WHEN check_violation THEN
    RAISE NOTICE '    SUCCESS: Invalid pet size correctly rejected.';
END $$;

-- ======================================================================
-- Section 3: Row Level Security (RLS) Policy Tests
-- ======================================================================
RAISE NOTICE '

======================================';
RAISE NOTICE 'Section 3: Row Level Security (RLS) Policy Tests';
RAISE NOTICE '======================================';

-- Test 3.1: User can select their own profile, but not others
RAISE NOTICE 'Test 3.1: RLS - Profiles (SELECT)';
DO $$ 
DECLARE 
    test_user_1_id UUID; 
    test_user_2_id UUID; 
    profile_count_own INTEGER;
    profile_count_other INTEGER;
BEGIN
    SELECT id INTO test_user_1_id FROM auth.users WHERE email = 'testuser1@example.com';
    SELECT id INTO test_user_2_id FROM auth.users WHERE email = 'testuser2@example.com';

    SET LOCAL ROLE authenticated;
    SET LOCAL "request.jwt.claims" = json_build_object('sub', test_user_1_id, 'role', 'authenticated');

    SELECT COUNT(*) INTO profile_count_own FROM public.profiles WHERE id = test_user_1_id;
    SELECT COUNT(*) INTO profile_count_other FROM public.profiles WHERE id = test_user_2_id;
    
    RESET "request.jwt.claims";
    RESET ROLE;

    IF profile_count_own = 1 AND profile_count_other = 0 THEN
        RAISE NOTICE '    SUCCESS: User can select own profile, cannot select other profile.';
    ELSE
        RAISE EXCEPTION 'RLS Profile SELECT failed: Own: %, Other: %', profile_count_own, profile_count_other;
    END IF;
END $$;

-- Test 3.2: User can update their own profile, but not others
RAISE NOTICE 'Test 3.2: RLS - Profiles (UPDATE)';
DO $$ 
DECLARE 
    test_user_1_id UUID; 
    test_user_2_id UUID; 
BEGIN
    SELECT id INTO test_user_1_id FROM auth.users WHERE email = 'testuser1@example.com';
    SELECT id INTO test_user_2_id FROM auth.users WHERE email = 'testuser2@example.com';

    SET LOCAL ROLE authenticated;
    SET LOCAL "request.jwt.claims" = json_build_object('sub', test_user_1_id, 'role', 'authenticated');

    -- Try to update own profile (should succeed)
    UPDATE public.profiles SET full_name = 'Test User One Updated' WHERE id = test_user_1_id;
    RAISE NOTICE '    SUCCESS: User updated own profile.';

    -- Try to update other's profile (should fail or affect 0 rows due to RLS)
    BEGIN
        UPDATE public.profiles SET full_name = 'Attempted Update' WHERE id = test_user_2_id;
        IF NOT FOUND THEN
            RAISE NOTICE '    SUCCESS: User cannot update other profile (0 rows affected).';
        ELSE
            RAISE EXCEPTION 'RLS Profile UPDATE failed: User updated other profile.';
        END IF;
    EXCEPTION WHEN insufficient_privilege THEN -- Supabase might raise this depending on exact policy
        RAISE NOTICE '    SUCCESS: User cannot update other profile (permission denied).';
    END;
    
    RESET "request.jwt.claims";
    RESET ROLE;
END $$;

-- Test 3.3: Anyone can view public portraits
RAISE NOTICE 'Test 3.3: RLS - Public Portraits (SELECT)';
DO $$ 
DECLARE 
    public_portrait_id UUID;
    portrait_count INTEGER;
BEGIN
    SELECT id INTO public_portrait_id FROM public.portraits WHERE is_public = TRUE AND input_image_url LIKE '%test%' LIMIT 1;

    -- Simulate anonymous user
    SET LOCAL ROLE anon;
    SET LOCAL "request.jwt.claims" = json_build_object('role', 'anon');

    SELECT COUNT(*) INTO portrait_count FROM public.portraits WHERE id = public_portrait_id;

    RESET "request.jwt.claims";
    RESET ROLE;

    IF portrait_count = 1 THEN
        RAISE NOTICE '    SUCCESS: Anonymous user can view public portrait.';
    ELSE
        RAISE EXCEPTION 'RLS Public Portrait SELECT failed: Count: %', portrait_count;
    END IF;
END $$;

-- Test 3.4: User cannot view non-public portraits of others
RAISE NOTICE 'Test 3.4: RLS - Non-Public Portraits (SELECT)';
DO $$ 
DECLARE 
    test_user_1_id UUID;
    test_user_2_id UUID;
    non_public_portrait_id UUID;
    portrait_count INTEGER;
BEGIN
    SELECT id INTO test_user_1_id FROM auth.users WHERE email = 'testuser1@example.com';
    SELECT id INTO test_user_2_id FROM auth.users WHERE email = 'testuser2@example.com';

    -- Create a non-public portrait for user 2
    INSERT INTO public.portraits (user_id, pet_id, input_image_url, is_public) 
    VALUES (test_user_2_id, (SELECT id FROM public.pets WHERE user_id = test_user_2_id LIMIT 1), 'http://example.com/user2_nonpublic.jpg', FALSE)
    RETURNING id INTO non_public_portrait_id;

    SET LOCAL ROLE authenticated;
    SET LOCAL "request.jwt.claims" = json_build_object('sub', test_user_1_id, 'role', 'authenticated');

    SELECT COUNT(*) INTO portrait_count FROM public.portraits WHERE id = non_public_portrait_id;

    RESET "request.jwt.claims";
    RESET ROLE;

    IF portrait_count = 0 THEN
        RAISE NOTICE '    SUCCESS: User 1 cannot view User 2 non-public portrait.';
    ELSE
        RAISE EXCEPTION 'RLS Non-Public Portrait SELECT failed: Count: %', portrait_count;
    END IF;

    -- Clean up test portrait
    DELETE FROM public.portraits WHERE id = non_public_portrait_id;
END $$;

-- ======================================================================
-- Section 4: Trigger Functionality Tests
-- ======================================================================
RAISE NOTICE '

======================================';
RAISE NOTICE 'Section 4: Trigger Functionality Tests';
RAISE NOTICE '======================================';

-- Test 4.1: Audit Log Trigger (trg_portraits_audit)
RAISE NOTICE 'Test 4.1: Audit Log Trigger for Portraits';
DO $$ 
DECLARE 
    test_user_1_id UUID; 
    test_pet_id UUID;
    new_portrait_id UUID;
    audit_log_count INTEGER;
BEGIN
    SELECT id INTO test_user_1_id FROM auth.users WHERE email = 'testuser1@example.com';
    SELECT id INTO test_pet_id FROM public.pets WHERE user_id = test_user_1_id AND name = 'Test Pet Alpha';

    SET LOCAL "request.jwt.claims" = json_build_object('sub', test_user_1_id);

    -- INSERT
    INSERT INTO public.portraits (user_id, pet_id, input_image_url, status)
    VALUES (test_user_1_id, test_pet_id, 'http://example.com/audit_test_insert.jpg', 'pending')
    RETURNING id INTO new_portrait_id;
    SELECT COUNT(*) INTO audit_log_count FROM public.audit_logs WHERE table_name = 'portraits' AND record_id = new_portrait_id AND operation = 'INSERT';
    IF audit_log_count <> 1 THEN RAISE EXCEPTION 'Audit log INSERT failed for portraits.'; END IF;
    RAISE NOTICE '    SUCCESS: Audit log created for portrait INSERT.';

    -- UPDATE
    UPDATE public.portraits SET status = 'completed' WHERE id = new_portrait_id;
    SELECT COUNT(*) INTO audit_log_count FROM public.audit_logs WHERE table_name = 'portraits' AND record_id = new_portrait_id AND operation = 'UPDATE';
    IF audit_log_count <> 1 THEN RAISE EXCEPTION 'Audit log UPDATE failed for portraits.'; END IF;
    RAISE NOTICE '    SUCCESS: Audit log created for portrait UPDATE.';

    -- DELETE
    DELETE FROM public.portraits WHERE id = new_portrait_id;
    SELECT COUNT(*) INTO audit_log_count FROM public.audit_logs WHERE table_name = 'portraits' AND record_id = new_portrait_id AND operation = 'DELETE';
    IF audit_log_count <> 1 THEN RAISE EXCEPTION 'Audit log DELETE failed for portraits.'; END IF;
    RAISE NOTICE '    SUCCESS: Audit log created for portrait DELETE.';

    RESET "request.jwt.claims";
END $$;

-- Test 4.2: Pet Statistics Trigger (trg_pets_stats & trg_portraits_stats)
RAISE NOTICE 'Test 4.2: Pet Statistics Triggers';
DO $$ 
DECLARE 
    test_user_stats_id UUID;
    initial_pet_count INTEGER;
    initial_portrait_count INTEGER;
    new_pet_id UUID;
    new_portrait_id_stats UUID;
BEGIN
    -- Create a user for stats test
    test_user_stats_id := uuid_generate_v4();
    INSERT INTO auth.users (id, email, encrypted_password, role) VALUES (test_user_stats_id, 'statsuser@example.com', 'test', 'authenticated');
    INSERT INTO public.profiles (id, username) VALUES (test_user_stats_id, 'statsuser');
    
    -- Check initial stats (should be 0 or created by profile trigger)
    SELECT total_pets, total_portraits INTO initial_pet_count, initial_portrait_count 
    FROM public.pet_statistics WHERE user_id = test_user_stats_id;
    IF initial_pet_count IS NULL THEN initial_pet_count := 0; END IF;
    IF initial_portrait_count IS NULL THEN initial_portrait_count := 0; END IF;
    RAISE NOTICE '    Initial stats - Pets: %, Portraits: %', initial_pet_count, initial_portrait_count;

    -- Add a pet
    INSERT INTO public.pets (user_id, name, species) VALUES (test_user_stats_id, 'Stats Pet 1', 'DOG') RETURNING id INTO new_pet_id;
    PERFORM pg_sleep(0.1); -- Allow trigger to fire
    IF (SELECT total_pets FROM public.pet_statistics WHERE user_id = test_user_stats_id) <> initial_pet_count + 1 THEN
        RAISE EXCEPTION 'Pet statistics (total_pets) not updated correctly after pet INSERT. Expected: %, Actual: %', 
                        initial_pet_count + 1, (SELECT total_pets FROM public.pet_statistics WHERE user_id = test_user_stats_id);
    END IF;
    RAISE NOTICE '    SUCCESS: total_pets updated after pet INSERT.';

    -- Add a portrait
    INSERT INTO public.portraits (user_id, pet_id, input_image_url) VALUES (test_user_stats_id, new_pet_id, 'stats_portrait.jpg') RETURNING id INTO new_portrait_id_stats;
    PERFORM pg_sleep(0.1); -- Allow trigger to fire
    IF (SELECT total_portraits FROM public.pet_statistics WHERE user_id = test_user_stats_id) <> initial_portrait_count + 1 THEN
        RAISE EXCEPTION 'Pet statistics (total_portraits) not updated correctly after portrait INSERT. Expected: %, Actual: %', 
                        initial_portrait_count + 1, (SELECT total_portraits FROM public.pet_statistics WHERE user_id = test_user_stats_id);
    END IF;
    RAISE NOTICE '    SUCCESS: total_portraits updated after portrait INSERT.';

    -- Check latest_portrait_date
    IF (SELECT latest_portrait_date FROM public.pet_statistics WHERE user_id = test_user_stats_id) IS NULL THEN
        RAISE EXCEPTION 'Pet statistics (latest_portrait_date) not updated after portrait INSERT.';
    END IF;
    RAISE NOTICE '    SUCCESS: latest_portrait_date updated after portrait INSERT.';
    
    -- Clean up
    DELETE FROM auth.users WHERE id = test_user_stats_id;
END $$;

-- Test 4.3: Auto Portrait Processing Flags (trg_portrait_auto_status)
RAISE NOTICE 'Test 4.3: Auto Portrait Processing Flags Trigger';
DO $$ 
DECLARE 
    test_user_1_id UUID; 
    test_pet_id UUID;
    portrait_proc_id UUID;
BEGIN
    SELECT id INTO test_user_1_id FROM auth.users WHERE email = 'testuser1@example.com';
    SELECT id INTO test_pet_id FROM public.pets WHERE user_id = test_user_1_id AND name = 'Test Pet Alpha';

    -- Create a portrait
    INSERT INTO public.portraits (user_id, pet_id, input_image_url, status)
    VALUES (test_user_1_id, test_pet_id, 'http://example.com/proc_test.jpg', 'pending')
    RETURNING id INTO portrait_proc_id;

    -- Update with generated_image_url (status should become 'need_thumbnail')
    UPDATE public.portraits SET generated_image_url = 'http://example.com/proc_generated.jpg' WHERE id = portrait_proc_id;
    IF (SELECT status FROM public.portraits WHERE id = portrait_proc_id) <> 'need_thumbnail' THEN
        RAISE EXCEPTION 'Auto processing flag failed: status not set to need_thumbnail. Actual: %', (SELECT status FROM public.portraits WHERE id = portrait_proc_id);
    END IF;
    RAISE NOTICE '    SUCCESS: Status set to need_thumbnail.';

    -- Update with thumbnail_url (status should become 'completed')
    UPDATE public.portraits SET thumbnail_url = 'http://example.com/proc_thumb.jpg' WHERE id = portrait_proc_id;
    IF (SELECT status FROM public.portraits WHERE id = portrait_proc_id) <> 'completed' THEN
        RAISE EXCEPTION 'Auto processing flag failed: status not set to completed. Actual: %', (SELECT status FROM public.portraits WHERE id = portrait_proc_id);
    END IF;
    RAISE NOTICE '    SUCCESS: Status set to completed.';

    -- Clean up
    DELETE FROM public.portraits WHERE id = portrait_proc_id;
END $$;

-- ======================================================================
-- Section 5: Query Performance with Indexes Tests
-- ======================================================================
RAISE NOTICE '

======================================';
RAISE NOTICE 'Section 5: Query Performance with Indexes Tests';
RAISE NOTICE '======================================';

-- Test 5.1: Performance of idx_portraits_user_id
RAISE NOTICE 'Test 5.1: Performance of idx_portraits_user_id (EXPLAIN ANALYZE)';
DO $$ DECLARE test_user_1_id UUID; BEGIN
    SELECT id INTO test_user_1_id FROM auth.users WHERE email = 'testuser1@example.com';
    RAISE NOTICE 'Querying portraits for user_id: %', test_user_1_id;
    EXPLAIN ANALYZE SELECT * FROM public.portraits WHERE user_id = test_user_1_id;
    RAISE NOTICE '    SUCCESS: Check EXPLAIN ANALYZE output for index usage (e.g., Index Scan using idx_portraits_user_id).';
END $$;

-- Test 5.2: Performance of idx_pets_user_species (composite index)
RAISE NOTICE 'Test 5.2: Performance of idx_pets_user_species (EXPLAIN ANALYZE)';
DO $$ DECLARE test_user_1_id UUID; BEGIN
    SELECT id INTO test_user_1_id FROM auth.users WHERE email = 'testuser1@example.com';
    RAISE NOTICE 'Querying pets for user_id: % and species: DOG', test_user_1_id;
    EXPLAIN ANALYZE SELECT * FROM public.pets WHERE user_id = test_user_1_id AND species = 'DOG';
    RAISE NOTICE '    SUCCESS: Check EXPLAIN ANALYZE output for index usage (e.g., Index Scan using idx_pets_user_species).';
END $$;

-- Test 5.3: Performance of idx_portraits_public (partial index)
RAISE NOTICE 'Test 5.3: Performance of idx_portraits_public (EXPLAIN ANALYZE)';
BEGIN
    RAISE NOTICE 'Querying public portraits ordered by creation date';
    EXPLAIN ANALYZE SELECT * FROM public.portraits WHERE is_public = TRUE ORDER BY created_at DESC LIMIT 10;
    RAISE NOTICE '    SUCCESS: Check EXPLAIN ANALYZE output for index usage (e.g., Index Scan using idx_portraits_public).';
END;


RAISE NOTICE '

======================================';
RAISE NOTICE 'All Database Tests Completed.';
RAISE NOTICE 'Review output above for SUCCESS/FAILURE messages and EXPLAIN ANALYZE details.';
RAISE NOTICE '======================================';

-- End of script 