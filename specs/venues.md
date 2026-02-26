# Spec: Venues

## Overview

Multi-venue support. The Tythe Barn operates multiple venues. Time entries can be scoped to a venue. Admins can manage venues and delete venue accounts.

---

## Data model

```
venues
├── id           UUID PK
├── name         TEXT
├── slug         TEXT UNIQUE  -- URL-safe identifier
├── active       BOOLEAN
├── settings     JSONB NULL   -- custom rules, pay rate overrides
└── created_at   TIMESTAMPTZ
```

`time_entries.venue_id` FK → `venues.id` (nullable for legacy entries)

---

## Venue settings

Per-venue custom pay rate rules can override the global defaults. Stored in `venues.settings` JSONB.

---

## Venue management (admin)

- List all venues
- Create venue (name, slug)
- Edit venue settings
- Deactivate / reactivate venue
- **Delete venue account:** permanently deletes the venue and all associated data (time entries, user-venue associations)
  - Requires explicit confirmation (type venue name to confirm)
  - Irreversible

---

## Delete venue account (ved-03 / ved-04)

- Admin-only action
- Endpoint: `POST /:slug/delete-account`
- UI: "Delete Account" button in venue settings, confirmation modal
- On confirm: deletes venue row (cascade deletes associated data)
- Redirects to venue list after deletion

---

## Acceptance criteria

- [ ] Admin can list all venues
- [ ] Admin can create a new venue
- [ ] Admin can edit venue settings (name, custom rules)
- [ ] Admin can deactivate and reactivate a venue
- [ ] Admin can delete a venue account (with confirmation)
- [ ] Deleting a venue removes associated time entries
- [ ] Venue deletion requires typing the venue name to confirm
- [ ] `time_entries` correctly scoped to venue when venue_id is set
- [ ] Employees see only entries for their venue
