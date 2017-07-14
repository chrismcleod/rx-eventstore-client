# CONTRIBUTING

## Branch Organization

We will do our best to keep master in good shape, with tests passing at all times. But in order to move fast, we will make API changes that your application might not be compatible with. We will do our best to communicate these changes and version appropriately so you can lock into a specific version if need be.

## Bugs

Where to Find Known Issues

We are using GitHub Issues for our public bugs. Before filing a new task, try to make sure your problem doesn't already exist.

Questions and feature requests will be tracked here for now:

Have a question? Use the Question label.
Have a feature request? Use the Feature Request label.

Reporting New Issues

The best way to get a bug fixed is to provide a reduced test case. Please provide a public repository with a runnable example.

Please report a single bug per issue. Always provide reproduction steps. If the bug cannot be reproduced, verify that the issue can be reproduced locally by targeting the latest release. Ideally, check if the issue is present in master as well.

Do not forget to include sample code that reproduces the issue. Only open issues for bugs affecting either the latest stable release, or the current release candidate, or master. If it is not clear from your report that the issue can be reproduced in one of these releases, your issue will be closed.

We're not able to provide support through GitHub Issues. If you're looking for help with your code, consider asking on Stack Overflow.

## Proposing a Change

If you intend to change the public API, or make any non-trivial changes to the implementation, we recommend filing an issue. This lets us reach an agreement on your proposal before you put significant effort into it.

If you're only fixing a bug, it's fine to submit a pull request right away but we still recommend to file an issue detailing what you're fixing. This is helpful in case we don't accept that specific fix but want to keep track of the issue.

## Pull Requests

If you send a pull request, please do it against the master branch. We maintain stable branches for stable releases separately but we don't accept pull requests to them directly. Instead, we cherry-pick non-breaking changes from master to the latest stable version.

We will be monitoring for pull requests. For API changes we may need to fix internal uses, which could cause some delay. We'll do our best to provide updates and feedback throughout the process.

Small pull requests are much easier to review and more likely to get merged. Make sure the PR does only one thing, otherwise please split it.

Before submitting a pull request, please make sure the following is done…

1. Fork the repo and create your branch from master.
1. Describe your test plan in your commit.
1. Make sure your code lints using the tslint rules provided.
1. Squash your commits (git rebase -i). One intent alongside one commit makes it clearer for people to review and easier to understand your intention.
Note: It is not necessary to keep clicking Merge master to your branch on the PR page. You would want to merge master if there are conflicts or tests are failing.

### Test plan

A good test plan has the exact commands you ran and their output.

If you've added code that should be tested, add tests!
If you've changed APIs, update the documentation.
See "What is a Test Plan?" to learn more: https://medium.com/@martinkonicek/what-is-a-test-plan-8bfc840ec171#.y9lcuqqi9

## License

By contributing to rx-eventstore-client, you agree that your contributions will be licensed under its MIT license.
