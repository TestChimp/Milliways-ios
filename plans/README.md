# Test Planning as Code

In TestChimp, your test plans are managed as markdown files, organized in folders (as opposed to lists of tickets approach of traditional issue trackers).

This unlocks the following key advantages for human + agent hybrid teams:

1. Test plans become reviewable, diffable, and version controlled alongside your code.
2. Test plans become natively accessible to your coding / testing agents to work on.
3. They can be organized in folder hierarchies that fit your products' organization, giving agents structural context for better decisioning.

Fret not—you still get the human friendly workflows such as managing status, due dates, attaching labels, assignees etc.
You can view your stories / scenarios in either list view or a Kanban style as well.

Checkout documentation for more details: https://docs.testchimp.io/test-planning/intro

## Folder Structure

Plans folder is structured like below:
```
  - plans/
    - knowledge/
    - stories/
    - scenarios/
    - events/
```

**`stories/`**
Your user stories go under this folder. Create subfolders as needed for better organization (eg: for core areas, components, subteams).
There are four tabs when you select a story:
  - Form View: This is where you can edit the details / manage lifecycle fields like status etc.
  - Linked Scenarios: You can manage the scenarios linked to this story here. TestChimp AI can assist in brainstorming scenarios / fleshing them out as well.
  - Insights: This tab shows requirement coverage / exploratory bugs—scoped for the selected file / folder.
  - Markdown: This is a read-only version of the story as a Markdown file—which is the version that gets synced to your Git repo.

**`scenarios/`**
Your test scenarios are all under this folder. You can create subfolders as needed. Scenarios can be linked to user stories.
There are three tabs when you select a scenario:
  - Form View: This is where you can edit the details / manage lifecycle fields like status etc.
  - Insights: This tab shows requirement coverage / exploratory bugs - scoped for the selected file / folder.
  - Markdown: This is a read-only version of the scenario as a markdown file - which is the version that gets synced to your Git repo.

**`knowledge/`**
Project knowledge is consolidated under **`plans/knowledge/`**. Upload **docx**, **pdf**, or **md** files as knowledge documents—they sync into your repo under the **`plans/`** tree so coding and testing agents can use them from the codebase. TestChimp indexes this material in an embedding space for on-demand retrieval during test planning and test authoring assistance.

You may also see paths that Claude (upskilled with [TestChimp skills](https://github.com/testchimphq/testchimp-skills)) uses to persist workflow state, for example **`branch_test_plans/`**, **`evolve_plans/`**, and **`ai-test-instructions.md`**—so branch plans, evolve cycles, and project decisions stay versioned next to your plans.

**`events/`**

TrueCoverage event definitions live here (as `.event.md` files). When your application is instrumented with user-event emits, TestChimp collects those emits across **test** and **production** environments, then surfaces coverage and criticality insights that agents and teams use to evolve QA. Claude / Cursor - upskilled with TestChimp, writes the instrumented event definitions in this folder as `.event.md` files. This makes event metadata and definitions stay in-repo, reviewable, and agent-accessible for de-duping and reasoning. Documentation: https://docs.testchimp.io/truecoverage/intro

## Syncing to Git Repo

Connect your Git repository and map a folder in the repo to this **`plans`** tree. When you trigger **Sync to Git Repo**, TestChimp opens a pull request that applies your pending changes across the mapped subtree—including updates under **`stories/`**, **`scenarios/`**, **`knowledge/`**, and **`events/`**—so user stories, scenarios, knowledge documents, and TrueCoverage event specs stay version-controlled alongside your application code.
