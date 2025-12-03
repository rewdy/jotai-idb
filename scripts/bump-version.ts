#!/usr/bin/env node

/**
 * Version bump script for jotai-idb
 *
 * Updates version in:
 * - lib/package.json
 *
 * Usage:
 *   bun run scripts/bump-version.ts patch           (0.1.0 -> 0.1.1)
 *   bun run scripts/bump-version.ts minor           (0.1.0 -> 0.2.0)
 *   bun run scripts/bump-version.ts major           (0.1.0 -> 1.0.0)
 *   bun run scripts/bump-version.ts 1.2.3           (set explicit version)
 *   bun run scripts/bump-version.ts patch --dry-run (preview changes)
 *   bun run scripts/bump-version.ts patch --commit  (bump, commit, and tag)
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const LIBRARY_ROOT = join(ROOT, "lib");

const GREEN = "\x1b[32m";
const RESET = "\x1b[0m";

// Parse arguments
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const shouldCommit = args.includes("--commit");
const bumpType = args.find((a) => !a.startsWith("--"));

if (!bumpType) {
  console.error(
    "Usage: bump-version.ts <patch|minor|major|x.y.z> [--dry-run] [--commit]",
  );
  process.exit(1);
}

if (dryRun && shouldCommit) {
  console.error("Cannot use --dry-run and --commit together");
  process.exit(1);
}

/**
 * Run a git command and return the output
 */
function git(command: string) {
  return execSync(`git ${command}`, { cwd: ROOT, encoding: "utf-8" }).trim();
}

/**
 * Check if there are uncommitted changes
 */
function hasUncommittedChanges() {
  const status = git("status --porcelain");
  return status.length > 0;
}

/**
 * Parse a semver string into components
 */
function parseVersion(version: string) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) throw new Error(`Invalid version: ${version}`);
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
  };
}

/**
 * Bump version based on type
 */
function bumpVersion(current: string, type: string) {
  // If type is an explicit version, validate and return it
  if (/^\d+\.\d+\.\d+$/.test(type)) {
    return type;
  }

  const v = parseVersion(current);

  switch (type) {
    case "major":
      return `${v.major + 1}.0.0`;
    case "minor":
      return `${v.major}.${v.minor + 1}.0`;
    case "patch":
      return `${v.major}.${v.minor}.${v.patch + 1}`;
    default:
      throw new Error(
        `Invalid bump type: ${type}. Use patch, minor, major, or x.y.z`,
      );
  }
}

/**
 * Get current version from package.json
 */
function getCurrentVersion() {
  const pkg = JSON.parse(
    readFileSync(join(LIBRARY_ROOT, "package.json"), "utf-8"),
  );
  return pkg.version;
}

type ChangeRecord = { file: string; old: string; new: string };

/**
 * Update version in a JSON file
 */
function updateJsonFile(
  filePath: string,
  newVersion: string,
  changes: ChangeRecord[],
) {
  const content = readFileSync(filePath, "utf-8");
  const pkg = JSON.parse(content);
  const oldVersion = pkg.version;

  if (oldVersion === newVersion) {
    return false;
  }

  pkg.version = newVersion;

  changes.push({
    file: filePath.replace(`${ROOT}/`, ""),
    old: oldVersion,
    new: newVersion,
  });

  if (!dryRun) {
    writeFileSync(filePath, `${JSON.stringify(pkg, null, 2)}\n`);
  }

  return true;
}

// Main
const currentVersion = getCurrentVersion();
const newVersion = bumpVersion(currentVersion, bumpType);

console.log(`\n📦 Version bump: ${currentVersion} → ${newVersion}\n`);

if (dryRun) {
  console.log("🔍 DRY RUN - no files will be modified\n");
}

// Check for uncommitted changes if --commit flag is used
if (shouldCommit && hasUncommittedChanges()) {
  console.error("❌ Error: You have uncommitted changes.");
  console.error("   Please commit or stash them before using --commit.\n");
  process.exit(1);
}

const changes: ChangeRecord[] = [];

// Update root package.json
updateJsonFile(join(LIBRARY_ROOT, "package.json"), newVersion, changes);

// -- If we need to update any other files, we could add them here! --

// Print summary
if (changes.length === 0) {
  console.log("No files needed updating.");
} else {
  console.log("Files updated:");
  for (const change of changes) {
    console.log(
      `  ${GREEN}✓${RESET} ${change.file}: ${change.old} → ${change.new}`,
    );
  }
  console.log(
    `\nTotal: ${changes.length} file(s) ${dryRun ? "would be " : ""}updated`,
  );
}

// Handle --commit flag
if (shouldCommit && changes.length > 0) {
  console.log("\n🔧 Creating commit and tag...\n");

  try {
    // Stage all changes
    git("add -A");
    console.log("  ✓ Staged changes");

    // Create commit
    const commitMessage = `chore: bump version to ${newVersion}`;
    git(`commit -m "${commitMessage}"`);
    console.log(`  ✓ Created commit: "${commitMessage}"`);

    // Create tag
    const tag = `v${newVersion}`;
    git(`tag ${tag}`);
    console.log(`  ✓ Created tag: ${tag}`);

    console.log(`\n✅ Done! To publish, run:`);
    console.log(`  git push && git push origin ${tag}\n`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ Error during git operations: ${errorMessage}\n`);
    process.exit(1);
  }
} else if (!dryRun && !shouldCommit && changes.length > 0) {
  console.log(`\nNext steps:`);
  console.log(`  git add -A`);
  console.log(`  git commit -m "chore: bump version to ${newVersion}"`);
  console.log(`  git tag v${newVersion}`);
  console.log(`  git push && git push origin v${newVersion}`);
}

console.log("");
