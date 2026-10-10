/**
 * LeetCode GitHub Pusher - Credentials Configuration Template
 * 
 * Instructions:
 * 1. Fill in your GitHub username, repository, branch, and Personal Access Token (PAT).
 * 2. Save this file as `credentials.js` in the extension root directory.
 */

var CREDENTIALS = {
  githubUsername: "YOUR_GITHUB_USERNAME",
  githubRepo: "YOUR_GITHUB_REPOSITORY",
  githubBranch: "main",
  githubToken: "YOUR_GITHUB_PERSONAL_ACCESS_TOKEN"
};

if (typeof self !== "undefined") {
  self.CREDENTIALS = CREDENTIALS;
}
if (typeof window !== "undefined") {
  window.CREDENTIALS = CREDENTIALS;
}
