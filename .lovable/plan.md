## Current State vs Spec — Gaps Found

### ✅ Pages that exist:
- Feed, Landing/Login, Handler Profile, Animal Profile, Inbox, Message View, Create Post, Explore, Events, My Store

### ❌ Missing Pages:
1. **Marketplace** — Bottom nav says "Explore" but spec says "Marketplace"
2. **Notification** — Bottom nav says "Profile" but spec says "Notification"
3. **Subscription Page** — For business plan selection (Free/Basic/Enterprise)

### 🔧 Misaligned Components:

**Bottom Nav** (currently: Home | Explore | Plus | Inbox | Profile)
→ Should be: **Home | Marketplace | Plus | Inbox | Notification**

**Top Right Header (authenticated)** — Currently shows ProfileSwitcher
→ Should show: **Search icon + Hamburger menu (≡)**
- Search opens Explore page
- Hamburger opens overlay with: Handler info, Switch Pet, Business, Ads, Logout

**Registration Flow** — Currently simple form, redirects to feed
→ Should be multi-step: Register → Add Pet (skippable) → Add Business (conditional skip) → Subscription (if business) → Redirect

**Explore Page** — Currently a standalone page via bottom nav
→ Should open from Search icon, with tabs: Posts, Live Video, Events, Products, Services

**Create Post (Plus button)** — Currently opens Create Post page
→ Should open overlay with 3 tabs: Post, Event, Live Video

### 📋 Proposed Implementation Order:
1. Fix Bottom Nav (Marketplace + Notification)
2. Create Marketplace page
3. Create Notification page
4. Update header (Search + Hamburger menu overlay)
5. Multi-step registration flow
6. Update Explore with tabs
7. Update Plus button to overlay with tabs

Shall I proceed with all of these, or prioritize specific items?