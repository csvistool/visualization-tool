# Contributing

Hi there! This document outlines some rules for contributing to the site.

## What to fix

There is a lot that still needs to be improved, ranging from implementing more data structures and algorithms, making slight modifications to existing ones, bug fixing, updating the UI and making general improvements. Whatever your interest in web development is, you can probably improve your skills by contributing in that regard!

For more details on what needs to be done, check out the [Issues tab](https://github.com/csvistool/visualization-tool/issues).

## Structure

The site was created using [create-react-app](https://github.com/facebook/create-react-app) application. It also uses [Single Page Apps for GitHub Pages](https://github.com/rafrex/spa-github-pages) for compatibility with GitHub Pages.

[`src/algo/`](https://github.com/csvistool/visualization-tool/tree/master/src/algo) contains data structure/algorithm-specific scripts

[`src/anim/`](https://github.com/csvistool/visualization-tool/tree/master/src/anim) contains the base animation API

[`src/screens/`](https://github.com/csvistool/visualization-tool/tree/master/src/screens) contains the top-level screens (the homepage, the algorithm screen)

## Animation API

The animation API is very well documented [here](https://www.cs.usfca.edu/~galles/visualization/source.html). However, some changes have been made to it as part of the conversion to ES6, so existing JavaScript files are also a good reference for learning how to do things. All functions can be found in [`AnimationMain.js`](https://github.com/csvistool/visualization-tool/blob/master/src/anim/AnimationMain.js).

## Dev Environment Setup

This repository requires `node`/`npm` installed. We recommend using the LTS version of Node (16.17.1) or earlier, as version 17+ uses an incompatible version of openSSL.

We recommend [VSCode](https://code.visualstudio.com/) with extensions for [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) installed. We also recommend turning on "format on save" (`editor.formatOnSave`) to handle automatic prettier formatting.

## Getting Started

This repository requires `node`/`npm`

1. Fork the repository
2. Clone the fork of the repository
3. `cd` into the project directory
4. `npm install` to install necessary dependencies + necessary hooks
5. `npm run start` to start local version of the app
6. The site should be locally accessible from `localhost:3000`

## Testing

We use Jest and React Testing Library for testing. All unit tests live in adjacent `__tests__/` directories throughout `src/`.

To run the test suite:

```bash
# Run tests in interactive watch mode
npm test

# Run all tests once (CI mode)
npm test -- --watchAll=false

# Run a specific test suite
npm test -- --watchAll=false --testPathPattern=YourAlgo
```

### Testing Expectations
- **New Visualizations / Features**: Whenever you add a new algorithm, data structure helper, or UI component, include unit tests covering component mounting, control setups, edge cases, and helper logic.
- **Bug Fixes**: Include a regression test demonstrating that the bug is resolved.
- **Passing Suite**: Ensure all existing and new tests pass with zero failures before opening a pull request.
- **Demo Video**: When we update the visualization and it impacts the user experience, add a demo video in the PR description.

## Submitting a PR

Before opening a pull request, run through the following checklist:

### Pre-Submission Checklist
- [ ] **Formatting**: Code formatted with Prettier (`npm run prettier`).
- [ ] **Linting**: Code passes ESLint with zero errors (`npm run lint`).
- [ ] **Tests**: All tests pass (`npm test -- --watchAll=false`).
- [ ] **Unit Tests Added**: New features and bug fixes include relevant tests in `__tests__/`.
- [ ] **Demo Video / Recording**: For any changes involving visual elements, animations, or UI components (e.g. new algorithm visualizers), include a short screen recording (video or GIF) in the PR description demonstrating the behavior.
- [ ] **Clean Diff**: Ensure no unrelated files are committed (e.g., `package-lock.json`, `node_modules/`, scratch files).

### How to Make a PR:

1. Create a new pull request.
2. Click “Compare across forks”.
3. Base repo should be `csvistool/master` and head repo should be the relevant branch on your fork.
4. Name the PR something simple and descriptive.
5. In the description, **follow the [Pull Request Template](.github/pull_request_template.md)**:
   - Provide a concise summary and reference the issue you worked on (e.g., “closes #155”, “addresses #150”, etc.).
   - Select the appropriate type of change.
   - Attach your demo video / recording if your PR touches the UI or animations (or note N/A).
   - Complete and verify all items in the pre-merge checklist.
6. Verify that the CI check passes! If there are any failures, fix those and update the PR.
7. To pull the latest changes from the base repo, run `git pull upstream master` to reflect the updates into your fork.

---

> **Tip for AI Coding Assistants**: If you are using an AI agent (e.g., Antigravity, Copilot, Cursor, Codex), refer to [`AGENTS.md`](./AGENTS.md) for automated workflows, code conventions, and repository constraints. Feel free to modify the `AGENTS.md` as well to suit your needs and/or contribute updates to increase velocity for the team.