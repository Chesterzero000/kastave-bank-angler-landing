---
name: GitHub 上传
description: 上传本地代码到 GitHub，并在普通 git push 失败时处理认证、connector 上传、远端热修复和线上验证问题。适用于用户要求上传、发布、同步最新代码、只保留最新版本、修复线上站点、总结 GitHub 上传问题与解决方案等场景。
---

# GitHub 上传

## Quick Workflow

1. Orient before changing anything:

```bash
pwd
git status --short --branch
git remote -v
git log --oneline --decorate --max-count=8
git diff --stat
```

2. Identify the upload target: repository full name, branch, deployment path, and whether the user needs a full upload or a small live hotfix.
3. Validate locally when possible. Run the repo's existing tests/build commands; if tooling is missing, say exactly what was missing and continue with the safest available route.
4. Try normal non-destructive Git first:

```bash
git push origin <branch>
```

5. If push fails, diagnose the error and switch route instead of getting stuck:
   - `fatal: could not read Username for 'https://github.com': Device not configured`: HTTPS credentials are unavailable.
   - `Permission denied (publickey)`: SSH key is missing or not authorized.
   - `gh`, `vercel`, `npm`, or `npx` missing: do not assume those CLIs can be used.
6. Use the GitHub connector when available. Search for the needed tools with `tool_search`, then prefer connector writes over asking the user to configure credentials during an urgent fix.
7. Verify the remote commit and the live site. For web changes, check both GitHub commit content and the deployed URL. For Kastave, prefer `node scripts/check-release-state.mjs` after deployment.

## Kastave V2 Rule

For the current Kastave landing page, the canonical reservation flow is:

1. Homepage `Sign up` or `Reserve for $1` routes to `/deposit`.
2. `/deposit` explains the `$1` reservation and `$100` launch credit.
3. `/deposit` lets the visitor choose Stripe credit card or PayPal.

Do not reintroduce the historical emergency behavior where the homepage button jumps directly to PayPal or Stripe. If a remote hotfix from history contains direct PayPal logic, treat it as a past workaround, not the current target state.

Before uploading this project as a full sync, run `node scripts/preflight.mjs` when possible. Before production deployment, use `node scripts/deploy-ready.mjs` only after real Vercel production environment variables are configured. After push and Vercel deployment, run `node scripts/check-release-state.mjs` to verify that local `HEAD`, `origin/main`, and the live `https://kastave.com` assets are aligned.

## Connector Strategy

Use the smallest connector operation that safely represents the intended change.

For a one-file or urgent live hotfix:

1. Fetch the current remote file with `_fetch_file`.
2. Edit the complete file content locally or in memory.
3. Update it with `_update_file`, passing the exact remote `sha`.
4. Fetch the resulting commit with `_fetch_commit`.

For a multi-file upload:

1. Confirm the local branch is based on the current remote parent.
2. Create blobs for every changed file with `_create_blob`.
3. Create a tree with `_create_tree` using the remote base tree.
4. Create a commit with `_create_commit`.
5. Move the branch with `_update_ref` only if it is a fast-forward. Avoid `force: true` unless the user explicitly asks.

Do not update only one local file when the local feature depends on other changed files. In that case either upload the full coherent set, or make a deliberately isolated hotfix that does not depend on the rest of the local work.

## Live Hotfix Pattern

When the live site has a conversion-breaking issue and full push is blocked:

1. Locate the minimal file that can patch behavior safely.
2. Prefer an entry-point or wrapper fix only when it is independent of bundled React/Vite code.
3. Preserve tracking and attribution if the fix changes checkout behavior.
4. Commit through GitHub connector with a clear message such as `Route reserve button to deposit checkout`.
5. Check the deployed HTML/asset:

```bash
curl -L --max-time 20 -s https://example.com | rg "expected-string|commit-marker|payment-link"
```

6. If interaction matters, verify with browser automation or Chrome, but do not complete real payments or irreversible actions.

## After Upload

Record what changed, the commit SHA, validation results, and any remaining mismatch between local and remote.

If connector writes directly to GitHub, the local `origin/<branch>` may be stale and the working tree may still show related local edits. Later, when credentials are available, reconcile with a non-destructive fetch/rebase/merge. Do not use `git reset --hard` or discard user work unless explicitly requested.

For detailed checklists and the Kastave case notes, read [references/github-upload-playbook.md](references/github-upload-playbook.md).
