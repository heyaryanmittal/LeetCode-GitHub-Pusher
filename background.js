importScripts("credentials.js");

const GH_API_VERSION = "2022-11-28";

function getCreds() {
  return typeof CREDENTIALS !== "undefined" ? CREDENTIALS : {
    githubUsername: "",
    githubRepo: "",
    githubBranch: "main",
    githubToken: ""
  };
}

chrome.runtime.onInstalled.addListener(async () => {
  const creds = getCreds();
  const s = await chrome.storage.local.get(["githubUsername", "githubRepo", "githubBranch", "githubToken"]);
  await chrome.storage.local.set({
    githubUsername: creds.githubUsername || s.githubUsername || "",
    githubRepo: creds.githubRepo || s.githubRepo || "",
    githubBranch: creds.githubBranch || s.githubBranch || "main",
    githubToken: creds.githubToken || s.githubToken || ""
  });
});

async function getSettings() {
  const creds = getCreds();
  const s = await chrome.storage.local.get([
    "githubUsername", "githubRepo", "githubBranch", "githubToken"
  ]);
  const githubUsername = creds.githubUsername || s.githubUsername || "";
  const githubRepo = creds.githubRepo || s.githubRepo || "";
  const githubBranch = creds.githubBranch || s.githubBranch || "main";
  const githubToken = creds.githubToken || s.githubToken || "";

  if (!githubUsername || !githubRepo || !githubToken) {
    throw new Error("GitHub settings are missing. Open credentials.js and fill in your details.");
  }
  return {
    githubUsername,
    githubRepo,
    githubBranch,
    githubToken
  };
}

async function github(path, options = {}) {
  const s = await getSettings();
  const response = await fetch("https://api.github.com" + path, {
    ...options,
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${s.githubToken}`,
      "X-GitHub-Api-Version": GH_API_VERSION,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || `GitHub API error (${response.status})`);
  }
  return data;
}

function base64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

async function getFile(path, branch) {
  const s = await getSettings();
  const url =
    `/repos/${encodeURIComponent(s.githubUsername)}/${encodeURIComponent(s.githubRepo)}` +
    `/contents/${path}?ref=${encodeURIComponent(branch)}`;

  const response = await fetch("https://api.github.com" + url, {
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${s.githubToken}`,
      "X-GitHub-Api-Version": GH_API_VERSION
    }
  });

  if (response.status === 404) return null;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || `GitHub API error (${response.status})`);
  return data;
}

async function putFile(path, content, message, branch) {
  const s = await getSettings();
  const existing = await getFile(path, branch);

  const body = {
    message,
    content: base64(content),
    branch
  };

  if (existing?.sha) body.sha = existing.sha;

  return github(
    `/repos/${encodeURIComponent(s.githubUsername)}/${encodeURIComponent(s.githubRepo)}/contents/${path}`,
    { method: "PUT", body: JSON.stringify(body) }
  );
}

function extForLanguage(language) {
  const l = (language || "").toLowerCase().replace(/\s+/g, "");
  const map = {
    java: ".java",
    python: ".py",
    python3: ".py",
    javascript: ".js",
    typescript: ".ts",
    "c++": ".cpp",
    cpp: ".cpp",
    c: ".c",
    "c#": ".cs",
    csharp: ".cs",
    go: ".go",
    kotlin: ".kt",
    rust: ".rs",
    swift: ".swift",
    ruby: ".rb",
    php: ".php",
    scala: ".scala",
    dart: ".dart",
    sql: ".sql"
  };
  return map[l] || ".txt";
}

function cleanMarkdown(text) {
  let value = String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ");

  // LeetCode occasionally returns Markdown punctuation with an extra
  // backslash (for example "\# Title", "\- item", "\*\*bold\*\*").
  // Remove only Markdown punctuation escapes, not arbitrary backslashes.
  value = value.replace(
    /\\([\\`*_[\]{}()#+\-.!>])/g,
    "$1"
  );

  // Normalize excessive blank lines without destroying code blocks.
  value = value
    .split("\n")
    .map(line => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();

  return value;
}

function escapeCell(value) {
  return String(value || "")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, " ")
    .trim();
}

async function buildReadme(existingReadme, item) {
  const lines = cleanMarkdown(existingReadme).split("\n");
  const header = [
    "# LeetCode Solutions",
    "",
    "Automatically maintained by **LeetCode GitHub Pusher**.",
    "",
    "## Problems",
    "",
    "| # | Problem | Difficulty | Language | Solution |",
    "|---:|---|---|---|---|"
  ];

  const entries = new Map();

  for (const line of lines) {
    const m = line.match(
      /^\|\s*(\d+)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*\[?Solution\]?\(?(.*?)\)?\s*\|$/i
    );
    if (m) {
      entries.set(Number(m[1]), {
        number: Number(m[1]),
        title: m[2],
        difficulty: m[3],
        language: m[4],
        solution: m[5] || `./LC-${m[1]}/`
      });
    }
  }

  entries.set(item.number, {
    number: item.number,
    title: item.title,
    difficulty: item.difficulty || "Unknown",
    language: item.language || "Unknown",
    solution: `./LC-${item.number}/`
  });

  const sorted = [...entries.values()].sort((a, b) => a.number - b.number);

  return header.concat(
    sorted.map(e =>
      `| ${e.number} | ${escapeCell(e.title)} | ${escapeCell(e.difficulty)} | ` +
      `${escapeCell(e.language)} | [Solution](${e.solution}) |`
    )
  ).join("\n") + "\n";
}

async function readRepoReadme(branch) {
  const data = await getFile("README.md", branch);
  if (!data?.content) return "";
  try {
    const binary = atob(data.content.replace(/\n/g, ""));
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return "";
  }
}

async function readEditor(tabId) {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    func: () => {
      try {
        const models = window.monaco?.editor?.getModels?.() || [];
        const model = models.find(m => (m.getValue?.() || "").trim());
        if (model) {
          return {
            code: model.getValue(),
            language: model.getLanguageId?.() || ""
          };
        }
      } catch (_) {}
      return null;
    }
  });
  return results?.[0]?.result || null;
}

async function pushAccepted(tabId, payload) {
  const settings = await getSettings();

  let code = payload.code || "";
  let language = payload.language || "";

  if (!code) {
    const editor = await readEditor(tabId);
    if (!editor?.code) {
      throw new Error("Could not read the LeetCode editor. Open the problem editor and try again.");
    }
    code = editor.code;
    language = editor.language || language;
  }

  const number = Number(payload.number);
  if (!Number.isInteger(number) || number < 1) {
    throw new Error("Invalid verified LeetCode question number.");
  }
  if (!payload.slug || !/^[-a-z0-9]+$/.test(payload.slug)) {
    throw new Error("Invalid LeetCode problem slug."); 
  }
  if (!Number.isInteger(number)) throw new Error("Invalid LeetCode question number.");

  const folder = `LC-${number}`;
  const solutionFile = `solution${extForLanguage(language)}`;

  const safeTitle = cleanMarkdown(payload.title || `Problem ${number}`)
    .replace(/^#+\s*/, "")
    .trim();

  const problem = [
    `# ${number}. ${safeTitle}`,
    "",
    `- **LeetCode:** ${payload.url}`,
    `- **Difficulty:** ${payload.difficulty || "Unknown"}`,
    `- **Language:** ${language || "Unknown"}`,
    `- **Status:** Accepted`,
    `- **Submission ID:** ${payload.submissionId || "Not available"}`,
    `- **Runtime:** ${payload.runtime || "Not available"}`,
    `- **Memory:** ${payload.memory || "Not available"}`,
    `- **Tags:** ${payload.tags?.length ? payload.tags.join(", ") : "Not detected"}`,
    "",
    "## Problem",
    "",
    cleanMarkdown(payload.problem) || "Problem statement could not be captured automatically.",
    "",
    "## Solution",
    "",
    `See [${solutionFile}](./${solutionFile}).`,
    "",
    "## Complexity",
    "",
    "- **Time:**",
    "- **Space:**",
    "",
    "_Complexity is intentionally left blank unless it is explicitly available; the extension does not invent complexity claims._",
    ""
  ].join("\n");

  await putFile(
    `${folder}/problem.md`,
    problem,
    `Update LC-${number} problem`,
    settings.githubBranch
  );

  await putFile(
    `${folder}/${solutionFile}`,
    code,
    `Update LC-${number} solution`,
    settings.githubBranch
  );

  const readme = await readRepoReadme(settings.githubBranch);
  const newReadme = await buildReadme(readme, {
    number,
    title: payload.title,
    difficulty: payload.difficulty || "Unknown",
    language: language || "Unknown"
  });

  await putFile(
    "README.md",
    newReadme,
    `Update README for LC-${number}`,
    settings.githubBranch
  );

  return {
    ok: true,
    folder,
    solutionFile,
    url:
      `https://github.com/${settings.githubUsername}/${settings.githubRepo}` +
      `/tree/${encodeURIComponent(settings.githubBranch)}/${encodeURIComponent(folder)}`
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "LCGH_PUSH_ACCEPTED") return;

  pushAccepted(sender.tab?.id, message)
    .then(sendResponse)
    .catch(error => sendResponse({
      ok: false,
      error: error?.message || String(error)
    }));

  return true;
});
