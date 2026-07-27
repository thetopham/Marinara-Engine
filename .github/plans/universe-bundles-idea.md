# Universe Bundles — Portable Worlds, Characters, Lore, and Art

Status: **Exploratory idea; not an approved roadmap or implementation plan**

This document captures a product direction for turning Marinara's currently
separate characters, lorebooks, maps, location artwork, and story starting points
into portable, composable worlds.

The central idea is simple:

> Download a world, choose where its canon stops, choose who exists there, and
> continue the story in any direction.

Hierarchical Maps is the natural spatial foundation for this experience, but it
should not become the owner of every imported content type. Maps should describe
where the campaign is and which world or location context is active. A separate,
data-only bundle layer should compose Maps with Engine-owned characters, lore,
gallery assets, and campaign setup.

## Problem

Building a complete fandom or original-world roleplay currently requires users to
assemble related content from several disconnected places:

- character cards from one source;
- lorebooks from another;
- maps and location descriptions built by hand;
- reference artwork gathered or generated separately;
- chat backgrounds configured independently;
- an opening scenario or canon checkpoint rewritten for every new campaign.

Those pieces may describe the same universe, but Marinara has no portable object
that says they belong together. IDs and attachments are local, so moving content
between installations or campaigns can break relationships. Users must also decide
manually which lore should be global, which location image should guide generation,
and how a new chat should begin.

The result is a collection of ingredients rather than an installable world.

## Product thesis

A world should be installable as content, forkable as a campaign, and composable
with other worlds.

A user could install a Bleach universe bundle, choose a Soul Society-era scenario,
select a cast, and begin from the point where the anime ended. Another user could
start at an earlier canon checkpoint and ask what would happen if one character
made a different decision. A third could add characters from another universe and
create a crossover.

The installed source remains immutable. The user's campaign becomes a fork:
changes, discovered locations, altered relationships, generated artwork, and
divergent history belong to that campaign and are never overwritten by an update
to the source bundle.

## Package model

The design should be modular rather than treating every universe as one enormous
archive.

### World Pack

A World Pack contains the setting:

- hierarchical maps, regions, locations, routes, and starting positions;
- universe-, region-, and location-scoped lore;
- location reference images;
- map backgrounds;
- optional scene backdrops;
- factions, terminology, and setting-level metadata;
- optional visual-style guidance that does not contain provider credentials or
  machine-local connection IDs.

### Character Pack

A Character Pack contains one character or a deliberately related cast:

- character card data;
- avatar and reference artwork;
- optional sprites or expressions;
- character-specific lore;
- relationships and aliases;
- compatible universe or scenario dependencies;
- source, attribution, and spoiler metadata.

Characters remain separately installable. A Universe Bundle can recommend a
default cast without requiring users to import everyone.

### Scenario Pack

A Scenario Pack describes a starting branch:

- a canon or original timeline checkpoint;
- starting location;
- initial cast and relationship state;
- opening situation;
- optional plot outline, goals, secrets, and spoiler level;
- required or recommended World and Character Packs.

The main plot belongs here rather than in the base world. A world can support many
checkpoints and alternate scenarios without duplicating all its maps and lore.

### Universe Bundle

A Universe Bundle is primarily a manifest that composes compatible versions of
World, Character, and Scenario Packs. It provides a convenient one-click
experience while preserving the ability to install, omit, replace, or combine
individual parts.

Universe Bundles are data packages, not executable Agent or capability packages.
They must not gain server, client, network, tool, or prompt-execution permissions.

## Primary user journey

1. Open a future **Worlds** or **Universe Library** surface.
2. Preview a bundle's maps, cast, scenarios, artwork, source, license, size, and
   Engine compatibility.
3. Install the bundle into the local content library.
4. Choose **Start a campaign from this universe**.
5. Select a scenario or canon checkpoint.
6. Select the included characters to instantiate.
7. Review optional lore, artwork, and visual-style choices.
8. Create a campaign-local copy with every relationship remapped atomically.
9. Continue normally. New locations, lore, characters, and plot changes belong to
   the campaign fork.

Installing a bundle must not silently make its lore global in unrelated chats.

## Location artwork and the roleplay backdrop

Location artwork serves three related but distinct purposes:

1. **Generation reference** — conditions image generation so a recurring location
   stays visually recognizable.
2. **Map background** — appears behind places and routes in the map editor or map
   overlay.
3. **Scene backdrop** — appears behind the actual roleplay surface while the party
   is at that location.

One image may initially fill all three roles, but the data model should not assume
they will always remain identical. A location reference may be concept art, its
map background may be an overhead layout, and its scene backdrop may be a
cinematic widescreen view.

### Proposed setting

Add a campaign-local setting:

**Use active map location as scene backdrop**

Suggested policy choices:

- **Off**
- **When Storyboard is not displayed** — recommended default when enabled
- **Always as the base layer**

The visual ownership order should be explicit:

1. active Storyboard frame or video;
2. current location scene backdrop;
3. ordinary chat background or theme.

Storyboard temporarily owns the visual stage while it is displayed or playing.
When it closes, the active location returns. Always-as-base may retain the
location underneath transparent Storyboard surfaces, but Storyboard media remains
the primary content.

Additional behavior:

- the setting is per campaign or chat, never application-global by accident;
- transitions may crossfade when the active location changes;
- reduced-motion preferences disable or simplify the transition;
- a missing backdrop falls back to the map or reference image only when the
  location explicitly permits that fallback;
- a missing or archived active location falls back to the normal chat background;
- imported content cannot override an explicit chat appearance setting without
  confirmation.

## Lore ownership and activation

A bundle should not duplicate an entire lorebook for every location. It should
contain one portable lore library with entries scoped to one or more owners:

- universe;
- region;
- location;
- faction;
- character;
- scenario.

Portable links use stable bundle-local IDs. During campaign creation, the importer
creates the actual Engine records and remaps every relationship in one atomic
operation.

Activation rules should be conservative:

- universe lore applies only inside campaigns created from or explicitly attached
  to that universe;
- region and location lore follows the active spatial route;
- character lore follows the instantiated cast and existing lore activation
  policy;
- scenario lore follows the selected scenario;
- archived locations remain available as campaign history but do not inject lore
  or fail saves because an old optional link is missing;
- no imported lore becomes globally active across unrelated RP chats unless the
  user deliberately chooses that existing Engine behavior.

Broken required references should reject the import before it mutates user data.
Broken optional references should be reported in a human-readable review rather
than as opaque internal IDs.

## Portable archive concept

A possible archive extension is .marinara-world, backed by a deterministic ZIP:

    manifest.json
    world/
      maps.json
      lore.json
    characters/
      index.json
      character files
    scenarios/
      index.json
      scenario files
    assets/
      locations/
      maps/
      characters/
      covers/

The manifest should include:

- schema version;
- stable namespaced package ID;
- display name, description, author, and version;
- content kinds included by the archive;
- required and optional dependencies;
- minimum and maximum-compatible Engine versions;
- file paths, byte sizes, and cryptographic hashes;
- source, attribution, license, and redistribution declarations;
- spoiler and canon metadata;
- deterministic build information;
- explicit absence of executable entrypoints.

The physical split can change during design. The important properties are portable
identity, deterministic validation, atomic materialization, and no executable code.

## Identity, updates, and campaign forks

Bundle content should use namespaced portable IDs, for example:

- bleach:world:soul-society
- bleach:location:seireitei
- bleach:character:rukia-kuchiki
- wistoria:world:regarden

Installation creates a library record for the immutable source version. Starting
a campaign materializes campaign-owned IDs while retaining provenance back to the
source IDs.

Campaign changes are stored as an overlay or fork:

- user edits never mutate the installed source;
- source updates never overwrite campaign history;
- updating a source may offer a reviewed reconciliation for content the campaign
  has not changed;
- removing a source bundle must not delete campaigns materialized from it;
- exporting a campaign can optionally include only its overlay plus declared
  dependencies, or produce a self-contained archive when redistribution permits.

## Multiverse composition

Multiverse play should be an expected composition path, not an accidental merge of
name-based records.

Namespaced IDs prevent two universes' Capital, Academy, or similarly named
characters from colliding. The campaign composer can:

- import multiple World Packs;
- select one starting world and location;
- choose characters across installed packs;
- add explicit portals or routes between otherwise separate map roots;
- review conflicting visual-style or lore defaults;
- preserve each source's provenance and namespace;
- create campaign-local crossover relationships without editing source packs.

No bundle may silently replace another bundle's record merely because their
display names match.

## Engine and package boundaries

This idea crosses multiple existing ownership boundaries and should be split
accordingly if implementation begins.

### Marinara Engine owns

- generic archive validation and safe extraction;
- content-library and dependency records;
- atomic import and materialization transactions;
- character, lore, gallery, and campaign ID remapping;
- bundle preview, permission review, installation, update, removal, and campaign
  composition UI;
- shared backdrop ownership and rendering precedence;
- provider-independent storage and compatibility handling;
- backup and export integration.

### Hierarchical Maps owns

- the portable spatial definition;
- location and region hierarchy and routes;
- map-specific visual fields;
- current-location projection;
- spatial lore attachment metadata;
- Maps-specific import and export validation;
- exposing the current location and selected backdrop or reference through a
  generic host contract.

### Storyboard owns

- consuming the active location reference when generating media;
- taking temporary ownership of the roleplay visual stage;
- returning control to the location backdrop when Storyboard media closes.

Storyboard should not know whether the location originated from a bundle.

### A future content catalog owns

- discovery and download metadata for data-only bundles;
- trust and review signals;
- licenses and attribution;
- dependency resolution.

This should not be conflated with the executable Agents catalog.

## Security, trust, and distribution

Bundle import is risky because it accepts archives and creates durable user data.
The implementation must account for:

- path traversal and unsafe archive members;
- decompression bombs and bounded aggregate sizes;
- per-file size and type limits;
- hash verification;
- malformed or cyclic dependencies;
- duplicate IDs and version confusion;
- cross-chat or cross-campaign asset references;
- HTML, SVG, prompt, and metadata injection;
- remote URLs and automatic network fetching;
- partial imports and rollback;
- uninstall and backup or restore integrity.

The first format should use a narrow image allowlist and treat all imported text as
data, never executable markup or instructions.

Fandom distribution also creates copyright and licensing concerns. Every published
bundle should carry source, attribution, license, and redistribution declarations.
Community-hosted or direct user imports may be more appropriate than automatically
placing fandom archives in an official first-party catalog. That policy question
should not prevent a safe local format, but it must be resolved before public
distribution.

## Suggested delivery phases

### Phase 0 — Location backdrop experiment

- Add the campaign-local active-location backdrop policy.
- Reuse the existing reference image as an opt-in fallback.
- Define Storyboard and background precedence.
- Prove location changes, reload persistence, missing images, archived locations,
  desktop and mobile layout, themes, and reduced motion.

This phase tests the immediate visual payoff without committing to a bundle format.

### Phase 1 — Portable World Pack

- Define a versioned data-only archive.
- Export and import Maps, scoped lore, and location artwork.
- Materialize campaign-owned records atomically.
- Prove round-trip identity, asset integrity, no global lore leakage, rollback,
  backup and restore, update, and removal.

### Phase 2 — Character and Scenario Packs

- Add separately installable character content.
- Add canon checkpoints and opening scenarios.
- Introduce dependency and compatibility review.

### Phase 3 — Universe composition

- Compose World, Character, and Scenario Packs.
- Add campaign-creation review and selective import.
- Preserve immutable sources and campaign forks.

### Phase 4 — Multiverse composition

- Combine namespaces across universes.
- Add explicit cross-world routes.
- Review lore, cast, and visual-style conflicts.
- Export campaign overlays or self-contained campaigns where licensing permits.

Each phase should have its own issue, design contract, draft PR, proof matrix, and
rollback story. This idea document is not authorization to implement all phases as
one feature.

## Success criteria

The direction succeeds when a user can:

- install a world without making it global to unrelated chats;
- preview exactly which maps, lore, characters, scenarios, and assets it contains;
- start a campaign at a chosen checkpoint;
- see the current location reflected in prompts, generated media, and optionally
  the roleplay backdrop;
- branch from canon without source updates overwriting the campaign;
- add or remove characters and scenarios independently;
- combine compatible worlds without ID collisions;
- export or back up the resulting campaign with intact relationships;
- understand import failures without unexplained database or lore-entry IDs.

## Non-goals for the first implementation

- executable scripts or Agent permissions inside content bundles;
- automatically downloading arbitrary remote assets;
- silently enabling global lore;
- synchronizing live campaign state back into an installed source;
- promising an official marketplace before licensing and trust policy exist;
- solving automatic canon extraction from copyrighted source material;
- implementing every provider-specific visual workflow inside the bundle format.

## Open questions

1. Should the first portable object be called a World Pack, Campaign Template,
   Universe Pack, or something else in the UI?
2. Is a location scene backdrop a new asset field, or a typed use of an existing
   gallery relationship with an explicit fallback policy?
3. Should an installed bundle be globally available as an immutable library object,
   or copied into a user-owned library before campaign creation?
4. How much source-update reconciliation is safe after a campaign has diverged?
5. Which lore scopes can reuse existing lorebook attachment behavior, and which
   need a campaign-specific activation contract?
6. Should characters declare required universes, recommended universes, or only
   free-form compatibility tags?
7. How should spoiler level and canon checkpoint metadata appear during preview?
8. Can a campaign export reference installed dependencies, or must every export be
   self-contained?
9. What content and licensing rules are required before community bundle discovery
   can exist?
10. Does the backdrop setting belong in chat appearance, Hierarchical Maps
    settings, or both through one shared underlying policy?

## Recommended next decision

Before designing the full archive, prototype the active-location scene backdrop and
settle the three-image-role model:

- generation reference;
- map background;
- roleplay scene backdrop.

That experiment will establish whether location-aware visual continuity feels
valuable in normal play and reveal the correct ownership boundary between Engine,
Maps, Storyboard, and chat appearance. If it succeeds, the portable World Pack is
the next foundational slice.
