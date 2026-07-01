# UI Upgrade Plan

This is a large scope (13 areas). To keep quality high and avoid a giant unreviewable change, I'll ship in 4 focused phases. Each phase is self-contained and testable before moving on.

---

## Phase 1 — Discovery & Social Core (highest impact)
1. **Global Search Overlay** — `⌘K`-style sheet triggered from every header search icon. Recent queries (localStorage), suggestions, tabbed results across People, Pets, Products, Ads, Events. Keyboard nav.
2. **Notifications polish** — Filter tabs (All / Messages / Likes / Follows / System), Today/This week/Earlier grouping, "Mark all read", swipe-to-dismiss (reuse `SwipeableRow`), illustrated empty state.
3. **Comments upgrade** — Reply threads (1 level), like-on-comment, emoji reactions bar, @mentions autocomplete, image attach, delete (own) / report (others).
4. **Feed polish** — Skeleton loaders, "For You / Following" tabs, double-tap heart animation, share sheet (copy link / message / external), end-of-feed state.

## Phase 2 — Profiles & Onboarding
5. **Handler & Animal profiles** — Sub-tabs (Posts / Media / Tagged / Liked), pinned posts, Stories/Highlights row, share sheet with QR code.
6. **Onboarding** — Multi-step progress bar, post-signup welcome tour, empty-state prompts ("Add your first pet", follow suggestions).

## Phase 3 — Commerce & Content Editors
7. **Marketplace detail pages** — Swipeable gallery, review UI, related items carousel, sticky mobile buy bar.
8. **Checkout** — Address book, saved payment methods, `/orders` history page, receipt view.
9. **CreateAd / CreatePost** — Image crop + filter presets, video trim, draft auto-save indicator, schedule-for-later.

## Phase 4 — Business, Events & Ad Transparency
10. **Business Dashboard** — Real charts (recharts) for revenue & ad performance, date-range picker, CSV export.
11. **Events** — List/Calendar/Map toggle, RSVP confirmation screen, attendee avatar stack.
12. **Ads feed** — "Why am I seeing this?" sheet, hide/report flow, owner analytics drill-down page.

---

## Technical notes
- New shared components: `GlobalSearch`, `ShareSheet`, `QRSheet`, `Skeleton*`, `EmptyState`, `SwipeToDismiss` (extend existing swipe row), `ImageCropper` (react-easy-crop), `Chart` wrappers (recharts — already available).
- New routes: `/orders`, `/orders/:id`, `/ads/:id/analytics`, `/settings/addresses`, `/settings/payment-methods`.
- New context: `DraftsContext` for auto-save across editors.
- Storage: continue localStorage keyed by `activeProfile.id`.
- No backend changes; all client-side.

---

## Ask before I start
**Do you want me to ship all 4 phases in sequence in this session, or start with Phase 1 and pause for review?**

Phase 1 alone is a big change (~15 files). I recommend shipping Phase 1, letting you try it, then moving on — but I'll do it all in one go if you say so.
