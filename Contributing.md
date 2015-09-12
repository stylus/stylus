# Workflow.md

This document describes the workflow we use for Stylus releases, the naming of the branches and the meaning behind them.

## Branches

### Permanent branches

The following branches should always be there. Do not fork them directly, always create a new branch for your Pull Requests.

- `master`. The code in this branch should always be equal to the latest version that was published in npm.

- `dev`. This is a branch for coldfixes — both code and documentation. When you're fixing something, it would make sense to send a PR to this branch and not to the `master` — this would make our job a bit easier.

    The code in this branch should always be backwards compatible with `master` — it should only introduce fixes, changes to documentation and other similar things like those, so at every given moment we could create a patch release from it.

- `gh-pages`. This is a branch for running Stylus' site. It shouldn't contain any actual docs, instead we would add `dev` branch to it as a submodule. This would mean the docs are always up to date with the current published release and storing the docs with the code would mean it would be easy to write the docs alongside the code.

- `client`. This branch is a clent-side fork of Stylus that is used for interactive examples on our site. The client version shouldn't be used to serve CSS in production. The branch is updated manually with new release at the moment, in future we could think on automatizing this.

### Temporarily branches

- `issue-NNN`. If you're working on a fix for an issue, you can use this naming. This would make it easy to understand which issue is affected by your code. You can optionally include a postfix with a short description of the problem, for example `issue-1289-broken-mqs`.

- `feature-…`. Any new feature should be initially be a feature-branch. Such branches won't be merged into `master` or `dev` branches directly. The naming would work basically the same as the `issue-…`, but you can omit the issue's number as there couldn't be one issue covering the feature, or you're working on some refactoring.

- `rc-…`. Any new feature release should be at first compiled into a release candidate branch. For example, `rc-0.43` would be a branch for a coming `0.43.0` release. We would merge feature branches and Pull Requests that add new features to the rc-branch, then we test all the changes together, writing tests and docs for those new features and when everything is ready, we increase the version number in `package.json`, then merge the rc-branch into `dev` and `master`.

## Releasing workflow

We follow [semver](http://semver.org/). We're in `0.x` at the moment, however, as Stylus is already widely used, we don't introduce backwards-incompatible changes to our minor releases.

Each minor release should be first compiled into `rc-`branch. Minor release *should not* have fixes in it, as patch-release should be published before a minor one if there are fixes. This would deliver the fixes to the people using the fixed minor, but `x` at patch version.

Patch releases don't need their own `rc` branches, as they could be released from the `dev` branch. 
