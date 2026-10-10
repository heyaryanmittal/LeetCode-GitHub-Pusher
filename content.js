(() => {
  if (window.__LCGH_LOADED__) return;
  window.__LCGH_LOADED__ = true;

  // Create UI container
  const host = document.createElement("div");
  host.id = "lcgh-extension-root";
  host.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:2147483647;pointer-events:auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;";

  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .container {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
      user-select: none;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 11px 18px;
      background: linear-gradient(135deg, #24292e 0%, #0f1419 100%);
      color: #ffffff;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 30px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 18px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.2);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      outline: none;
    }
    .btn:hover {
      background: linear-gradient(135deg, #2ea043 0%, #238636 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 22px rgba(46,160,67,0.4), 0 2px 8px rgba(0,0,0,0.25);
      border-color: rgba(255,255,255,0.3);
    }
    .btn:active {
      transform: translateY(0);
    }
    .btn:disabled {
      opacity: 0.65;
      cursor: wait;
      transform: none !important;
    }
    .btn.highlight {
      background: linear-gradient(135deg, #2ea043 0%, #238636 100%);
      animation: pulse 2s infinite;
      border-color: #3fb950;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(46, 160, 67, 0.6); }
      70% { box-shadow: 0 0 0 10px rgba(46, 160, 67, 0); }
      100% { box-shadow: 0 0 0 0 rgba(46, 160, 67, 0); }
    }
    .msg-card {
      display: none;
      max-width: 380px;
      background: #ffffff;
      color: #1f2328;
      border-radius: 12px;
      padding: 12px 14px;
      font-size: 12px;
      line-height: 1.45;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2), 0 1px 4px rgba(0,0,0,0.1);
      border: 1px solid #d0d7de;
      animation: slideIn 0.2s ease-out;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .msg-card.ok { border-left: 4px solid #2da44e; }
    .msg-card.warn { border-left: 4px solid #d29922; }
    .msg-card.err { border-left: 4px solid #cf222e; }
    .msg-card a {
      color: #0969da;
      text-decoration: underline;
      font-weight: 600;
      cursor: pointer;
    }
    .icon {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }
  `;
  shadow.appendChild(style);

  const container = document.createElement("div");
  container.className = "container";

  const msgCard = document.createElement("div");
  msgCard.className = "msg-card";

  const pushBtn = document.createElement("button");
  pushBtn.className = "btn";
  pushBtn.innerHTML = `
    <svg class="icon" viewBox="0 0 16 16">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
    </svg>
    <span>🚀 Push to GitHub</span>
  `;

  container.append(msgCard, pushBtn);
  shadow.appendChild(container);

  function showMessage(html, type = "ok", autoHideMs = 6000) {
    msgCard.style.display = "block";
    msgCard.className = `msg-card ${type}`;
    msgCard.innerHTML = html;
    if (autoHideMs > 0) {
      setTimeout(() => {
        msgCard.style.display = "none";
      }, autoHideMs);
    }
  }

  function getSlug() {
    const m = location.pathname.match(/\/problems\/([^/]+)/);
    return m ? decodeURIComponent(m[1]).replace(/\/$/, "") : "";
  }

  function ensureAttached() {
    const target = document.body || document.documentElement;
    if (target && !document.contains(host)) {
      target.appendChild(host);
    }
    const slug = getSlug();
    if (slug) {
      container.style.display = "flex";
      host.style.display = "block";
    } else {
      container.style.display = "none";
      host.style.display = "none";
    }
  }

  // Mount UI
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureAttached);
  } else {
    ensureAttached();
  }
  setInterval(ensureAttached, 1200);

  // Convert HTML from LeetCode GraphQL to Clean Markdown
  function htmlToMarkdown(html) {
    if (!html) return "";
    try {
      const doc = new DOMParser().parseFromString(html, "text/html");

      function inline(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.nodeValue.replace(/\u00a0/g, " ");
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return "";
        const tag = node.tagName.toLowerCase();
        const content = [...node.childNodes].map(inline).join("");

        if (tag === "br") return "\n";
        if (tag === "strong" || tag === "b") return `**${content.trim()}**`;
        if (tag === "em" || tag === "i") return `*${content.trim()}*`;
        if (tag === "code" && node.parentElement?.tagName?.toLowerCase() !== "pre") {
          return "`" + content.replace(/`/g, "\\`") + "`";
        }
        if (tag === "a") {
          const href = node.getAttribute("href");
          return href ? `[${content.trim() || href}](${href})` : content;
        }
        if (tag === "img") {
          const src = node.getAttribute("src");
          const alt = node.getAttribute("alt") || "";
          return src ? `![${alt}](${src})` : "";
        }
        return content;
      }

      function block(node, depth = 0) {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.nodeValue.replace(/\u00a0/g, " ");
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return "";
        const tag = node.tagName.toLowerCase();

        if (tag === "pre") {
          const code = node.textContent.replace(/\r\n/g, "\n").trimEnd();
          return `\n\n\`\`\`\n${code}\n\`\`\`\n\n`;
        }
        if (/^h[1-6]$/.test(tag)) {
          const level = Number(tag[1]);
          return `\n\n${"#".repeat(level)} ${[...node.childNodes].map(inline).join("").trim()}\n\n`;
        }
        if (tag === "li") {
          const parent = node.parentElement?.tagName?.toLowerCase();
          const bullet = parent === "ol" ? "1." : "-";
          return `${bullet} ${[...node.childNodes].map(c => block(c, depth + 1)).join("").trim()}\n`;
        }
        if (tag === "ul" || tag === "ol") {
          return `\n${[...node.children].map(c => block(c, depth + 1)).join("")}\n`;
        }
        if (tag === "p" || tag === "div" || tag === "section" || tag === "article") {
          const body = [...node.childNodes].map(c => block(c, depth)).join("");
          return `\n\n${body.trim()}\n\n`;
        }
        if (tag === "table") {
          const rows = [...node.querySelectorAll("tr")];
          if (!rows.length) return "";
          const out = [];
          const first = [...rows[0].children].map(c => inline(c).trim());
          out.push(`| ${first.join(" | ")} |`);
          out.push(`| ${first.map(() => "---").join(" | ")} |`);
          for (const row of rows.slice(1)) {
            const cells = [...row.children].map(c => inline(c).trim());
            out.push(`| ${cells.join(" | ")} |`);
          }
          return `\n\n${out.join("\n")}\n\n`;
        }
        return [...node.childNodes].map(c => block(c, depth)).join("");
      }

      let result = block(doc.body).replace(/\n{3,}/g, "\n\n").trim();
      result = result.replace(/\\([\\`*_[\]{}()#+\-.!>])/g, "$1");
      return result;
    } catch (_) {
      return String(html || "");
    }
  }

  // Fetch Authoritative Problem Data from LeetCode GraphQL
  async function getQuestionInfo(slug) {
    const query = `
      query questionTitle($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          questionFrontendId
          title
          titleSlug
          difficulty
          content
          topicTags {
            name
            slug
          }
        }
      }
    `;
    try {
      const res = await fetch("/graphql/", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables: { titleSlug: slug } })
      });
      if (res.ok) {
        const data = await res.json();
        const q = data?.data?.question;
        if (q && q.questionFrontendId) {
          return {
            number: String(q.questionFrontendId),
            title: q.title,
            slug: q.titleSlug,
            url: `https://leetcode.com/problems/${q.titleSlug}/`,
            difficulty: q.difficulty || "Unknown",
            tags: (q.topicTags || []).map(t => t.name).filter(Boolean),
            problem: htmlToMarkdown(q.content || "")
          };
        }
      }
    } catch (_) {}

    // Fallback: Read DOM
    let number = "";
    let title = "";
    const titleEl = document.querySelector('[data-cy="question-title"]') || document.querySelector("h1");
    if (titleEl) {
      const text = (titleEl.innerText || "").trim();
      const m = text.match(/^(\d+)\s*\.\s*(.+)$/);
      if (m) {
        number = m[1];
        title = m[2].trim();
      }
    }
    if (!title) {
      title = document.title.replace(/\s*-\s*LeetCode.*$/i, "").trim();
    }

    return {
      number: number || "1",
      title: title || slug.replace(/-/g, " "),
      slug,
      url: `https://leetcode.com/problems/${slug}/`,
      difficulty: "Unknown",
      tags: [],
      problem: ""
    };
  }

  // Fetch recent accepted submission details
  async function getAcceptedSubmission(slug) {
    const listQuery = `
      query submissionList($offset: Int!, $limit: Int!, $lastKey: String, $questionSlug: String!) {
        submissionList(offset: $offset, limit: $limit, lastKey: $lastKey, questionSlug: $questionSlug) {
          submissions {
            id
            statusDisplay
            lang
            runtime
            memory
            timestamp
          }
        }
      }
    `;

    try {
      const res = await fetch("/graphql/", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: listQuery,
          variables: { offset: 0, limit: 10, questionSlug: slug }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const submissions = data?.data?.submissionList?.submissions || [];
        const accepted = submissions.find(s =>
          String(s?.statusDisplay || "").toLowerCase().includes("accepted")
        );

        if (accepted && accepted.id) {
          // Fetch submission code
          const detailQuery = `
            query submissionDetails($submissionId: Int!) {
              submissionDetails(submissionId: $submissionId) {
                code
                runtime
                memory
                lang {
                  name
                  verboseName
                }
              }
            }
          `;
          const dRes = await fetch("/graphql/", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: detailQuery,
              variables: { submissionId: parseInt(accepted.id, 10) }
            })
          });

          if (dRes.ok) {
            const dData = await dRes.json();
            const details = dData?.data?.submissionDetails;
            if (details && details.code) {
              return {
                code: details.code,
                language: details.lang?.verboseName || details.lang?.name || accepted.lang || "Java",
                submissionId: String(accepted.id),
                runtime: details.runtime || accepted.runtime || "",
                memory: details.memory || accepted.memory || ""
              };
            }
          }
        }
      }
    } catch (_) {}

    return null;
  }

  // Fallback: Read code directly from DOM (Monaco / CodeMirror)
  function getCodeFromDOM() {
    // Check Monaco Editor view lines
    const lines = [...document.querySelectorAll(".view-line")];
    if (lines.length > 0) {
      const code = lines.map(l => l.innerText || l.textContent || "").join("\n");
      if (code.trim()) return code;
    }
    // Check CodeMirror 6
    const cmLines = [...document.querySelectorAll(".cm-line")];
    if (cmLines.length > 0) {
      const code = cmLines.map(l => l.innerText || l.textContent || "").join("\n");
      if (code.trim()) return code;
    }
    return "";
  }

  // Auto-Detect Submission "Accepted" Status on LeetCode page
  let lastAcceptedSlug = "";
  const observer = new MutationObserver(() => {
    const slug = getSlug();
    if (!slug) return;

    const acceptedEls = [...document.querySelectorAll('[data-e2e-locator="submission-result"], [class*="success"], [class*="Accepted"], span, div')];
    const isAccepted = acceptedEls.some(el => (el.innerText || "").trim() === "Accepted" && el.clientHeight > 0);

    if (isAccepted && lastAcceptedSlug !== slug) {
      lastAcceptedSlug = slug;
      pushBtn.classList.add("highlight");
      pushBtn.querySelector("span").textContent = "🎉 Push Accepted Solution!";
      showMessage("🎉 <b>Accepted submission detected!</b> Click to push to GitHub.", "ok", 8000);
    }
  });
  observer.observe(document.body || document.documentElement, { childList: true, subtree: true });

  // Main Push Function
  async function handlePush() {
    const slug = getSlug();
    if (!slug) {
      showMessage("❌ Open a LeetCode problem first.", "err");
      return;
    }

    pushBtn.disabled = true;
    pushBtn.querySelector("span").textContent = "⏳ Pushing to GitHub...";
    showMessage("🔍 Fetching problem details and accepted code...", "ok", 0);

    try {
      const info = await getQuestionInfo(slug);
      const accepted = await getAcceptedSubmission(slug);

      let code = accepted?.code || "";
      let language = accepted?.language || "";

      if (!code) {
        code = getCodeFromDOM();
      }

      const payload = {
        type: "LCGH_PUSH_ACCEPTED",
        ...info,
        code,
        language: language || "Java",
        submissionId: accepted?.submissionId || "",
        runtime: accepted?.runtime || "",
        memory: accepted?.memory || ""
      };

      showMessage(`🚀 Pushing <b>LC-${info.number}: ${info.title}</b> to GitHub...`, "ok", 0);

      const response = await chrome.runtime.sendMessage(payload);

      if (!response?.ok) {
        throw new Error(response?.error || "Unknown GitHub Push Error");
      }

      pushBtn.classList.remove("highlight");
      pushBtn.querySelector("span").textContent = "✅ Pushed to GitHub!";
      showMessage(
        `✅ <b>LC-${info.number}</b> successfully pushed!<br><a href="${response.url}" target="_blank">🔗 View in GitHub Repository</a>`,
        "ok",
        15000
      );

      setTimeout(() => {
        pushBtn.querySelector("span").textContent = "🚀 Push to GitHub";
      }, 5000);
    } catch (err) {
      console.error("[LeetCode GitHub Pusher Error]:", err);
      showMessage(`❌ <b>Push Failed:</b> ${err.message || String(err)}`, "err", 10000);
      pushBtn.querySelector("span").textContent = "🚀 Push to GitHub";
    } finally {
      pushBtn.disabled = false;
    }
  }

  pushBtn.addEventListener("click", e => {
    e.preventDefault();
    e.stopPropagation();
    handlePush();
  });
})();
