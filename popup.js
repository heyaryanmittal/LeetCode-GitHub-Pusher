const $ = id => document.getElementById(id);

(async () => {
  const creds = typeof CREDENTIALS !== "undefined" ? CREDENTIALS : {};
  const s = await chrome.storage.local.get([
    "githubUsername", "githubRepo", "githubBranch", "githubToken"
  ]);
  $("username").value = creds.githubUsername || s.githubUsername || "";
  $("repo").value = creds.githubRepo || s.githubRepo || "";
  $("branch").value = creds.githubBranch || s.githubBranch || "main";
  $("token").value = creds.githubToken || s.githubToken || "";
})();

$("save").addEventListener("click", async () => {
  const username = $("username").value.trim();
  const repo = $("repo").value.trim();
  const branch = $("branch").value.trim() || "main";
  const token = $("token").value.trim();

  const status = $("status");
  status.className = "";
  status.textContent = "Testing connection...";

  try {
    if (!username || !repo || !token) {
      throw new Error("Username, repository and PAT are required.");
    }

    const response = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(repo)}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28"
        }
      }
    );

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.message || `GitHub returned ${response.status}`);
    }

    await chrome.storage.local.set({
      githubUsername: username,
      githubRepo: repo,
      githubBranch: branch,
      githubToken: token
    });

    status.className = "ok";
    status.textContent = `✅ Connected to ${data.full_name}.`;
  } catch (error) {
    status.className = "err";
    status.textContent = `❌ ${error?.message || String(error)}`;
  }
});
