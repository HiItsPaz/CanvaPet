#!/bin/bash
# CanvaPet Migration Testing Script
# This script helps test migrations safely in a controlled environment.

set -e  # Exit immediately if a command exits with a non-zero status

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
SNAPSHOT_NAME="pre_migration"
MIGRATION_PATH=""
VERBOSE=false
STEP_BY_STEP=false

# Function to display script usage
function show_usage {
    echo -e "${BLUE}CanvaPet Migration Testing Script${NC}"
    echo -e "Tests database migrations in a safe environment."
    echo
    echo -e "Usage: $0 [options] --migration <migration_path>"
    echo
    echo -e "Options:"
    echo -e "  -h, --help                Show this help message"
    echo -e "  -m, --migration PATH      Path to the migration file to test"
    echo -e "  -s, --snapshot NAME       Name of the database snapshot (default: pre_migration)"
    echo -e "  -v, --verbose             Enable verbose output"
    echo -e "  --step-by-step            Run each SQL statement individually for better debugging"
    echo
    echo -e "Example:"
    echo -e "  $0 --migration supabase/migrations/12345678_my_migration.sql"
    echo
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        -h|--help)
            show_usage
            exit 0
            ;;
        -m|--migration)
            MIGRATION_PATH="$2"
            shift
            shift
            ;;
        -s|--snapshot)
            SNAPSHOT_NAME="$2"
            shift
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --step-by-step)
            STEP_BY_STEP=true
            shift
            ;;
        *)
            # Unknown option
            echo -e "${RED}Error: Unknown option $1${NC}"
            show_usage
            exit 1
            ;;
    esac
done

# Check if migration path is provided
if [ -z "$MIGRATION_PATH" ]; then
    echo -e "${RED}Error: Migration file path is required. Use --migration option.${NC}"
    show_usage
    exit 1
fi

# Check if migration file exists
if [ ! -f "$MIGRATION_PATH" ]; then
    echo -e "${RED}Error: Migration file '$MIGRATION_PATH' does not exist.${NC}"
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI is not installed. Please install it first:${NC}"
    echo -e "brew install supabase/tap/supabase"
    exit 1
fi

# Banner
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  CanvaPet Migration Testing Tool    ${NC}"
echo -e "${BLUE}======================================${NC}"
echo

# Display configuration
echo -e "${YELLOW}Configuration:${NC}"
echo -e "- Migration file: ${BLUE}$MIGRATION_PATH${NC}"
echo -e "- Snapshot name: ${BLUE}$SNAPSHOT_NAME${NC}"
echo -e "- Verbose mode: ${BLUE}$([ "$VERBOSE" == true ] && echo "Enabled" || echo "Disabled")${NC}"
echo -e "- Step-by-step execution: ${BLUE}$([ "$STEP_BY_STEP" == true ] && echo "Enabled" || echo "Disabled")${NC}"
echo

# Function to execute SQL safely
function execute_sql {
    local sql="$1"
    local description="$2"
    
    # Only print SQL in verbose mode
    if [ "$VERBOSE" == true ]; then
        echo -e "${YELLOW}Executing SQL:${NC}"
        echo "$sql"
    else
        echo -e "${YELLOW}Executing:${NC} $description"
    fi
    
    # Execute the SQL
    echo "$sql" | supabase db execute --local
    
    echo -e "${GREEN}✓ Done${NC}"
    echo
}

# Start the local Supabase DB
echo -e "${YELLOW}Starting Supabase local instance...${NC}"
supabase start db
echo -e "${GREEN}✓ Supabase database started${NC}"
echo

# Create a snapshot before migrations
echo -e "${YELLOW}Creating database snapshot '$SNAPSHOT_NAME'...${NC}"
supabase db reset --snapshot $SNAPSHOT_NAME
echo -e "${GREEN}✓ Snapshot created${NC}"
echo

# Prepare for testing
echo -e "${YELLOW}Preparing to test migration...${NC}"
echo -e "Migration file: ${BLUE}$MIGRATION_PATH${NC}"
echo

# Extract UP and DOWN migrations if present
if grep -q "=== MIGRATION DOWN" "$MIGRATION_PATH"; then
    # File contains both UP and DOWN migrations
    UP_MIGRATION=$(sed -n '/^--/!p' "$MIGRATION_PATH" | sed -n '/=== MIGRATION DOWN/q;p')
    DOWN_MIGRATION=$(sed -n '/=== MIGRATION DOWN/,$p' "$MIGRATION_PATH" | sed -n '/^--/!p' | sed -n '/^\/\*/,/^\*\//d' | sed '/^$/d')
else
    # File contains only UP migration
    UP_MIGRATION=$(sed -n '/^--/!p' "$MIGRATION_PATH")
    DOWN_MIGRATION=""
fi

# Test the UP migration
echo -e "${YELLOW}Testing UP migration...${NC}"

if [ "$STEP_BY_STEP" == true ]; then
    # Execute each statement individually
    echo "$UP_MIGRATION" | sed -e '$a\\' | sed -n '/.*;/p' | while read -r stmt; do
        if [ ! -z "$stmt" ]; then
            execute_sql "$stmt" "Statement: ${stmt:0:50}..."
        fi
    done
else
    # Execute the entire migration at once
    execute_sql "$UP_MIGRATION" "Full UP migration"
fi

echo -e "${GREEN}✓ UP migration completed successfully${NC}"
echo

# Test the DOWN migration if it exists
if [ ! -z "$DOWN_MIGRATION" ]; then
    echo -e "${YELLOW}Testing DOWN migration (rollback)...${NC}"
    
    if [ "$STEP_BY_STEP" == true ]; then
        # Execute each statement individually
        echo "$DOWN_MIGRATION" | sed -e '$a\\' | sed -n '/.*;/p' | while read -r stmt; do
            if [ ! -z "$stmt" ]; then
                execute_sql "$stmt" "Statement: ${stmt:0:50}..."
            fi
        done
    else
        # Execute the entire rollback at once
        execute_sql "$DOWN_MIGRATION" "Full DOWN migration (rollback)"
    fi
    
    echo -e "${GREEN}✓ DOWN migration completed successfully${NC}"
    echo
else
    echo -e "${YELLOW}No explicit DOWN migration found in file.${NC}"
    echo
fi

# Restore from snapshot to clean up
echo -e "${YELLOW}Restoring database from snapshot '$SNAPSHOT_NAME'...${NC}"
supabase db reset --snapshot $SNAPSHOT_NAME
echo -e "${GREEN}✓ Database restored to original state${NC}"
echo

# Summary
echo -e "${BLUE}======================================${NC}"
echo -e "${GREEN}Migration test completed successfully!${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "The migration file '$(basename "$MIGRATION_PATH")' was tested successfully."
echo -e "You can now apply it to your development or production environment."
echo

exit 0 