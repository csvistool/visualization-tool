# AGENTS.md — CS 1332 Visualization Tool

> This file is the primary reference for AI coding agents (e.g. Antigravity, Copilot Workspace, Codex) working inside this repository. Read it fully before making any changes.

---

## 1. Project Overview

**CS 1332 Visualization Tool** is an interactive, browser-based visualization platform for every data structure and algorithm taught in Georgia Tech's CS 1332 course. It is publicly hosted at [csvistool.com](https://csvistool.com) via GitHub Pages.

This repository is for adding features and improvements on top of the project with sync to the main upstream repository.

### Tech Stack

| Layer        | Technology                                      |
| ------------ | ----------------------------------------------- |
| UI Framework | React 18 (Create React App)                     |
| Language     | JavaScript ES6+                                 |
| Styling      | MUI (Material UI) v5 + Emotion                  |
| Routing      | React Router DOM v6                             |
| Linting      | ESLint 7 (`eslint-config-react-app`)            |
| Formatting   | Prettier 2                                      |
| Deployment   | GitHub Pages via `gh-pages`                     |
| CI           | GitHub Actions (`.github/workflows/nodejs.yml`) |

### Repository Layout

```
src/
├── algo/           # One file per data structure / algorithm (e.g. LRU.js goes here)
│   └── util/       # Shared utility helpers used across algorithm files
├── anim/           # Core animation engine (AnimationMain.js, etc.)
├── components/     # Reusable React components (controls, panels, etc.)
├── screens/        # Top-level route pages (Homepage, AlgorithmScreen)
├── modals/         # Modal dialog components
├── css/            # Global and component-scoped stylesheets
├── examples/       # Example inputs / preset demos
├── img/            # Static image assets
├── AlgoList.js     # Master registry that maps algorithms to their components
├── App.js          # Root React component and router setup
├── pseudocode.json # Pseudocode strings keyed by algorithm name
└── time_complexities.json  # Time complexity tables keyed by algorithm name
```

---

## 2. Build & Run Commands

> **Node version**: Use Node LTS **16.x** (≤ 16.17.1). Node 17+ uses an OpenSSL version incompatible with `react-scripts`.  
> Use `nvm use 16` or `nvm install 16` if you have nvm installed.

### Install dependencies

```bash
npm install
```

### Start development server (hot reload on `localhost:3000`)

```bash
npm run start
```

### Production build (outputs to `build/`)

```bash
npm run build
```

### Deploy to GitHub Pages

```bash
npm run deploy   # runs "predeploy" (build) then gh-pages -d build
```

### Lint

```bash
npm run lint        # eslint src/.
```

### Format

```bash
npm run prettier    # prettier --write src/.
```

### Run tests

```bash
npm test            # react-scripts test (Jest + React Testing Library, watch mode)
npm test -- --watchAll=false   # single CI-style run, no watch
```

---

## 3. Code Style Guidelines

All source code in `src/` must pass both ESLint and Prettier before a PR is merged. The CI pipeline checks neither automatically at present — it is the contributor's responsibility to run both locally.

### ESLint (`.eslintrc`)

| Rule                          | Setting                                                        |
| ----------------------------- | -------------------------------------------------------------- |
| `no-var`                      | **error** — always use `let` or `const`                        |
| `prefer-const`                | **warn** — prefer `const` over `let` where possible            |
| `sort-imports`                | **error** — imports must be sorted alphabetically              |
| `lines-between-class-members` | **error** — blank line required between class members          |
| `eqeqeq`                      | **warn** (smart) — use `===` except in smart cases             |
| Parser                        | `@babel/eslint-parser` with `@babel/preset-react`, ES6 modules |
| Environment                   | `browser: true`, `es6: true`                                   |

### Prettier (`.prettierrc`)

| Option          | Value                                                  |
| --------------- | ------------------------------------------------------ |
| `tabWidth`      | 4                                                      |
| `useTabs`       | `true` (tabs, not spaces)                              |
| `trailingComma` | `"all"`                                                |
| `printWidth`    | 100                                                    |
| `singleQuote`   | `true`                                                 |
| `arrowParens`   | `"avoid"` (omit parens for single-arg arrow functions) |

### General Conventions

- **ES6+ only**: Use arrow functions, destructuring, template literals, and `class` syntax. `var` is banned.
- **React functional components** are preferred for new UI work; class components exist in `algo/` due to the animation API.
- **Algorithm classes** in `src/algo/` extend the base `Algorithm` class from `Algorithm.js`. Follow the same pattern as existing files (e.g. `LinkedList.js`, `Hash.js`).
- **Import order** is enforced: alphabetical within each group. Run `npm run lint --fix` to auto-fix where possible.
- **No dead code**: Remove unused variables, imports, and commented-out blocks before committing.
- **Descriptive naming**: Class and function names should clearly communicate intent (e.g. `animateInsert`, `resetAll`, `buildLRUCache`).

---

## 4. Adding a New Algorithm / Data Structure

This is the critical workflow for any agent implementing the LRU simulation or another new visualization.

1. **Create `src/algo/YourAlgo.js`** — extend `Algorithm` and implement all required animation methods. Study `src/algo/LinkedList.js` or `src/algo/Hash.js` as close references.
2. **Register in `src/AlgoList.js`** — add an entry to the master registry object with the correct `display` name, `component`, `category`, and optional `tags`.
3. **Add pseudocode** to `src/pseudocode.json` under the matching key.
4. **Add time complexities** to `src/time_complexities.json` under the matching key.
5. **Verify the animation API**: All animation primitives (`cmd`, `step`, `clearAll`, etc.) live in `src/anim/AnimationMain.js`. The upstream documentation at [cs.usfca.edu/~galles/visualization/source.html](https://www.cs.usfca.edu/~galles/visualization/source.html) is a useful reference, but always cross-check against the local ES6 version.

---

## 5. Testing Instructions

The project uses **Jest** and **React Testing Library** (bundled by `react-scripts`).

### Running tests

```bash
# Interactive watch mode (default)
npm test

# Single run — suitable for CI / agent verification
npm test -- --watchAll=false

# Run a specific test file
npm test -- --watchAll=false --testPathPattern=LRU
```

### What to test

Since the core animation engine is difficult to unit-test in isolation, focus tests on:

- **Pure logic functions**: Any helper in `src/algo/util/` or standalone computation functions (e.g. LRU eviction logic, hash functions).
- **React component rendering**: Use `@testing-library/react` to assert that components mount without errors and key UI elements are present.
- **Edge cases**: Empty structures, single-element structures, maximum capacity boundaries.

### Before submitting a PR

Run all verification checks and ensure **zero errors**:

```bash
npm run lint
npm run prettier
npm test -- --watchAll=false
```

Prettier is run in **write** mode, so it will reformat files in place. Commit the formatted files.

- **PR Template**: Adhere to and complete the [Pull Request Template](.github/pull_request_template.md) when opening a PR, filling in the description, change type, demo recording, and checklist.
- **Demo Video / Recording**: For any changes involving visual elements, UI components, or animations (such as a new data structure visualizer), include a short screen recording or demo video in the PR description demonstrating functionality.
- **Clean Diff**: Do **not** commit changes to `package-lock.json`, `node_modules/`, or any file unrelated to your PR. Agents should stage only intentional changes (`git add -p` is recommended).

---

## 6. Security Considerations

This is a **client-side only, statically hosted** web application. There is no server, database, or user authentication. The attack surface is correspondingly small, but the following points must be observed:

### Secrets Management

- The GitHub Actions deployment workflow uses a **repository secret** (`VISTOOL_GITHUB_TOKEN`) to push to the `gh-pages` branch. This secret is injected at runtime by GitHub Actions and must **never** be hardcoded in source files, `.env` files, or comments.
- Do not add new secrets to workflow files without using the `${{ secrets.SECRET_NAME }}` syntax.

### Dependency Security

- Run `npm audit` before adding new dependencies. Avoid packages with known high-severity vulnerabilities.
- Pin major versions in `package.json` (`"react": "^18.2.0"` is acceptable; unconstrained `"*"` is not).
- Do not add dependencies that are unnecessary or that replicate functionality already provided by React, MUI, or the standard library.

### User-Supplied Input

- All algorithm inputs (sizes, values, keys) are taken from text fields and processed entirely in-browser. Validate and sanitize inputs (e.g. clamp to acceptable numeric ranges, reject non-numeric input) before passing them to animation logic.
- Never use `eval()`, `new Function()`, or `dangerouslySetInnerHTML` with user-supplied strings.

### Cross-Site Scripting (XSS)

- React's JSX escapes string values by default. Do not bypass this with `dangerouslySetInnerHTML`.
- Canvas/SVG rendering in the animation engine does not process HTML, so XSS through the visualization canvas is not a concern.

### Third-Party Analytics

- The project uses `react-ga4` (Google Analytics 4). No PII is collected or transmitted. Do not add additional telemetry or tracking libraries.

### Content Security Policy

- The site is served by GitHub Pages with default headers. There is no custom CSP in this repository. Avoid inline `<script>` tags or dynamic `eval`-based patterns that would conflict with a future CSP.

---

## 7. CI / CD

The GitHub Actions workflow (`.github/workflows/nodejs.yml`) triggers on every push to `master` and:

1. Checks out the repository.
2. Runs `npm ci` (clean install).
3. Runs `npm run deploy` (build + gh-pages publish).

**Agents must not modify the workflow file** unless explicitly instructed to do so. Deployments happen automatically; do not manually push to the `gh-pages` branch.

---

## 8. Quick Reference

| Task           | Command                        |
| -------------- | ------------------------------ |
| Install        | `npm install`                  |
| Dev server     | `npm run start`                |
| Build          | `npm run build`                |
| Lint           | `npm run lint`                 |
| Format         | `npm run prettier`             |
| Test (CI mode) | `npm test -- --watchAll=false` |
| Deploy         | `npm run deploy`               |

**Live site**: https://csvistool.com  
**Upstream repo**: https://github.com/csvistool/visualization-tool  
**License**: FreeBSD (2-Clause BSD) — see [LICENSE.md](LICENSE.md)
