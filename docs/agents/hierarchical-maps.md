# Hierarchical Maps: Setup, Authoring, and Travel

Hierarchical Maps adds a persistent story map to Roleplay and Game chats. Instead of keeping one free-text location, it can represent a world as nested places:

```text
The Shattered Coast
└── Brinewatch
    ├── Harbor District
    │   ├── Tideglass Inn
    │   └── Customs House
    └── Old Sewers
```

Marinara keeps an authoritative current location in this hierarchy. The current path, location details, nearby destinations, and any lore linked to the exact current location can be included in the next reply's context. The AI cannot move the story merely by narrating that the party went somewhere; you choose a destination and commit the move with your next turn.

Hierarchical Maps works in **Roleplay** and **Game**. Each chat has its own map and current location.

## Quick start

1. Open the **Agents** panel, click **Download Agents**, and install **Hierarchical Maps**. If the catalog then offers **Update**, install that too.
2. Restart Marinara when the catalog asks.
3. Open the Roleplay or Game chat and go to **Chat Settings → Agents → Tracker Agents**.
4. Enable **Hierarchical Maps** for this chat.
5. Scroll back to the **Hierarchical map** setting and click **Edit hierarchical map**. If the editor asks, click **Create map**.
6. Choose **Draft with AI**, describe what you want, and click **Generate draft**.
7. The Draft preview summarizes only the first/top-level location. Click **Use this draft** to load the complete hierarchy into the unsaved editor, then expand and select its locations to inspect them.
8. Set or confirm the starting location, switch the map to **Enabled**, and click **Save**.
9. In the chat, choose a reachable destination from **Story location** or the Game world-map view. Send your next message to complete the move.

Applying an AI draft or importing a file changes only the editor's working copy. The map does not affect replies until you enable and save it.

## Install and activate the package

Open the **Agents** panel from the Sparkles tab in the right sidebar. Click **Download Agents**, select **Hierarchical Maps**, and click **Install**. If the installed card still offers **Update**, update it before continuing. The package includes server code, so follow the restart prompt before trying to use it.

Installing makes the feature available, but it does not turn it on in every chat.

The installed feature also appears as **Hierarchical Maps** in the main **Agents** panel. Its current detail page uses the generic agent editor and can show empty Prompt Template, named-option, connection, tool, and other fields. You do not need to fill in those fields. Hierarchical Maps does not use a normal agent prompt or separate agent-model call; configure and build the map from the target chat instead.

### Roleplay

1. Open the Roleplay chat.
2. Open **Chat Settings** with the gear button.
3. Find **Agents** and turn on **Enable Agents**.
4. Under **Tracker Agents**, enable **Hierarchical Maps** for this chat.
5. Scroll back to the **Hierarchical map** setting that this adds.
6. Click **Edit hierarchical map**, then **Create map** if the empty-state prompt appears.

### Game

You can select Hierarchical Maps while creating a game, or add it later from that game's **Chat Settings → Agents** section. When selected during setup, Marinara can prepare a hierarchy from the accepted game world for you to review before play.

If you skip the generated map during setup, you can still build one later from Chat Settings.

## Understand the map editor

On a desktop, the editor shows three panes together. On a narrow screen, use the **Hierarchy**, **Local**, and **Details** tabs.

- **Hierarchy** shows the complete location tree. Select a location to edit it. **Enter** changes which part of the hierarchy you are viewing; it does not move the story.
- **Local** shows the selected location's immediate children as a map, ordered layers, or a list.
- **Details** edits the selected location, its lore, parent, display style, direct links, and status.

The editor header contains **Build with AI** or **Expand with AI**, **Export**, **Import**, the Enabled switch, and **Save**. Unsaved changes are marked **Unsaved**. Leaving the editor with unsaved work asks whether to discard it.

## Draft a map with AI

From an empty map, click **Draft with AI**. For an existing map, click **Expand with AI**.

### Choose what the builder reads

Under **Build from**, choose one of these sources:

- **Game setup** uses the current setup and characters. In a Roleplay chat, this means the chat setup and character cards. In a Game chat, it also uses the world overview and party characters.
- **Selected lore** lets you choose one or more available lorebooks. **Strict canon** creates only lore-backed places. **Canon + expansion** allows the AI to add fitting places around the selected lore.

The builder does not read turn history. Use the optional **What should this world include?** or **What should be added?** box for details that are not already in the setup or selected lore.

Choose a size:

| Size       | Approximate result |
| ---------- | ------------------ |
| **Small**  | 8 places           |
| **Medium** | 16 places          |
| **Large**  | 28 places          |

Click **Generate draft** or **Generate expansion**. Generation does not save anything yet.

The current **Draft preview** is a summary, not a browsable preview of the complete hierarchy. It normally shows only the first or top-level generated location, its direct-place count, and validation or lore-source details. You cannot open its sublevels from this screen.

### Apply and review the result

Click **Use this draft** for a new map or **Add to working map** for an expansion. This loads the complete result into the unsaved map editor; it does not enable or save it. The hierarchy may initially look collapsed, so expand its disclosure arrows and select locations in the Hierarchy pane to inspect their children, descriptions, private memory, links, layers, and map positions.

If you do not like a new, unsaved draft, use **Back to chat** and confirm **Discard changes**. Reopen **Edit hierarchical map** and run **Draft with AI** again. The AI builder cannot generate over the dirty working draft, so discarding and reopening is the current way to start over without saving it.

If a map exists but the story has no committed map history yet, the AI builder can also **Replace draft**. After the campaign has used the map, replacement is protected: expand the existing hierarchy instead so saved turns keep referring to the same location IDs.

For a saved map that has not been used in a turn, open **Expand with AI**, choose **Replace draft**, and generate a replacement. Once committed history exists, Marinara allows expansion but not wholesale replacement. Export the map before major restructuring.

## Build or edit a map manually

From an empty map, click **Build manually**. Marinara creates one broad starting location. Select it in the hierarchy, then use:

- **Add child** for a place inside the selected location.
- **Add sibling** for a place beside it under the same parent.
- **Duplicate** to copy a location subtree and then edit it.
- **Archive** to retire a location without erasing historical references.

Each location has these main fields:

- **Name** and **Icon** identify it in the editor and world map.
- **Kind** can be Region, Settlement, Place, Building, Floor, or Room.
- **Public description** describes the active place in location context.
- **Private model memory** gives the AI facts that should be active only at this location.
- **Awareness summary** is a short orientation cue.
- **Parent** controls where the location sits in the hierarchy.
- **Child presentation** displays its immediate children as a List, Map, or Layers.

For **Map** presentation, each child can have **Map X** and **Map Y** positions from 0 to 100. For **Layers**, give every child a distinct layer order.

### Add travel routes

A location is automatically reachable from its parent or its active children. Use **Direct links** for other routes, such as a ferry between two towns or a secret passage between rooms.

1. Select the source location.
2. Under **Direct links**, choose another location and click **Link**.
3. Add an optional direction label.
4. Choose **Available**, **Hidden**, or **Blocked**.
5. Turn on **Both ways** if travel should work in either direction.

Only available links appear as travel choices. A one-way link must be added from the location where the trip begins.

### Set the starting location and save

Select the location where the story begins and click **Set as starting location** under **Location status**. A map needs an active starting location before it can be enabled.

Switch the header control to **Enabled**, then click **Save**. If the editor reports issues, fix them before saving.

## Link lore to locations

Hierarchical Maps uses lore in two different ways:

1. The AI builder can read selected lorebooks while drafting or expanding the hierarchy.
2. A saved location can activate specific lore entries while that exact location is current.

To attach runtime lore:

1. Select a location and open **Linked lore** in the Details pane.
2. Search the available entries.
3. Click an entry to attach it.
4. Save the map.

Linked entries do not pass automatically from parent to child. Lore attached to Brinewatch does not activate while the current location is the Tideglass Inn unless you attach that entry to the inn too.

Disabled lorebooks, disabled entries, and lorebooks excluded from the chat are unavailable to the map. The editor keeps unavailable or missing references visible so you can repair or detach them, but they are not sent to the model.

## Move during a story

Selecting a destination queues a move; it does not change the current location immediately. The move is committed together with the next message you send. This keeps the location and the turn in sync when you branch, regenerate, or change swipes.

Valid destinations are:

- the current location's parent;
- active children of the current location; and
- destinations connected by an available direct link.

Only one hierarchical move can be committed with a turn.

### Roleplay travel

The **Story location** panel appears above the message box.

1. Open **Story location** to see **Leave**, **Enter**, and **Routes**.
2. Choose a destination.
3. Confirm that its status says **Moves with your next turn**.
4. Type and send your message.

Use the X on the pending destination to cancel it before sending. If the map or current location changed after you selected the destination, the status becomes **Needs review**. Open the picker and choose again.

### Game travel

Game Mode adds a **Hierarchical world map**. **You are here** marks the current story location.

- Select a place to read its description.
- Use **Explore** to browse inside a location. Browsing does not move the party.
- Use **Browse up** or the breadcrumb to view another part of the hierarchy.
- Use **Center current story location** to return to the party's position.
- Click **Set destination** when the selected place is reachable, then send the next turn.

If a place says **Browse only from here**, it is not reachable in one move from the current location. Browse back and choose an available parent, child, or direct route.

## Hierarchical world map versus the Game map

Game Mode can show two map systems:

- **Hierarchical Maps** tracks the authoritative story or world location, such as `The Shattered Coast → Brinewatch → Tideglass Inn`.
- The regular Game grid or node map tracks local, tactical movement inside that story location and also participates in Game time and weather.

An AI-written arrival or a regular Game map marker cannot change the hierarchical location on its own.

For advanced Game setups, a saved hierarchical location has a **Game map binding** section. You can bind a whole Game map, one grid cell, or one node to that story location. Selecting a bound Game position stages a hierarchical move; unbound positions keep normal tactical movement.

Save the hierarchy before changing bindings. A binding can be cleared later without deleting either map.

## Import, export, and archive safely

Use **Export** to download the working hierarchy as a `.hierarchical-map.json` file. Export before a major edit if you want a small, map-only backup.

Use **Import** to load a hierarchy into the working copy. Review it and click **Save** to make it authoritative. Import does not save immediately.

Once campaign history refers to a map, an imported map must retain every existing location ID. Add or update locations instead of replacing the hierarchy with unrelated IDs.

Archiving preserves old references. Before archiving:

- move or archive its active children;
- choose another active starting location if needed; and
- choose an active replacement if it is the current runtime location.

Archived locations can be restored from the Details pane.

## Troubleshooting

### Hierarchical Maps is missing from Chat Settings

Check that the package is installed, that Marinara was restarted after installation, and that the chat is Roleplay or Game. In the chat, turn on the **Enable Agents** master switch, open **Tracker Agents**, and enable **Hierarchical Maps**. Then scroll back to the **Hierarchical map** setting that appears.

### The map cannot be enabled

Create at least one active location and set an active starting location. Resolve every issue shown at the top of the editor, then enable and save again.

### AI generation is unavailable

Make sure the chat has a working language-model connection. Save or discard existing editor changes before opening the AI builder. For an expansion, choose an active location under **Expand beneath**. For lore-grounded generation, select at least one enabled, non-excluded lorebook.

### The Draft preview shows only one location

The current preview shows only a top-level summary and cannot expand the generated sublevels. Click **Use this draft** to load the full result into the unsaved editor, expand the hierarchy, and inspect it before enabling or saving. If you reject it, leave the editor, choose **Discard changes**, reopen the editor, and generate again.

### A destination cannot be selected

The place must be the current location's parent, an active child, or the target of an available direct link. **Explore** and editor **Enter** only browse the map. They do not bypass travel rules.

### A queued destination says Needs review

The definition or current location changed after the destination was chosen. Open the destination picker, review the current path, and select the destination again.

### The AI ignores the map

Confirm that Hierarchical Maps is active for the chat, the hierarchy is **Enabled**, and the latest changes were saved. Also confirm that a current location appears in the **Story location** panel.

### Linked lore does not activate

Confirm that the entry is attached to the exact current location. Check that the entry and its lorebook are enabled and that the lorebook is not excluded from the chat.

## Related guides

- [Agents: AI Helpers for Your Chats](agents-overview.md)
- [Downloadable Agents Reference](built-in-agents.md)
- [Lorebooks](../lorebooks/overview.md)
- [Roleplay Mode: Getting Started](../roleplay/getting-started.md)
- [Game Mode: Getting Started](../game/getting-started.md)
- [Game Mode: Map, Time, and Weather](../game/map-time-weather.md)
