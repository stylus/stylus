# Stylus Contributing Guide

Thank you for your interest in contributing to Stylus. Please be sure to review the following guidelines:

## Issue Reporting Guidelines

In case you encounter any issues, be sure to submit them on the **Issues** tab, with the following information:
- How to reproduce the issue
- Current Behavior (i.e. what's the bug)
- Expected Behavior (i.e. how it should function)
- Environment Information (for example, stylus and nodejs versions)
- Any additional information

See the full issue template [here](./ISSUE_TEMPLATE/bug.md)

## Pull Request Guidelines

- The `dev` branch is a snapshot of the latest release of the project. 
- All development work should be done in their own branches.
- Make sure `npm test` passes before starting a pull request.
- Make sure to submit the following information in your pull request:
   - What:
   - Why:
   - How:
   - Checklist (i.e. Documentation changes, Unit Tests, and Code complete)
- If adding a new feature 🔧, add [feature] in tag of request:
  - Make sure a **suggestion** issue is created first, and have it approved before making any pull requests.
  - Add any accompanying test cases
  - Provide reason for adding this feature, including link to approval.

- If fixing bug 🐛, add [bug] in tag of request:
  - If you are resolving a special issue, add `(fix #)` in your request title, where # is the issue ID.
  - Provide a detailed description of the bug in the pull request (_see issue reporting guideline above for necessary information_)
  - Add any accompanying test cases

## Development Setup

Make sure to clone the project repo, then run:

``` bash
$ npm install stylus -g 
```
## Communication

Most of the communication will be located primarily within the Issues discussion. For any active discussion, please check out the [CSS Discord Server](https://github.com/stylus/stylus/issues/2414#:~:text=https%3A//discord.gg/pFc6XmH).
