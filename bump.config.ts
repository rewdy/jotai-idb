export default {
  // Automatically commit version changes
  commit: true,
  commitMessage: "chore(release): bump version to v{version} [skip ci]",

  // Create a git tag
  tag: true,
  tagName: "v{version}",

  // Files to update with new version
  files: [
    {
      filename: "package.json",
      type: "json",
    },
  ],
};
