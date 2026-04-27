# ImageKit Integration

## Overview

`packages/libs/imageKit` exports the shared ImageKit client used for media-related flows.

## What It Does

- initializes an `ImageKit` client
- reads:
  - `IMAGEKIT_PUBLIC_API_KEY`
  - `IMAGEKIT_PRIVATE_API_KEY`
- uses a fixed `urlEndpoint`

## Where It Matters

The most visible consumer is `aivision-service`, where generated concepts, thumbnails, and image-processing workflows depend on reliable media storage and delivery.

It may also support product and other image-management paths elsewhere in the repo.

## Why It Exists

This package avoids reinitializing ImageKit configuration in multiple services and gives tests a stable place to mock the integration.

## Strengths

- tiny, focused, and easy to reuse
- clean seam for mocking in `packages/test-utils`

## Tradeoffs

- the URL endpoint is currently hardcoded rather than fully env-driven
- if multiple media environments are needed later, this package will likely need more configuration flexibility

## Interview Notes

This is a lightweight shared integration package. It is useful mostly because it reduces duplication and provides a stable abstraction boundary for testing.
