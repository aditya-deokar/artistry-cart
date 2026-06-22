# ADRs, Documentation, Communication, And Influence

## Architecture Is Social

Architecture is not only technical.

It shapes how people work:

- who owns what
- how reviews happen
- how incidents are handled
- how new engineers learn the system
- how decisions survive memory loss

Senior engineers communicate architecture clearly.

## ADR

ADR means architecture decision record.

An ADR documents:

- context
- problem
- decision
- consequences
- alternatives
- follow-up work

ADRs are useful because future engineers can understand why a decision was made.

## Good ADRs

Good ADRs are:

- short enough to read
- specific to a real decision
- honest about consequences
- clear about alternatives
- linked to related docs
- updated or superseded when decisions change

Bad ADRs are:

- vague
- written after the fact as decoration
- full of buzzwords
- missing tradeoffs

## Documentation As Architecture

Documentation is not separate from architecture.

Docs help:

- onboard new engineers
- reduce repeated explanations
- make ownership explicit
- record tradeoffs
- expose risks
- improve interview storytelling

In a monorepo, docs can live near the system and evolve with it.

## Communication Levels

Different audiences need different depth.

Executive/product:

```text
what user or business risk does this address?
```

Engineering peer:

```text
what are the design options and tradeoffs?
```

Operations:

```text
how do we deploy, observe, and recover it?
```

Interview:

```text
what did you choose, why, what did it cost, what would you improve?
```

## Influence Without Authority

Senior engineers often influence without being the formal manager.

They do this by:

- making tradeoffs visible
- writing clear proposals
- asking good questions
- reducing ambiguity
- connecting technical choices to product impact
- creating migration paths
- making it easier for others to decide

## Architecture Review Questions

Ask:

- What problem are we solving?
- What alternatives did we consider?
- What is the simplest viable option?
- What is the operational cost?
- What fails if this component fails?
- Who owns this after launch?
- How will we measure success?
- How do we roll back?
- What would make us revisit this?

## Artistry Cart ADR Examples

The repo documents decisions for:

- Nx monorepo
- MongoDB with Prisma
- API gateway pattern
- Kafka analytics pipeline
- AI Vision service boundary

These are strong because they explain not only what was chosen, but why it fits the project stage and what tradeoffs remain.

## Strong Interview Answer

If asked "Why do architecture docs matter?", say:

> Architecture docs preserve reasoning. Code shows what exists, but ADRs explain why a decision was made, what alternatives were rejected, what tradeoffs were accepted, and what follow-up work remains. That helps teams make future changes without rediscovering the same context.

## Artistry Cart Connection

Artistry Cart uses docs and ADRs as part of the architecture itself. That is useful for real engineering work and for interviews because the system can be explained as a sequence of deliberate decisions rather than a pile of technologies.
