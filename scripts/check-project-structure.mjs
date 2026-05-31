import { access, readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();

const allowedTopLevelEntries = new Set([
  ".env.example",
  ".git",
  ".gitignore",
  ".vercelignore",
  "README.md",
  "api",
  "assets",
  "dist",
  "docs",
  "index.html",
  "node_modules",
  "package-lock.json",
  "package.json",
  "public",
  "scripts",
  "skills",
  "src",
  "supabase",
  "vercel.json",
]);

const allowedDocFiles = new Set([
  "kastave-landing-assets-requirements.md",
  "kastave-v2-acceptance-checklist.md",
  "kastave-v2-media-scripts.md",
  "转化追踪.md",
  "运行与部署.md",
  "项目结构.md",
]);

const allowedSkillDirs = new Set(["american-bass-angler-copy", "github-upload"]);
const forbiddenDirs = ["docs/progress", "docs/superpowers", ".github/workflows"];

await verifyTopLevelEntries();
await verifyDocsDirectory();
await verifySkillsDirectory();
await verifyForbiddenDirsAbsent();

console.log("Project structure verified.");

async function verifyTopLevelEntries() {
  const entries = await readdir(root);
  const unexpected = entries.filter((entry) => !isAllowedTopLevelEntry(entry));

  if (unexpected.length > 0) {
    throw new Error(`Unexpected top-level project entries:\n${unexpected.sort().join("\n")}`);
  }
}

function isAllowedTopLevelEntry(entry) {
  return allowedTopLevelEntries.has(entry) || /^\.env\.[a-z0-9.-]+$/i.test(entry);
}

async function verifyDocsDirectory() {
  const entries = await readdir(join(root, "docs"), { withFileTypes: true });
  const unexpected = entries
    .filter((entry) => !(entry.isFile() && allowedDocFiles.has(entry.name)))
    .map((entry) => `docs/${entry.name}`);

  if (unexpected.length > 0) {
    throw new Error(`Unexpected docs entries. Keep docs focused on the current V2 site:\n${unexpected.sort().join("\n")}`);
  }
}

async function verifySkillsDirectory() {
  const entries = await readdir(join(root, "skills"), { withFileTypes: true });
  const unexpected = entries
    .filter((entry) => !(entry.isDirectory() && allowedSkillDirs.has(entry.name)))
    .map((entry) => `skills/${entry.name}`);

  if (unexpected.length > 0) {
    throw new Error(`Unexpected skills entries:\n${unexpected.sort().join("\n")}`);
  }

  await verifyProjectSkill("github-upload", [
    "SKILL.md",
    "agents/openai.yaml",
    "references/github-upload-playbook.md",
  ]);

  const githubUploadSkill = await readFile(join(root, "skills/github-upload/SKILL.md"), "utf8");
  const githubUploadPlaybook = await readFile(
    join(root, "skills/github-upload/references/github-upload-playbook.md"),
    "utf8",
  );

  if (!/^name:\s*GitHub 上传/m.test(githubUploadSkill)) {
    throw new Error("skills/github-upload/SKILL.md must keep the requested skill name: GitHub 上传.");
  }

  if (!githubUploadSkill.includes("Homepage `Sign up` or `Reserve for $1` routes to `/deposit`")) {
    throw new Error("skills/github-upload/SKILL.md must document the current Kastave V2 /deposit flow.");
  }

  if (!githubUploadPlaybook.includes("当前 Kastave V2 上传规则")) {
    throw new Error("skills/github-upload/references/github-upload-playbook.md must include current V2 upload rules.");
  }
}

async function verifyProjectSkill(skillDir, requiredFiles) {
  const missing = [];

  for (const file of requiredFiles) {
    if (!(await exists(join(root, "skills", skillDir, file)))) {
      missing.push(`skills/${skillDir}/${file}`);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Project skill ${skillDir} is missing required file(s):\n${missing.join("\n")}`);
  }
}

async function verifyForbiddenDirsAbsent() {
  const present = [];

  for (const dir of forbiddenDirs) {
    if (await exists(join(root, dir))) {
      present.push(dir);
    }
  }

  if (present.length > 0) {
    throw new Error(`Historical or unsupported directories still exist:\n${present.join("\n")}`);
  }
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
