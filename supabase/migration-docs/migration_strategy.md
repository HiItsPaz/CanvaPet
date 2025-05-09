# CanvaPet Database Migration Strategy

This document outlines our approach to database schema migrations, ensuring safe updates in production environments while maintaining data integrity.

## Migration Principles

Our migration strategy follows these key principles:

1. **Zero Downtime**: All migrations should be designed to run without requiring downtime.
2. **Data Preservation**: No user data should be lost during migrations.
3. **Backwards Compatibility**: Maintain support for older application versions during transition periods.
4. **Forward and Backward Migration**: All changes should be reversible with documented rollback steps.
5. **Transaction Safety**: Migrations should be wrapped in transactions where possible.
6. **Testing**: All migrations must be tested in development/staging environments before production.

## Migration Workflow

1. **Development**:
   - Create migration using `supabase migration new <migration_name>`
   - Implement and test changes locally
   - Include both "up" (apply) and "down" (rollback) steps

2. **Review**:
   - Peer review all migrations for safety and performance
   - Estimate runtime for large migrations
   - Identify potential breaking changes

3. **Testing**:
   - Apply migrations to staging environment
   - Verify data integrity
   - Test application compatibility

4. **Deployment**:
   - Apply to production during low-traffic periods
   - Monitor database performance during migration
   - Have rollback plan ready

## Common Migration Patterns

### 1. Adding New Tables or Columns

- Non-breaking change
- Use `IF NOT EXISTS` to make migrations idempotent
- Include proper comments and constraints

```sql
-- Example: Adding a new column
ALTER TABLE public.table_name
ADD COLUMN IF NOT EXISTS new_column_name TEXT;

COMMENT ON COLUMN public.table_name.new_column_name IS 'Description of the new column';
```

### 2. Renaming Columns (3-Phase Migration)

Renaming columns requires backward compatibility to prevent breaking existing application code.

**Phase 1: Add & Sync (this migration)**
```sql
-- Add new column
ALTER TABLE public.table_name
ADD COLUMN IF NOT EXISTS new_column_name TEXT;

-- Copy data
UPDATE public.table_name
SET new_column_name = old_column_name
WHERE new_column_name IS NULL;

-- Create sync trigger
CREATE TRIGGER sync_columns_trigger
BEFORE INSERT OR UPDATE ON public.table_name
FOR EACH ROW EXECUTE FUNCTION sync_columns_function();
```

**Phase 2: Application Update (between migrations)**
- Update all application code to use the new column name
- Deploy all services with updated column references
- Verify all systems are using new column

**Phase 3: Cleanup (future migration)**
```sql
-- Remove sync trigger
DROP TRIGGER sync_columns_trigger ON public.table_name;

-- Optionally remove old column when no longer needed
ALTER TABLE public.table_name
DROP COLUMN IF EXISTS old_column_name;
```

### 3. Changing Column Types

- Use temporary column and data migration
- Validate data during migration
- Use triggers to keep both columns in sync during transition

```sql
-- Add new column with new type
ALTER TABLE public.table_name
ADD COLUMN IF NOT EXISTS column_name_new NEW_TYPE;

-- Migrate data with conversion
UPDATE public.table_name
SET column_name_new = column_name::NEW_TYPE;

-- Add sync trigger (similar to column rename)
-- Update application code
-- Eventually drop old column
```

### 4. Working with Constraints

- Add constraints with validation
- Create constraints as NOT VALID first, then validate separately for large tables

```sql
-- For large tables, use two-step approach
ALTER TABLE public.table_name
ADD CONSTRAINT constraint_name CHECK (condition) NOT VALID;

-- Validate in a separate transaction (potentially expensive)
ALTER TABLE public.table_name
VALIDATE CONSTRAINT constraint_name;
```

### 5. Data Backfilling

For adding non-nullable columns to existing tables:

```sql
-- Add column as nullable initially
ALTER TABLE public.table_name
ADD COLUMN IF NOT EXISTS new_column TEXT;

-- Backfill data
UPDATE public.table_name
SET new_column = 'default value';

-- Then make it non-nullable
ALTER TABLE public.table_name
ALTER COLUMN new_column SET NOT NULL;
```

## Testing Migrations

Before applying migrations to production:

1. **Performance Testing**:
   - Monitor execution time in staging
   - For large tables, estimate production impact
   - Consider index impact on INSERT/UPDATE performance

2. **Data Integrity**:
   - Verify sample data before/after migration
   - Check foreign key relationships
   - Validate business logic with migrated data

3. **Application Compatibility**:
   - Test with both old and new application versions
   - Verify API responses
   - Check critical user flows

## Rollback Procedures

Every migration should include commented rollback steps:

```sql
-- === MIGRATION DOWN ===
/*
-- Rollback steps here
ALTER TABLE table_name DROP COLUMN column_name;
DROP FUNCTION function_name();
-- etc.
*/
```

For emergency rollbacks in production:
1. Run the rollback script
2. Verify data integrity
3. Roll back application code if necessary
4. Document the incident and solution

## Handling Large Tables

For tables with millions of rows:

1. **Batching**: Process data in smaller batches
2. **Off-peak timing**: Schedule during low-traffic periods
3. **Separate migrations**: Split schema changes from data migrations
4. **Monitoring**: Watch for table locks and performance issues

Example batched migration:
```sql
-- Batched update example
DO $$
DECLARE
  batch_size INT := 10000;
  max_id INT;
  current_id INT := 0;
BEGIN
  SELECT MAX(id) INTO max_id FROM large_table;
  
  WHILE current_id < max_id LOOP
    -- Update in batches
    UPDATE large_table
    SET new_column = computed_value
    WHERE id > current_id AND id <= current_id + batch_size;
    
    current_id := current_id + batch_size;
    COMMIT;
  END LOOP;
END $$;
```

## Special Considerations

### 1. Handling Long-Running Migrations

For migrations that may take significant time:

- Consider splitting into multiple smaller migrations
- Implement application-level migration handling
- Use temporary tables for complex data transformations

### 2. Maintaining Database Views

When changing underlying tables:

- Update views to match the new schema
- Consider creating compatibility views for transition
- Document view dependencies

### 3. Managing Extension Dependencies

When migrations depend on extensions:

- Ensure extensions are created first
- Check for extension availability
- Document extension requirements

## Conclusion

Following these migration strategies ensures we can safely evolve our database schema while maintaining application stability and data integrity. All team members should follow these guidelines when creating database migrations. 