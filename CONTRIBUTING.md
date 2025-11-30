# Contributing to jotai-idb

## Development Workflow

### Setting up for development

```bash
bun install
bun run dev  # Watch mode for building
```

### Running tests and checks

```bash
bun run test        # Run tests
bun run check       # Run linter and format checks
bun run check:fix   # Auto-fix linting issues
bun run format      # Format code with Biome
```

## Release Process

This project uses an automated release workflow based on [conventional commits](https://www.conventionalcommits.org/).

### Conventional Commit Format

All commits should follow the conventional commit format:

```text
<type>(<scope>): <subject>

<body>
```

**Types:**

- `feat:` - New feature (triggers MINOR version bump)
- `fix:` - Bug fix (triggers PATCH version bump)
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, semicolons, etc.)
- `refactor:` - Code refactoring without feature changes
- `perf:` - Performance improvements
- `test:` - Test additions or updates
- `chore:` - Dependency updates, CI config, etc.

**Breaking Changes:**

To indicate a breaking change (triggers MAJOR version bump), add `BREAKING CHANGE:` in the commit body:

```bash
feat: redesign API

BREAKING CHANGE: The old API has been removed in favor of the new one.
```

### Making Changes

1. **Create a feature branch** from `main`:

```bash
git checkout -b feat/my-feature
```

1. **Make commits** with conventional commit messages:

```bash
git commit -m "feat: add new query feature"
```

1. **Push your branch** and create a PR:

```bash
git push origin feat/my-feature
```

1. **CI runs automatically** on PR:

- Tests run via `test.yml`
- Linting checks
- Build verification

1. **Get review and merge** to `main` via GitHub

### Automated Release

Once merged to `main`, the release process is fully automated:

#### Step 1: Version Bump (version.yml)

- Runs on every push to `main`
- Analyzes commits since last tag
- If `feat:` or `fix:` commits found:

  - Bumps version (using [bumpp](https://github.com/antfu/bumpp))
  - Updates `package.json`
  - Creates a git commit: `chore(release): bump version to vX.Y.Z [skip ci]`
  - Creates a git tag: `vX.Y.Z`
  - Pushes both to `main`
- If only `chore:`, `docs:`, etc. → Does nothing

#### Step 2: Publish (release.yml)

- Triggers on tag push (automatically after Step 1)
- Runs tests again (safety check)
- Builds the library
- Publishes to npm using OIDC + provenance
- Creates a GitHub Release with auto-generated release notes

### Version Bumping Rules

Based on [Semantic Versioning](https://semver.org/):

| Commit Type | Version Change | Example |
| --- | --- | --- |
| `fix:` | PATCH | 1.0.0 → 1.0.1 |
| `feat:` | MINOR | 1.0.0 → 1.1.0 |
| `BREAKING CHANGE` | MAJOR | 1.0.0 → 2.0.0 |

### Manual Release (if needed)

In rare cases, you may need to manually trigger a release:

```bash
# On main branch
git pull origin main

# Run the version bump manually
bun run bump
```

This will:

- Detect releasable commits
- Update package.json
- Create a commit and tag
- Print the new version

Then push:

```bash
git push origin main --follow-tags
```

The `release.yml` workflow will then automatically publish to npm.

### Release Notes

Release notes are automatically generated from commit messages by GitHub Actions. They appear on:

- [GitHub Releases page](https://github.com/rewdy/jotai-idb/releases)
- npm package page

Each release includes:

- Auto-generated summary of changes
- Categorized commits (Features, Bug Fixes, etc.)
- Contributor information

## Code Quality

- **Linting**: Biome (configured in `biome.json`)
- **Testing**: Rstest (tests in `/tests`)
- **Type Safety**: TypeScript strict mode

Make sure all checks pass locally before pushing:

```bash
bun run check
bun run test
bun run build
```

## Need Help?

- Check [Jotai documentation](https://jotai.org)
- Review existing [tests](/tests) for examples
- Check [issues](https://github.com/rewdy/jotai-idb/issues) for similar problems
