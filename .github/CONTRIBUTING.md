# Stylus Contributing Guide

Thank you for your interest in contributing to Stylus. Please be sure to review the following guidelines:

## Issue Reporting Guidelines

Before submitting an issue on GitHub, try searching for the issue. Use the search bar to search through already created issues that may be related to your problem.
- If an issue exists, subscribe to the issue to get updates. Be sure to read over the existing discussions, you may be able to contribute to the issue that can help the team address it.
- Otherwise, see the template below on how to add an issue.

### Tips

We encourage contributors to write meaningful issue posts that will help us figure out a solution.
- Write a meaningful title that summarizes the issue:
> Rendering of '#' Characters In Inline SVG Data Started to Cause A Chrome Deprecation Warning
- Take a screenshot of the issue and include it in your post.
- Make sure to add any relevant code (check out [GitHub's Formatting Guide](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#links))

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
## Frequently Asked Questions

### What do I need to know to contribute to the codebase?

Stylus runs on JavaScript and CSS. If you're interested in contributing to the codebase, you will need to be familiar with JavaScript, and some technologies like NPM.

### How can I report a new bug?

If you've encountered a bug, do the following steps first to resolve the problem:
1. **Ask for help in the Discussion forum**. 
2. **Search for your issue on GitHub**. If you've seen your issue being discussed in the discussion section, chances are that it may have a post on the issue section. If an existing post exists, be sure to thumbs up the author's post in the issue thread.
3. **Create a New Issue**: After doing the above and not encountering any previously mentioned issues, then create a new issue. See the full issue template [here](./ISSUE_TEMPLATE/bug.md)

### Where do I start if I want to work on an issue?

Head over to the Issues section and go through any _help wanted_ issues for a quick list of all issues that are available to be worked on. These issues are available to anyone and do not require permission.

### I need help and can't find the answer in the documentation

We encourage everyone to ask for help by submitting a post on our Discussions section. 

## Communication

Most of the communication will be located primarily within the Issues discussion. For any active discussion, please check out the [CSS Discord Server](https://github.com/stylus/stylus/issues/2414#:~:text=https%3A//discord.gg/pFc6XmH).
