---
paths:
  - 'app/Services/**'
  - app/Services/CarSearchService.php
---

# Services

## Domain service objects
Keep car mutations, image operations, and search in concrete service classes with descriptive operation methods. Call these methods directly from the API controllers.

## Direct Eloquent data access
Build Eloquent queries and relation operations directly in controllers and services, preserving the existing structure without adding a repository layer.

## Array-based service input
Pass listing data, search filters, and uploaded-file collections to services as arrays, and pass persisted entities as Eloquent models.

## Car listing pagination contract
Use length-aware `paginate(15)` pagination for car collection endpoints.
