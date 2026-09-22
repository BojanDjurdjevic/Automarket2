---
paths:
  - 'app/Http/Controllers/Api/**'
  - app/Http/Controllers/Api/CarController.php
---

# Api

## Domain service objects
Keep car mutations, image operations, and search in concrete service classes with descriptive operation methods. Call these methods directly from the API controllers.

## Direct Eloquent data access
Build Eloquent queries and relation operations directly in controllers and services, preserving the existing structure without adding a repository layer.

## Car listing pagination contract
Use length-aware `paginate(15)` pagination for car collection endpoints.

## Separate frontend boundary
Keep business endpoints as API responses serving the separate frontend application.
