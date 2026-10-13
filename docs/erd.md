# Entity Relationship Diagram

Paste the block below into https://mermaid.live (or any Mermaid renderer), then export it
as `docs/erd.png` for the submission. You may also redraw it in dbdiagram.io or draw.io.

```mermaid
erDiagram
    USERS ||--o{ HARVEST_RECORDS : "farmer has many"
    USERS ||--o{ CROP_LISTINGS : "farmer publishes"
    USERS ||--o{ BUYER_REQUESTS : "buyer submits"
    CROPS ||--o{ HARVEST_RECORDS : "is harvested as"
    CROPS ||--o{ CROP_LISTINGS : "is listed as"
    HARVEST_RECORDS |o--o{ CROP_LISTINGS : "may source"
    CROP_LISTINGS ||--o{ BUYER_REQUESTS : "receives"

    USERS {
        bigint id PK
        string name
        string email UK
        string password
        string role "admin | farmer | buyer"
        string phone
        string address
    }
    CROPS {
        bigint id PK
        string name UK
        string category
        text description
    }
    HARVEST_RECORDS {
        bigint id PK
        bigint farmer_id FK
        bigint crop_id FK
        decimal expected_quantity
        decimal actual_quantity
        string unit
        date harvest_date
        string status "planned | harvested | listed"
        text notes
    }
    CROP_LISTINGS {
        bigint id PK
        bigint farmer_id FK
        bigint crop_id FK
        bigint harvest_record_id FK "nullable"
        decimal available_quantity
        string unit
        decimal price_per_unit
        date harvest_date
        string status "available | sold_out"
        text description
    }
    BUYER_REQUESTS {
        bigint id PK
        bigint buyer_id FK
        bigint crop_listing_id FK
        decimal requested_quantity
        text message
        string status "pending | approved | rejected | completed | cancelled"
    }
```
