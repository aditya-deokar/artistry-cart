# Documentation Style Guide

## Purpose

This guide defines how documentation should be added or updated in this repository after the canonical docs system is in place.

## Canonical Structure

Use the numbered folders in `docs/` for durable project documentation:

- `00-overview` through `09-interview-prep` for primary narrative and technical docs
- `11-reference` for stable reference material
- `legacy/`, `brand/`, `ai-vision-api/`, and older standalone docs for historical or supporting context

## Source-Of-Truth Rule

When a topic exists in more than one place:

1. update the numbered canonical doc first
2. preserve older docs only if they add historical or implementation context
3. add links rather than duplicating long explanations across files

## Writing Principles

- ground claims in the current repository, code, config, schema, or workflow
- prefer honest tradeoffs over marketing language
- explain both what exists and what is still weak
- write for both engineers onboarding to the repo and interviewers evaluating system judgment

## Preferred Document Shape

Most technical docs should follow this order:

1. what it is
2. why it exists
3. how it fits into the system
4. key flows
5. dependencies and contracts
6. tradeoffs and limitations
7. risks or next improvements
8. related docs

## Linking Rules

- prefer linking to canonical docs when referencing another topic
- use absolute file links in documentation indexes when the local renderer benefits from them
- use folder entry files or migration notes to redirect readers away from legacy material

## Diagram Rules

- use Mermaid for architecture, request flow, and event flow diagrams where practical
- keep diagrams versionable and close to the docs that explain them

## Legacy Docs Rule

Do not silently repurpose older files into canonical documentation. If an older file still matters:

- keep it as historical context
- add a note pointing to the canonical replacement
- avoid drifting two overlapping docs independently

## Future Additions

Before adding a new file, ask:

- does this belong in an existing numbered section
- is this a durable part of the documentation system or a temporary planning artifact
- can this information strengthen an existing canonical doc instead of creating another isolated note
