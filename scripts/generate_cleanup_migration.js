#!/usr/bin/env node

/**
 * CanvaPet Schema Cleanup Migration Generator
 * 
 * This script generates a migration file to clean up deprecated database elements
 * by scanning the database for items marked as deprecated in their comments.
 * 
 * Usage:
 *   node scripts/generate_cleanup_migration.js [options]
 * 
 * Options:
 *   --output <file>     Output migration file path (default: auto-generated)
 *   --description <desc> Migration description (default: "Schema Cleanup")
 *   --dry-run           Print migration to console without creating a file
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
let outputFile = null;
let description = "Schema Cleanup";
let dryRun = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--output' && i + 1 < args.length) {
    outputFile = args[i + 1];
    i++;
  } else if (args[i] === '--description' && i + 1 < args.length) {
    description = args[i + 1];
    i++;
  } else if (args[i] === '--dry-run') {
    dryRun = true;
  } else {
    console.error(`Unknown argument: ${args[i]}`);
    process.exit(1);
  }
}

// Function to execute a Supabase SQL query and return the results
function executeSql(sql) {
  try {
    const result = execSync(`echo "${sql}" | supabase db execute --local`, { encoding: 'utf8' });
    return result;
  } catch (error) {
    console.error('Error executing SQL query:', error.message);
    return null;
  }
}

// Find deprecated columns
function findDeprecatedColumns() {
  const sql = `
    SELECT
      c.table_schema,
      c.table_name,
      c.column_name,
      pgd.description
    FROM
      pg_catalog.pg_statio_all_tables AS st
      INNER JOIN pg_catalog.pg_description pgd ON pgd.objoid = st.relid
      INNER JOIN information_schema.columns c ON 
        pgd.objsubid = c.ordinal_position AND
        c.table_schema = st.schemaname AND
        c.table_name = st.relname
    WHERE
      c.table_schema = 'public' AND
      pgd.description ILIKE '%DEPRECATED%'
    ORDER BY
      c.table_schema,
      c.table_name,
      c.ordinal_position;
  `;
  
  return executeSql(sql);
}

// Find deprecated functions and triggers
function findDeprecatedFunctionsAndTriggers() {
  const sql = `
    SELECT
      p.proname AS function_name,
      n.nspname AS schema_name,
      pg_get_function_identity_arguments(p.oid) AS args,
      d.description
    FROM
      pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      LEFT JOIN pg_description d ON d.objoid = p.oid
    WHERE
      n.nspname = 'public' AND
      d.description ILIKE '%DEPRECATED%'
    ORDER BY
      n.nspname,
      p.proname;
      
    SELECT
      t.tgname AS trigger_name,
      n.nspname AS schema_name,
      c.relname AS table_name,
      d.description
    FROM
      pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      LEFT JOIN pg_description d ON d.objoid = t.oid
    WHERE
      n.nspname = 'public' AND
      d.description ILIKE '%DEPRECATED%'
    ORDER BY
      n.nspname,
      c.relname,
      t.tgname;
  `;
  
  return executeSql(sql);
}

// Generate the migration script
function generateMigrationScript() {
  console.log('Scanning database for deprecated items...');
  
  const deprecatedColumns = findDeprecatedColumns();
  const deprecatedFunctionsAndTriggers = findDeprecatedFunctionsAndTriggers();
  
  // Parse the results and generate SQL statements
  
  let migrationContent = `-- --------------------------------------
-- Migration: ${description}
-- --------------------------------------
-- This migration cleans up deprecated schema elements that are no longer needed.
-- Generated automatically by the cleanup script.

-- Start transaction
BEGIN;

-- Add migration tracking record
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_logs') THEN
        INSERT INTO public.audit_logs (
            table_name,
            record_id,
            operation,
            new_data,
            changed_by
        ) VALUES (
            'schema_migration',
            uuid_generate_v4(),
            'CLEANUP',
            jsonb_build_object(
                'description', '${description}',
                'timestamp', NOW()
            ),
            NULL
        );
    END IF;
END
$$;

-- --------------------------------------
-- Cleanup of deprecated columns
-- --------------------------------------
`;

  // Parse the deprecated columns output and add DROP COLUMN statements
  if (deprecatedColumns) {
    const columnRegex = /(\w+)\s+\|\s+(\w+)\s+\|\s+(\w+)\s+\|\s+(.*)/g;
    let match;
    let columnsMigration = '';
    
    while ((match = columnRegex.exec(deprecatedColumns)) !== null) {
      const [, schema, table, column, description] = match;
      if (schema && table && column) {
        columnsMigration += `-- Removing deprecated column: ${schema}.${table}.${column}\n`;
        columnsMigration += `-- Description: ${description.trim()}\n`;
        columnsMigration += `ALTER TABLE ${schema}.${table} DROP COLUMN IF EXISTS ${column};\n\n`;
      }
    }
    
    if (columnsMigration) {
      migrationContent += columnsMigration;
    } else {
      migrationContent += '-- No deprecated columns found\n\n';
    }
  } else {
    migrationContent += '-- Error scanning for deprecated columns\n\n';
  }

  migrationContent += `
-- --------------------------------------
-- Cleanup of deprecated triggers and functions
-- --------------------------------------
`;

  // Parse the deprecated functions and triggers output
  if (deprecatedFunctionsAndTriggers) {
    const functionRegex = /(\w+)\s+\|\s+(\w+)\s+\|\s+([^|]*)\|\s+(.*)/g;
    const triggerRegex = /(\w+)\s+\|\s+(\w+)\s+\|\s+(\w+)\s+\|\s+(.*)/g;
    let match;
    let functionsMigration = '';
    let triggersMigration = '';
    let inTriggerSection = false;
    
    const lines = deprecatedFunctionsAndTriggers.split('\n');
    
    for (const line of lines) {
      if (line.includes('trigger_name')) {
        inTriggerSection = true;
        continue;
      }
      
      if (!inTriggerSection) {
        // Process function
        match = functionRegex.exec(line);
        if (match) {
          const [, functionName, schema, args, description] = match;
          if (functionName && schema) {
            functionsMigration += `-- Removing deprecated function: ${schema}.${functionName}${args.trim()}\n`;
            functionsMigration += `-- Description: ${description ? description.trim() : 'No description'}\n`;
            functionsMigration += `DROP FUNCTION IF EXISTS ${schema}.${functionName}${args.trim()};\n\n`;
          }
        }
      } else {
        // Process trigger
        match = triggerRegex.exec(line);
        if (match) {
          const [, triggerName, schema, table, description] = match;
          if (triggerName && schema && table) {
            triggersMigration += `-- Removing deprecated trigger: ${triggerName} on ${schema}.${table}\n`;
            triggersMigration += `-- Description: ${description ? description.trim() : 'No description'}\n`;
            triggersMigration += `DROP TRIGGER IF EXISTS ${triggerName} ON ${schema}.${table};\n\n`;
          }
        }
      }
    }
    
    if (triggersMigration) {
      migrationContent += '-- Deprecated Triggers\n' + triggersMigration;
    } else {
      migrationContent += '-- No deprecated triggers found\n\n';
    }
    
    if (functionsMigration) {
      migrationContent += '-- Deprecated Functions\n' + functionsMigration;
    } else {
      migrationContent += '-- No deprecated functions found\n\n';
    }
  } else {
    migrationContent += '-- Error scanning for deprecated functions and triggers\n\n';
  }

  migrationContent += `
-- Commit transaction
COMMIT;
`;

  return migrationContent;
}

// Create the migration file
function createMigrationFile(content) {
  if (dryRun) {
    console.log('\n=== Generated Migration (Dry Run) ===\n');
    console.log(content);
    console.log('\n=== End of Generated Migration ===\n');
    return;
  }
  
  if (!outputFile) {
    // If no output file specified, use Supabase CLI to create a new migration
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').substring(0, 14);
    const migrationName = description.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    
    try {
      // Create a new migration file using Supabase CLI
      execSync(`supabase migration new ${migrationName}`, { stdio: 'inherit' });
      
      // Find the newly created migration file
      const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
      const files = fs.readdirSync(migrationsDir);
      const latestMigration = files
        .filter(file => file.endsWith('.sql'))
        .sort()
        .pop();
      
      if (latestMigration) {
        outputFile = path.join(migrationsDir, latestMigration);
      } else {
        console.error('Could not find the newly created migration file');
        process.exit(1);
      }
    } catch (error) {
      console.error('Error creating migration file:', error.message);
      process.exit(1);
    }
  }
  
  // Write the migration content to the file
  try {
    fs.writeFileSync(outputFile, content);
    console.log(`Migration successfully written to: ${outputFile}`);
  } catch (error) {
    console.error('Error writing migration file:', error.message);
    process.exit(1);
  }
}

// Main execution
const migrationContent = generateMigrationScript();
createMigrationFile(migrationContent); 