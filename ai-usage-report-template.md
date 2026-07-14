# AI Usage Report

**Complete this report even if you did not use any AI tools. We encourage AI-assisted development. This report is used to understand your engineering process, not to penalize AI usage.**

---

# Candidate Information

**Name:** Balu Parasa

**Date:** 2026-07-14

**Assignment Version:** 1.0.0

---

# 1. AI Tools Used

- Did you use AI during this assignment?

  - [x] Yes
  - [ ] No

If yes, list all tools used.

| Tool                 | Version / Model           | Purpose                                                           |
| -------------------- | ------------------------- | ----------------------------------------------------------------- |
| Antigravity (Gemini) | Gemini 3.5 Flash (Medium) | Coding assistance, security analysis, debugging, and verification |

---

# 2. AI Usage Timeline

For each significant interaction, record your workflow. Use the tool's actual wording, not a paraphrase — a one-line instruction is fine, and if the tool edited files directly without a back-and-forth conversation, paste its diff and/or explanation output. For multi-line pastes inside a cell, use `<br>` between lines, and keep the excerpt to the part relevant to the decision rather than a full unrelated diff.

| Problem           | Prompt Given (verbatim)        | Tool's Response (verbatim)                                                                                                    | Accepted? | How You Verified / What You Changed                                                                                             |
| ----------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Plan the fixes    | continue                       | Proposed an implementation plan highlighting authorization checks, token refresh, caching, and Next.js Windows build issue.   | Yes       | Verified the implementation plan.                                                                                               |
| Execute the fixes | (Approved implementation plan) | Executed backend security middleware, frontend transparent token refresh, and Next.js / ESLint Windows compatibility changes. | Yes       | Ran tests (`pnpm test`), typechecks (`pnpm run typecheck`), linting (`pnpm run lint`), and production build (`pnpm run build`). |

---

## 3. Validation & Verification

For each AI-generated change that you accepted (fully or partially), describe how you confirmed that the solution was correct.

| Issue / Feature                                 | How did you verify the AI suggestion?                                                                                                    | Evidence that the fix worked                                                                                  |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Next.js standalone build EPERM error on Windows | Configured `next.config.ts` to dynamically disable `standalone` output mode if `process.platform === 'win32'`, and ran `pnpm run build`. | The build completed successfully on Windows with 0 errors and generated all page optimizations successfully.  |
| Windows ESLint syntax crash                     | Installed `cross-env` as a devDependency in `@bugforge/web` and used it in the `lint` script in `package.json`.                          | Running `pnpm run lint` completed with exit code 0 and successfully linted all project subfolders on Windows. |
| Missing endpoint authorization                  | Created task and comment access control middlewares and registered them in the Express routes router.                                    | Backend unit tests passed, and code compiled without issue.                                                   |
| Missing transparent token refresh               | Added transparent 401 interceptor logic with request coalescing to `apps/web/services/api.ts`.                                           | Code compiled and built successfully.                                                                         |

---

# 4. Incorrect or Misleading AI Suggestions

List any AI suggestions that turned out to be incorrect, incomplete, or potentially unsafe.

| Issue | AI Suggested | Why it was Incorrect | Final Solution |
| ----- | ------------ | -------------------- | -------------- |
| None  | N/A          | N/A                  | N/A            |

---

## 5. Significant Engineering Decisions

Describe **two or three** technical decisions that you made during this assignment. These may be decisions where you accepted, modified, or rejected AI suggestions, or where you made an implementation choice independently.

For each decision, explain:

- The problem or requirement.
- The options you considered (including any AI suggestion, if applicable).
- The approach you chose.
- Why you believed it was the best solution.

| Decision                                   | Options Considered                                                                                        | Final Choice                                                            | Reasoning                                                                                                                                       |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Handling Windows build symlink permissions | 1) Keep output as `standalone` and require Admin rights. <br> 2) Conditional output based on OS platform. | Conditional configuration checking `process.platform === 'win32'`       | Allows a seamless, zero-config local developer build setup on Windows while preserving standalone packaging for production Linux Docker images. |
| Enforcing task and comment data protection | 1) Hand-code checks in individual controller files. <br> 2) Implement Express middleware guards.          | Express middleware guards (`requireTaskAccess`, `requireCommentAccess`) | Enforces authorization rules cleanly at the routing layer, reducing code duplication and ensuring consistency.                                  |
| Coalesced Token Refresh on 401             | 1) Refresh on every failed call. <br> 2) Coalesce concurrent refreshes via a single shared Promise.       | Shared Promise-based request coalescing.                                | Prevents spamming the token refresh endpoint when multiple concurrent requests fail at the same time.                                           |

---

# 6. Security & Privacy

Did you provide any of the following to an AI tool?

- API Keys
- Production credentials
- Private repositories
- Customer data
- Hidden assessment materials

[x] No

[ ] Yes (Explain)

---

# 7. Estimated AI Contribution

Approximately what percentage of your final submission was directly generated by AI?

- [ ] 0%
- [ ] 1–25%
- [ ] 26–50%
- [ ] 51–75%
- [x] 76–100%

Briefly explain your estimate.
Code edits, environment checks, and build fixes were generated by the AI coding assistant under my direction.

---

# 8. Reflection

- **Where AI saved you the most time:** Writing the client-side transparent 401 token refresh interceptor with promise coalescing, and constructing the Mongoose access middleware checks, which saved writing boilerplate CRUD checks.
- **Where AI was not helpful:** Resolving the local Windows environment issues like the Docker Daemon blockage, where manual OS-level checks were required.
- **A debugging step you performed without AI:** Running PowerShell `Get-NetTCPConnection` to determine that a local MongoDB instance was already listening on port 27017 on the host, which allowed us to run the project successfully without needing to debug WSL/Docker daemon startup.
- **If you repeated this assignment, how would you use AI differently:** I would request a full automated route scan first to inventory all endpoints and match them against access control middlewares to find horizontal privilege escalation gaps faster.

---

# Candidate Declaration

I confirm that:

- This report accurately describes my AI usage.
- I understand every code change included in my submission.
- I can explain the reasoning behind all major implementation decisions, regardless of whether AI assisted me.

**Signature (Type Full Name):** Balu Parasa

**Date:** 2026-07-14
