# Project Structure

Complete overview of the AI Tree Chat application with Next.js and Supabase database schema.

```
ai-tree-chat/
│
├── 📄 README.md                    # Main documentation and getting started guide
├── 📄 CHECKLIST.md                 # Implementation verification checklist
├── 📄 CONTRIBUTING.md              # Contribution guidelines
├── 📄 LICENSE                      # MIT License
├── 📄 PROJECT_STRUCTURE.md         # This file
│
├── 📄 package.json                 # npm dependencies and scripts
├── 📄 tsconfig.json                # TypeScript configuration
├── 📄 .gitignore                   # Git ignore patterns
├── 📄 .env.example                 # Environment variables template
├── 📄 .eslintrc.json               # ESLint configuration
├── 📄 .prettierrc.json             # Prettier configuration
├── 📄 next.config.js               # Next.js configuration
├── 📄 next-env.d.ts                # Next.js TypeScript declarations
├── 📄 tailwind.config.ts           # Tailwind CSS configuration
├── 📄 postcss.config.mjs           # PostCSS configuration
├── 📄 components.json              # shadcn/ui configuration
│
├── 📁 src/                         # Next.js application source
│   ├── 📁 app/                     # Next.js App Router
│   │   ├── 📄 layout.tsx           # Root layout
│   │   ├── 📄 page.tsx             # Home page
│   │   └── 📄 globals.css          # Global styles
│   ├── 📁 components/
│   │   └── 📁 ui/                  # shadcn UI components
│   │       ├── 📄 button.tsx       # Button component
│   │       ├── 📄 input.tsx        # Input component
│   │       ├── 📄 textarea.tsx     # Textarea component
│   │       ├── 📄 dialog.tsx       # Dialog component
│   │       ├── 📄 sheet.tsx        # Sheet component
│   │       ├── 📄 tabs.tsx         # Tabs component
│   │       └── 📄 scroll-area.tsx  # Scroll area component
│   └── 📁 lib/
│       ├── 📄 utils.ts             # Utility functions (cn)
│       └── 📁 supabase/            # Supabase clients
│           ├── 📄 client.ts        # Browser client
│           └── 📄 server.ts        # Server client
│
├── 📁 lib/                         # Database utilities
│   ├── 📄 database.types.ts        # Generated TypeScript types
│   └── 📄 supabase.ts              # Database helper functions
│
├── 📁 supabase/                    # Supabase configuration and migrations
│   ├── 📄 config.toml              # Supabase local dev configuration
│   ├── 📄 seed.sql                 # Sample seed data for testing
│   └── 📁 migrations/              # SQL migration files
│       └── 📄 20231211000000_initial_schema.sql
│
├── 📁 examples/                    # Usage examples
│   └── 📄 basic-usage.ts           # Comprehensive database usage examples
│
└── 📁 docs/                        # Detailed documentation
    ├── 📄 SCHEMA.md                # Database schema documentation
    ├── 📄 QUICKSTART.md            # Quick start guide
    ├── 📄 RLS_POLICIES.md          # Row-level security documentation
    └── 📄 FEATURES.md              # Features overview
```

## File Descriptions

### Root Level Files

#### README.md
- **Purpose**: Main entry point for documentation
- **Contents**: 
  - Project overview
  - Database schema description
  - Getting started guide
  - Migration instructions
  - API usage examples
  - Development workflow
- **Audience**: All developers

#### CHECKLIST.md
- **Purpose**: Implementation verification
- **Contents**: 
  - Complete feature checklist
  - Testing instructions
  - Statistics
  - Status summary
- **Audience**: Developers and reviewers

#### CONTRIBUTING.md
- **Purpose**: Contribution guidelines
- **Contents**: 
  - Development setup
  - Code style guidelines
  - Commit message format
  - Pull request process
  - Testing requirements
- **Audience**: Contributors

#### LICENSE
- **Purpose**: Legal terms
- **Contents**: MIT License
- **Audience**: All users

#### package.json
- **Purpose**: npm configuration
- **Contents**: 
  - Dependencies (@supabase/supabase-js, typescript)
  - Scripts (db:types, db:start, db:stop, etc.)
  - Project metadata
- **Usage**: `npm install`, `npm run <script>`

#### tsconfig.json
- **Purpose**: TypeScript configuration
- **Contents**: 
  - Compiler options
  - Path mappings
  - Include/exclude patterns
- **Usage**: Used by TypeScript compiler

#### .gitignore
- **Purpose**: Git exclusions
- **Contents**: 
  - node_modules
  - .env files
  - .supabase directory
  - Build output
- **Usage**: Automatically used by git

#### .env.example
- **Purpose**: Environment variable template
- **Contents**: 
  - Supabase URL
  - Supabase keys (anon, service role)
  - Next.js variables (if using Next.js)
- **Usage**: Copy to `.env.local` and fill in values

### supabase/ Directory

#### config.toml
- **Purpose**: Supabase local configuration
- **Contents**: 
  - API configuration
  - Database settings
  - Auth configuration
  - Storage settings
- **Usage**: Used by Supabase CLI

#### seed.sql
- **Purpose**: Test data
- **Contents**: 
  - Sample users
  - Example sessions
  - Sample conversations
  - Branch examples
- **Usage**: `supabase db reset` (with seed)

#### migrations/20231211000000_initial_schema.sql
- **Purpose**: Initial database schema
- **Contents**: 
  - Table definitions (profiles, dialog_sessions, conversation_nodes, etc.)
  - Indexes
  - Foreign keys
  - RLS policies
  - Triggers
  - Functions
  - Views
- **Size**: ~600 lines
- **Usage**: Auto-applied by Supabase

### lib/ Directory

#### database.types.ts
- **Purpose**: TypeScript type definitions
- **Contents**: 
  - Type definitions for all tables
  - Row, Insert, Update types
  - Foreign key relationships
  - Views and functions
- **Generation**: `npm run db:types`
- **Usage**: Import types in TypeScript code

#### supabase.ts
- **Purpose**: Helper utilities
- **Contents**: 
  - Client creation functions
  - Type aliases
  - Tree traversal helpers
  - Session management helpers
  - Streaming helpers
  - Branch management helpers
- **Usage**: Import and use helper functions

### examples/ Directory

#### basic-usage.ts
- **Purpose**: Complete usage examples
- **Contents**: 
  - 10+ example functions
  - Creating sessions
  - Adding messages
  - Streaming responses
  - Creating branches
  - Querying trees
  - Real-time subscriptions
  - Statistics queries
- **Usage**: Reference or run directly

### docs/ Directory

#### SCHEMA.md
- **Purpose**: Detailed schema documentation
- **Contents**: 
  - Entity relationship diagram
  - Table descriptions
  - Column descriptions
  - Index information
  - Query patterns
  - Performance tips
- **Length**: Comprehensive
- **Audience**: Developers working with schema

#### QUICKSTART.md
- **Purpose**: Get started quickly
- **Contents**: 
  - 5-minute setup
  - Step-by-step instructions
  - First queries
  - Testing methods
  - Troubleshooting
- **Length**: Concise
- **Audience**: New developers

#### RLS_POLICIES.md
- **Purpose**: Security documentation
- **Contents**: 
  - Policy overview
  - Table-by-table breakdown
  - Testing methods
  - Best practices
  - Common issues
  - Debugging tips
- **Length**: Comprehensive
- **Audience**: Security-conscious developers

#### FEATURES.md
- **Purpose**: Feature documentation
- **Contents**: 
  - Core features
  - Advanced features
  - Use cases
  - Best practices
  - Performance tips
  - Future enhancements
- **Length**: Comprehensive
- **Audience**: Product and technical teams

## File Sizes

Approximate line counts:

| File | Lines |
|------|-------|
| supabase/migrations/20231211000000_initial_schema.sql | ~600 |
| lib/database.types.ts | ~350 |
| lib/supabase.ts | ~300 |
| examples/basic-usage.ts | ~450 |
| README.md | ~750 |
| docs/SCHEMA.md | ~400 |
| docs/QUICKSTART.md | ~450 |
| docs/RLS_POLICIES.md | ~650 |
| docs/FEATURES.md | ~500 |
| CONTRIBUTING.md | ~400 |
| CHECKLIST.md | ~400 |

**Total**: ~5,250+ lines of code and documentation

## Directory Usage

### For New Developers

1. Start with **README.md** for overview
2. Follow **docs/QUICKSTART.md** for setup
3. Review **examples/basic-usage.ts** for patterns
4. Reference **docs/SCHEMA.md** as needed

### For Contributors

1. Read **CONTRIBUTING.md** for guidelines
2. Review **CHECKLIST.md** for requirements
3. Study **docs/RLS_POLICIES.md** for security
4. Check **docs/FEATURES.md** for context

### For Security Review

1. Read **docs/RLS_POLICIES.md** thoroughly
2. Review migration file RLS section
3. Test policies per RLS_POLICIES.md
4. Check helper functions in lib/supabase.ts

### For Database Administrators

1. Study **docs/SCHEMA.md** for structure
2. Review migration file for details
3. Check indexes and performance notes
4. Plan scaling per SCHEMA.md recommendations

## Navigation Guide

```
Starting Point → Purpose → Recommended Path
────────────────────────────────────────────
New to project → Learn basics → README.md → docs/QUICKSTART.md
Need to contribute → Make changes → CONTRIBUTING.md → docs/SCHEMA.md
Building features → Use database → examples/basic-usage.ts → lib/supabase.ts
Security review → Audit RLS → docs/RLS_POLICIES.md → Migration file
Understanding design → Learn architecture → docs/SCHEMA.md → docs/FEATURES.md
Production deployment → Deploy safely → README.md → docs/QUICKSTART.md (Production section)
```

## Key Directories

### Must Read
- **README.md**: Always start here
- **docs/QUICKSTART.md**: If you want to start coding fast
- **CONTRIBUTING.md**: Before making changes

### Reference
- **docs/SCHEMA.md**: When working with database
- **docs/RLS_POLICIES.md**: When dealing with security
- **docs/FEATURES.md**: When understanding capabilities

### Code
- **lib/supabase.ts**: Reusable utilities
- **examples/basic-usage.ts**: Copy-paste examples
- **lib/database.types.ts**: TypeScript types

### Configuration
- **supabase/config.toml**: Supabase settings
- **package.json**: npm scripts
- **tsconfig.json**: TypeScript settings
- **.env.example**: Environment template

## Quick Commands

```bash
# Setup
npm install                  # Install dependencies
npm run db:start            # Start Supabase

# Development
npm run db:types            # Generate types
npm run db:status           # Check status
npm run db:reset            # Reset database

# Maintenance
npm run db:stop             # Stop Supabase
npm run db:migrate          # Run migrations
```

## Notes

- All SQL is in `supabase/migrations/`
- All TypeScript is in `lib/` and `examples/`
- All documentation is in `docs/` and root `.md` files
- Configuration files are in root
- No build output is committed (see .gitignore)

## Updates

When making changes:

1. **Schema changes**: Edit migration file → run db:reset → run db:types → update docs
2. **Helper changes**: Edit lib/supabase.ts → update examples → update docs
3. **Documentation changes**: Edit relevant .md files → review for consistency
4. **Configuration changes**: Edit config files → test locally → document in README

---

**Project Status**: ✅ Complete and ready for use

**Last Updated**: 2023-12-11
