# doompiles
DoomPiles is an app to help you regain control of your household chaos. If you want to throttle the next helpful person who says "don't put it down, just put it away!" this might be for you.
# Prototype Strategy
Decided: build as a web app first, not native. Reasoning:
•	The core loop (photo capture → pile ID → reminder → resolve) needs to feel right before investing in native infrastructure
•	PWA gets far enough for prototyping — push notifications and camera access work in mobile browsers, and the Pantry project already has a PWA manifest to reference
•	Native (Swift/Kotlin/React Native) is the right call eventually if silly animations and richer notification UX are the goal — but build that after the data model and UX patterns are validated, not before
•	If it turns out native is the right long-term home, a working web prototype is a better spec than building blind
# Design Constraint: No Engagement Loops
Explicit product principle — not just a vibe, an actual constraint:
•	No badges, no streaks, no daily check-ins designed to bring users back to the app
•	Notifications exist to close a loop in the real world, not to drive app opens — a pile reminder fires, you go deal with the pile, the notification served its purpose
•	The accountability buddy escalation fits this framework correctly: it's not "you haven't opened DoomPiles in 3 days," it's "this specific pile has been unresolved long enough that you asked us to involve someone"
•	Pile resolution reward should be momentary and silly — something that happens and is gone, not recorded for a leaderboard (see Resolved Pile Reward below)
# Core Features
1. Item Location Logging (the "organized" layer)
The straightforward case — log where a specific, known item lives.
•	Simple item-to-location mapping: "Hungry Hungry Hippos → Gabriel's closet"
•	Fast lookup/search when someone needs to find something
•	Probably the smallest lift of the three layers — closest to what Pantry already does conceptually
# 2. Missing Item Tracking
Handles the "Mikey is crying because he can't find his antivenom Lego minifig" case. DECIDED: missing items get their own data structure (not a status flag on the Item table) — see Data Model.
•	Quick-add flow with minimal required fields — a missing item may have almost no known information attached
•	Captures fuzzy context: rough last-seen location, rough timeframe, who reported it, urgency level
•	Resolution states: found / gave up / still looking — plus how it was found (in a pile vs. exactly where someone swore they checked — useful pattern data)
•	Optional link back to a cataloged Item record if the thing was previously logged
# 3. Doom Pile Capture (the signature feature)
•	Snap a photo of a pile — no expectation of completeness, since a fully-cataloged pile wouldn't be a doom pile
•	Vision API (Groq, reused from Pantry) identifies whatever subset of items it can confidently recognize — partial ID is fine and expected
•	The whole pile gets a single database ID — tracked as one entity, not a list of fully-itemized contents
•	Pile photo stored in object storage (Cloudflare R2 or similar), URL/key stored in Postgres — not blobs in DB
•	On capture, app schedules a follow-up reminder automatically (3 days, next weekend, configurable)
•	Purpose: break the psychological pattern of walking past the same pile repeatedly without registering it
•	Piles can be marked resolved — triggers reward mechanic (see below)
# 4. Accountability Buddy Escalation
For piles or missing items that keep getting ignored past their reminders.
•	Set up once during onboarding — the buddy is a named contact, changeable at any time in settings
•	Requires opt-in verification from the buddy before it's active — they're consenting to receive notifications about your mess
•	After a configurable number of missed reminders or elapsed time, the buddy gets added to the next reminder invite
•	Open question: does the buddy see the pile photo, or just a generic nudge? Photo is a bigger ask of them — worth a toggle
•	This is a last resort, not a default — escalation only fires when you've already ignored multiple reminders
# 5. Dump / Donation / Sale Tracking
A fourth item state — beyond located/missing/in-pile — for stuff you've decided to get rid of.
•	Items (or identified pile contents) can be flagged: dump / donate / sell
•	App tracks accumulation and reminds when a time threshold or item count threshold is reached
•	Reminder triggers a "drop-off day" — batches all flagged items together rather than nagging per-item
•	Practical: one organized pass to deal with outgoing stuff, not a drip of individual reminders
# 6. Resolved Pile Reward
When a pile is marked resolved, something silly and satisfying happens. Not a badge. Not a recorded achievement. A moment.
•	Intentionally momentary — it fires, it's fun, it's gone
•	DECIDED: small immediate-feedback animation on each milestone status change (see Pile Milestones below) — lightweight, fires every step, not just at the end
•	DECIDED: the pile graveyard is the bigger payoff for full resolution — a scrollable record of defeated piles, each with a little tombstone showing whatever the vision API thought was in it. Gives resolved piles somewhere to live instead of just vanishing from the active list
•	Still open: whether the per-milestone animation is one consistent style or randomized/silly each time (confetti, unhinged congratulatory message, etc.)
•	The mechanic should match the self-deprecating tone of the app name — DoomPiles doesn't take itself seriously, and neither should the milestone pop or the graveyard epitaphs
# 7. Pile Milestones
Linear progression a pile moves through, rather than a single binary resolved/not-resolved state. Tracks the actual messy middle, where most real progress happens even before a pile is fully cleared.
•	1. Identified — pile captured, photo taken, vision API has run
•	2. Found a home for an item — at least one identified item has been relocated to where it belongs
•	3. Put or threw something away — something has left the pile permanently (put away or discarded)
•	4. Can see the bottom — the pile is visibly shrinking, meaningful progress has been made
•	5. Doom pile defeated — pile fully resolved, triggers the graveyard entry
•	Each step change fires the small status-change animation; reaching step 5 fires the graveyard reward
# 8. Dump / Donation Haul Milestones
Same linear-progression approach applied to outgoing item hauls, since "flagged for donation" to "actually out of the house" has its own messy middle.
•	1. Bagged/boxed — items physically gathered and contained
•	2. In the car — haul has left the house, is in transit
•	3. Scheduled — a drop-off day/time is set
•	4. Done — haul has been dropped off, items are out of your life
•	Each step change fires the same small status-change animation as pile milestones, for consistency
# 9. Root-Cause Escalation (stuck-item diagnosis)
The key insight here: repeated identical reminders just train you to ignore notifications. If a pile (or a specific item within a pile) stays stuck past a normal reminder threshold, the next prompt doesn't repeat — it asks why, then generates an actual next step. Operates per item, not per pile, since a single pile can have multiple stuck items with different root causes.
•	Trigger: an identified item within a pile hasn't progressed (still sitting at the same milestone) after N reminders
•	Root-cause prompt presents presets plus one bounded free-text reason field: it was a gift and I feel I can't get rid of it / it belongs to someone else in the household / I know where I want to put it but something else is there / I need to buy something to contain or organize it / I need to do something else first (frame it, hang it, fix it, etc.)
•	AI takes the selected reason and generates ONE concrete, schedulable next step — examples: a suggested bin size/type and where to get one, a conversation-framing suggestion if it's a household-ownership issue, a broken-down sequence of small tasks if it's an executive-function block, a suggested destination if it's a "don't know where this goes" issue
•	User can see and tweak the generated plan before it becomes a scheduled task — but feedback is constrained to preset responses (Accept / Try a different angle / Break it down further / Doesn't fit, pick a different reason), not open conversation
•	Hard cap on regeneration attempts (e.g. 2-3) to prevent the loop from spiraling — past the cap, user edits the task text manually instead of continuing to prompt the AI
•	CRITICAL CONSTRAINT: no open-ended chat interface for this feature. Single bounded input (the reason) → single bounded output (the plan) → single bounded feedback loop (preset responses only). This is deliberate — an open text box invites scope creep into venting, unrelated requests, or turning the feature into a general-purpose chatbot
•	Once accepted, the generated plan becomes the new scheduled reminder/task, replacing the generic repeat-reminder behavior
# Multi-User / Accounts: Architecture Decision
DECIDED: multi-user support is an architectural consideration, not a hard launch requirement. Build for your own household first and validate the core loop (capture → milestone → escalation) before opening this up — but design the data model so it's not painful to retrofit later.
•	Google OAuth (or similar low-friction provider login) is the target for eventual signup — no "invent a password" friction. Doesn't need to be built for v1, but worth keeping in mind so early auth choices don't paint into a corner
•	This likely tips fork-vs-fresh toward fresh for auth specifically, even if other Pantry pieces (Groq pipeline, Vercel/Neon setup) get reused — Pantry's HMAC session was built single-household, not for arbitrary signups
•	Data model implication: every table should carry a household/account boundary from the start (even if there's only ever one household in practice for now), since retrofitting tenant isolation later is far more painful than designing it in from day one
•	Accountability buddy gets more complex once buddies aren't guaranteed to already be users — eventual need for an invite flow (email invite → buddy creates account or accepts some lighter-weight verification) rather than just picking a contact from settings. Not needed for v1, but the buddy_contact field shouldn't assume an existing user_id
•	Practical takeaway for prototyping: build single-household first, but don't hardcode assumptions (like a single global UserConfig with no account/household_id) that would require a rewrite rather than an extension later
# Data Model (decisions + open questions)
Decided
•	Missing items get their own table — not a status flag on Item. A missing item has almost no fields in common with a located item (no location_id, maybe no photo, fuzzy everything). Forcing it into Item means a ton of nullables on the main table to serve a structurally different record type.
•	Pile photos go to object storage (Cloudflare R2 or equivalent), not Postgres blobs — URL/key stored in the pile record
•	All core tables (Item, Pile, MissingItem, OutgoingItem) should carry a household_id/account_id from the start, even while only one household exists in practice — supports future multi-user without a schema rewrite
Rough Shape (not final)
•	Item — name, location_id (FK), status (located / in_pile / flagged_outgoing), optional photo key, optional pile_id if it was identified in a pile
•	MissingItem — separate table: reported_by, item_name (freeform), last_seen_location (freeform text), last_seen_approx_date, urgency, resolution_status, resolved_how, optional Item FK if it matches a cataloged item
•	Pile — pile_id, photo_key (R2), location_description, created_at, milestone_status (identified / home_found / put_away / can_see_bottom / defeated), resolved_at (nullable), next_checkin_date, reminder_count (for escalation trigger)
•	PileItem — loose join: pile_id, item_name (as identified by vision API), confidence, optional Item FK
•	Reminder — linked to Pile or MissingItem, scheduled_at, fired_at, acknowledged_at, buddy_escalated (bool)
•	OutgoingItem — item or freeform name, disposition (dump/donate/sell), flagged_at, drop_off_day FK
•	DropOffDay — scheduled_date, completed_at, milestone_status (bagged / in_car / scheduled / done), list of OutgoingItems
•	UserConfig — buddy_name, buddy_contact, buddy_verified (bool), reminder_offset_days, escalation_threshold
•	ItemStuckReason — item_id (FK), reason_preset (or freeform text), raised_at, ai_generated_plan, plan_status (pending / accepted / regenerated / manually_edited), regeneration_count
# Tech Stack (working assumptions)
•	Frontend: web (PWA), possibly native later
•	Backend: Node.js serverless on Vercel (same as Pantry)
•	Database: Neon Postgres
•	Auth: HMAC session (same as Pantry, to be confirmed for multi-user)
•	Vision: Groq vision API (reused from Pantry pipeline)
•	Photo storage: Cloudflare R2 (decided — not Postgres blobs, not Vercel Blob)
•	Reminders: calendar integration TBD (or internal scheduler + push via PWA)

