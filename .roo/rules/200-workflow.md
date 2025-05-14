---
description: 
globs: 
alwaysApply: true
---
# Task Master Development Workflow

## Primary Interaction Methods

### MCP Server (Recommended)
- For AI agents and integrated environments (like Roo Code)
- Offers better performance and structured data exchange
- Exposed through a set of tools (e.g., `get_tasks`, `add_subtask`)
- See [taskmaster.md](mdc:.roo/rules/500-taskmaster.md) for available tools

### CLI (For Users & Fallback)
- Direct terminal interaction via `task-master` command
- Fallback if MCP server is inaccessible
- Commands mirror MCP tools (e.g., `task-master list` ≈ `get_tasks`)
- See [taskmaster.md](mdc:.roo/rules/500-taskmaster.md) for command reference

## Standard Development Process

1. **Project Setup**
   - Initialize with `initialize_project` / `task-master init`
   - Generate tasks from PRD using `parse_prd` / `task-master parse-prd`

2. **Task Management**
   - View tasks with `get_tasks` / `task-master list`
   - Find next task with `next_task` / `task-master next`
   - Analyze complexity with `analyze_project_complexity` / `task-master analyze-complexity`
   - Break down tasks with `expand_task` / `task-master expand`

3. **Implementation**
   - Follow task details and implementation notes
   - Update task status with `set_task_status`
   - Add implementation notes with `update_subtask`

4. **Task Completion**
   - Mark tasks as done with `set_task_status`
   - Generate task files with `generate`
   - Update dependent tasks if needed with `update`

## Task Breakdown Process

- Use `expand_task` with appropriate flags:
  - `--num=<number>` to specify subtask count
  - `--research` for research-backed expansion
  - `--force` to replace existing subtasks
  - `--prompt="<context>"` for additional context

## Implementation Drift Handling

- Use `update` for multiple future tasks
- Use `update_task` for a single task
- Include comprehensive context in the prompt

## Configuration Management

- `.taskmasterconfig` file in project root
  - Contains AI model selections and parameters
  - Managed via `task-master models` command
- Environment variables (`.env` / `mcp.json`)
  - Only for API keys and endpoint URLs

See [taskmaster.md](mdc:.roo/rules/500-taskmaster.md) for detailed command reference.
