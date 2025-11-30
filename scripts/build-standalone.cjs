#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const readmePath = path.join(__dirname, "../README.md");
const packageJsonPath = path.join(__dirname, "../package.json");
const docsDir = path.join(__dirname, "../docs");

const readme = fs.readFileSync(readmePath, "utf8");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const version = packageJson.version;

// Prefer the docs screenshot; fall back to the root one
const screenshotPathDocs = path.join(docsDir, "screenshot.png");
const screenshotPathRoot = path.join(__dirname, "../screenshot.png");
const screenshotSrc = fs.existsSync(screenshotPathDocs)
  ? "./screenshot.png"
  : fs.existsSync(screenshotPathRoot)
    ? "../screenshot.png"
    : null;

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Very small markdown-to-HTML helper (headings, lists, code fences, paragraphs)
function mdToHtml(markdown) {
  const lines = markdown.split("\n");
  let html = "";
  let inList = false;
  let inCode = false;

  const formatInline = (text) => {
    const segments = text.split("`");
    return segments
      .map((seg, i) => {
        const escaped = escapeHtml(seg).replace(/\*([^*]+)\*/g, "<em>$1</em>");
        if (i % 2 === 1) {
          return `<code>${escaped}</code>`;
        }
        return escaped;
      })
      .join("");
  };

  for (let rawLine of lines) {
    const line = rawLine;

    if (line.trim().startsWith("```")) {
      if (!inCode) {
        html += "<pre><code>";
        inCode = true;
      } else {
        html += "</code></pre>";
        inCode = false;
      }
      continue;
    }

    if (inCode) {
      html += escapeHtml(line) + "\n";
      continue;
    }

    if (/^###\s+/.test(line)) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += `<h3>${escapeHtml(line.replace(/^###\s+/, ""))}</h3>`;
      continue;
    }

    if (/^##\s+/.test(line)) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += `<h2>${escapeHtml(line.replace(/^##\s+/, ""))}</h2>`;
      continue;
    }

    if (/^#\s+/.test(line)) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += `<h1>${escapeHtml(line.replace(/^#\s+/, ""))}</h1>`;
      continue;
    }

    if (/^\s*-\s+/.test(line)) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${formatInline(line.replace(/^\s*-\s+/, ""))}</li>`;
      continue;
    }

    if (line.trim() === "") {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      continue;
    }

    // Paragraph
    html += `<p>${formatInline(line)}</p>`;
  }

  if (inList) html += "</ul>";
  if (inCode) html += "</code></pre>";
  return html;
}

const titleMatch = readme.match(/^#\s+(.+)$/m);
const title = titleMatch ? titleMatch[1].trim() : "Visual Countdown Timer";

// Grab the description under the title until the first heading or image
const afterTitle = readme.split("\n").slice(1).join("\n");
const descriptionBlock = afterTitle.split("\n## ")[0].split("![")[0].trim();
const descriptionHtml = mdToHtml(descriptionBlock);

function extractSection(name) {
  const regex = new RegExp(`##\\s+${name}\\s*\\n([\\s\\S]*?)(\\n##\\s+|$)`);
  const match = readme.match(regex);
  return match ? mdToHtml(match[1].trim()) : "";
}

const gatekeeperHtml = extractSection("macOS Gatekeeper note");
const devHtml = extractSection("Development");

const downloadUrl = `https://github.com/minthemiddle/visual-countdown/releases/download/v${version}`;
const downloadIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true"><path d="M240,136v64a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V136a16,16,0,0,1,16-16H72a8,8,0,0,1,0,16H32v64H224V136H184a8,8,0,0,1,0-16h40A16,16,0,0,1,240,136Zm-117.66-2.34a8,8,0,0,0,11.32,0l48-48a8,8,0,0,0-11.32-11.32L136,108.69V24a8,8,0,0,0-16,0v84.69L85.66,74.34A8,8,0,0,0,74.34,85.66ZM200,168a12,12,0,1,0-12,12A12,12,0,0,0,200,168Z"></path></svg>`;
const starIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true"><path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Zm-15.34,5.47-48.7,42a8,8,0,0,0-2.56,7.91l14.88,62.8a.37.37,0,0,1-.17.48c-.18.14-.23.11-.38,0l-54.72-33.65a8,8,0,0,0-8.38,0L69.09,215.94c-.15.09-.19.12-.38,0a.37.37,0,0,1-.17-.48l14.88-62.8a8,8,0,0,0-2.56-7.91l-48.7-42c-.12-.1-.23-.19-.13-.5s.18-.27.33-.29l63.92-5.16A8,8,0,0,0,103,91.86l24.62-59.61c.08-.17.11-.25.35-.25s.27.08.35.25L153,91.86a8,8,0,0,0,6.75,4.92l63.92,5.16c.15,0,.24,0,.33.29S224,102.63,223.84,102.73Z"></path></svg>`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="A distraction-free 60-minute visual timer. Click any tick to start a countdown; a red wedge shrinks as time passes, and each minute flashes its tick. Hide labels, resize fast, and run natively with Tauri.">
    <title>${escapeHtml(title)}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.7;
            color: #1f1f1f;
            min-height: 100vh;
            padding: 32px 16px 48px;
        }

        main {
            max-width: 960px;
            margin: 0 auto;
        }

        h1, h2, h3 {
            color: #1a1a1a;
            letter-spacing: -0.01em;
        }

        h1 { font-size: 42px; font-weight: 700; margin-bottom: 12px; }
        h2 { font-size: 24px; font-weight: 700; margin: 24px 0 12px; }
        h3 { font-size: 18px; font-weight: 600; margin: 16px 0 8px; }

        p { margin: 0 0 12px; }

        .hero {
            background: transparent;
            border: none;
            border-radius: 0;
            padding: 0 0 8px 0;
            display: grid;
            grid-template-columns: 1fr 320px;
            gap: 24px;
            align-items: center;
        }

        .hero-left {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .eyebrow {
            display: inline-block;
            padding: 6px 12px;
            background: #f0f0f0;
            color: #3a3a3a;
            font-weight: 600;
            border-radius: 999px;
            font-size: 14px;
            border: 1px solid #d0d0d0;
        }

        .tagline {
            font-size: 18px;
            color: #333333;
        }

        .cta-row {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
            margin-top: 8px;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.15s ease;
        }

        .btn svg {
            width: 18px;
            height: 18px;
        }

        .btn-primary {
            background: #e0e0e0;
            color: #1a1a1a;
            border: 1px solid #c8c8c8;
        }

        .btn-primary:hover {
            background: #d2d2d2;
        }

        .btn-ghost {
            background: #f5f5f5;
            color: #1f1f1f;
            border: 1px solid #d0d0d0;
        }

        .btn-ghost:hover {
            background: #e8e8e8;
        }

        .section {
            margin-top: 32px;
        }

        ul {
            padding-left: 18px;
            margin: 0 0 12px;
        }

        code, pre {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            font-size: 14px;
            background: #ededed;
            border: 1px solid #d0d0d0;
            border-radius: 10px;
        }

        code {
            padding: 3px 6px;
            border-radius: 999px;
        }

        pre {
            padding: 14px 16px;
            overflow-x: auto;
            margin: 14px 0;
            border-radius: 12px;
        }

        a {
            color: #1f1f1f;
            text-decoration: none;
            transition: color 0.15s ease;
        }

        a:hover {
            color: #000000;
        }

        .section {
            margin-top: 32px;
        }

        @media (max-width: 900px) {
            .hero {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <main>
        <section class="hero">
            <div class="hero-left">
                <span class="eyebrow">Open source • v${version}</span>
                <h1>${escapeHtml(title)}</h1>
                <div class="tagline">${descriptionHtml}</div>
                <div class="cta-row">
                    <a class="btn btn-primary" href="${downloadUrl}">
                        ${downloadIcon}
                        <span>Download (macOS, Windows, Linux)</span>
                    </a>
                    <a class="btn btn-ghost" href="https://github.com/minthemiddle/visual-countdown">
                        ${starIcon}
                        <span>Star on GitHub</span>
                    </a>
                </div>
            </div>
            ${
              screenshotSrc
                ? `
            <div class="hero-image">
                <img src="${screenshotSrc}" alt="Visual Countdown Timer screenshot" style="width: 100%;">
            </div>
            `
                : ""
            }
        </section>

        <section class="section">
            <h2>How it works</h2>
            <p>Click any tick to start a countdown from that minute mark. A red wedge shrinks as time passes, and each minute boundary briefly flashes its tick. Hide labels to give the dial more room, or hit a preset to resize the window fast.</p>
        </section>

        ${
          gatekeeperHtml
            ? `
        <section class="section">
            <h2>macOS Gatekeeper</h2>
            ${gatekeeperHtml}
        </section>
        `
            : ""
        }

        ${
          devHtml
            ? `
        <section class="section">
            <h2>Development</h2>
            ${devHtml}
        </section>
        `
            : ""
        }
    </main>
</body>
</html>`;

// Write the HTML file
const outputPath = path.join(__dirname, "../docs/index.html");
fs.writeFileSync(outputPath, html, "utf8");

console.log("✅ Docs HTML created successfully!");
console.log(`📄 Saved to: ${outputPath}`);
console.log(`🌐 Ready for GitHub Pages!`);
console.log(
  `🔗 Update download links to point to GitHub releases when you publish!`,
);
