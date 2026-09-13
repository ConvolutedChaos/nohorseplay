# macsim — an interactive OS X El Capitan desktop

Static: open `index.html`. No build step, no dependencies.

## Icons

`assets/icons/<size>/<name>.png` — El Capitan's own icon library, extracted
from the system .icns files by `assets/icons/convert.py`. Sizes 16, 18, 32,
36, 64, 128, 256, 512 and 1024 are present (the `_<hash>` files are the
retina cuts stored alongside; nothing references them).

The set is not uniform: the sidebar templates stop at 64, some icons only
exist small, and the Trash is even named differently at different sizes
(`TrashIcon` / `FullTrashIcon` at most sizes, `trash` / `trash-full` at 128
and 256). So `js/icon-manifest.js` records which sizes each name actually
ships at, and `sysIconSrc()` looks the name up there and takes the nearest
cut at or above the size it is drawing at. **Regenerate that manifest if the
icon set changes** — it is a plain map of name to size list.

What draws from the library now:

| where | icons |
| --- | --- |
| Dock | the app icons at 128, plus `trash` / `trash-full` |
| Finder sidebar | the `Sidebar*` templates at 16, drawn at 55% (they are black with an alpha channel, which is how the real Finder tints them) |
| folders | `GenericFolderIcon` and every stock folder — Desktop, Documents, Downloads, Movies, Music, Pictures, Public, Home, Applications, Library, System, Users, Utilities |
| documents | `ClippingText`, `ClippingSound`, `ClippingPicture`, `GenericURLIcon`, `GenericFontIcon`, `VCard`, `KEXT`, `GenericDocumentIcon` |
| archives | `bah-*` — Archive Utility's own icon per format: zip, gz, bz/bz2/bzip2, tar, tgz, tbz/tbz2, xz/txz, z, cpio, cpgz, pax, uu, hqx, xip, as, bin |
| Go menu | the colour folder icons, `AllMyFiles`, `AirDrop`, `iDiskGenericIcon`, `GenericNetworkIcon`, the MacBook Pro for Computer |
| alerts | `AlertCautionIcon` with `Finder` peeking out behind it; `Finder` alone for Delete Immediately |
| Get Info | the file's own icon, and `UserIcon` / `GroupIcon` / `Everyone` under Sharing & Permissions |
| AirDrop and iCloud Drive | `AirDrop`, `iDiskGenericIcon` |
| Spotlight | the Dictionary and Calculator app icons, `GenericURLIcon` for bookmarks |
| Help menu | `HelpIcon`, `GenericWindowIcon` |
| About This Mac | `SystemLogo` (Overview), `com.apple.macbookpro-13-retina-display` (Displays, Support), `CDAudioVolumeIcon` (Storage), `UtilitiesFolder` and `AppleCareBox` (Service) |
| Desktop and Finder volumes | `Drive-Internal` for Macintosh HD (`Drive-External` and `Drive-Removable` ship in the set for any volume with `external: true`, but nothing is currently mounted that uses them) |

Three apps are named after their artwork rather than their id, which is what
the `icon:` field in `APPS` / `EXTRA_APPS` is for: `safari → compass`,
`textedit → text-edit`, `Time Machine → backup` (and `finder → Finder`,
capitalised).

Still drawn rather than loaded, because the library has no artwork for them:
the PDF / movie document badges, the Wi-Fi, Spotlight and Notification
Center menu extras, the Finder toolbar glyphs, and the Apple logo. Everything else comes out of the set, and Disk
Utility, Terminal, Activity Monitor and Grab still fall back to a lettered
tile since the set has no icon for them.

## Cursors

`assets/cursors/` holds El Capitan's own pointer set, pulled from each
cursor's `cursor.pdf` + `info.plist` the same way the icons were (see
`ref_pic/.../cursors/convert_cursors.py`) and converted to SVG. Apple never
exposes the spinning wait cursor or the plain arrow as an `NSCursor`, so
those two (`main-pointer.png`, `spinner.png`) are cropped screenshots
instead, scaled down in `js/cursor-data.js` to sit in the same size family
as the vector set.

A real `cursor:` CSS property can't animate, and several of these
(`busybutclickable`, `countingdownhand`, `countingupandownhand`,
`countinguphand`) are genuinely animated — Apple stores their frames
stacked in one tall image with a frame count and a delay in the plist. So
`base.css` turns the native cursor off (`cursor: none`) and
`js/cursors.js` stands in for it with one `<img>` that follows the mouse:
`js/cursor-data.js` is the manifest (hotspot, one frame's size, frame
count/delay, and the drop-shadow CoreGraphics draws under it, all read
straight from the plists — three cursors draw no shadow at all, and this
keeps that faithful instead of guessing one in). An element opts in with
`data-cursor="<name>"`; nothing claiming the pointer falls back to
`main-pointer`. Every cursor scales from its own hotspot (`--cs`, bumped by
`CURSOR_SCALE`) so a future "larger cursor" accessibility setting can grow
it without the hot pixel drifting off the thing it's pointing at.

Only the one spot that already had a `cursor:` rule uses this today — the
window resize grip, now `resizenorthwestsoutheast` instead of the browser's
`nwse-resize`. The rest of the set (hands, i-beam, zoom, crosshair, and the
beachball) is wired up and ready but nothing else in the sim claims a
`data-cursor` yet.

## Measured against the reference

Every dimension below was read off the 1280x800 reference screenshots in
`ref_pic/` (pixel maps, edge scans and icon fitting) rather than eyeballed,
and the sim is verified back against them the same way.

**Dock** — panel x 101..1178, top y 723, so 1078 x 77. Icon art is 61px on a
65px pitch, first centre 137, last app centre 1047, Trash centre 1142. Icons
sit 6px below the panel top and 10px above the screen edge. The running dot
is 4x4, four pixels under the icon. The rule before the Trash is a single
dark column at x 1095 running y 733..789.

**Launching an app** — traced from `ref_pic/app open.mp4`, a 96x174 60fps
recording of one icon. Holding the button down multiplies the icon's
brightness by 0.43; releasing throws it 17px up and lets it fall back over
690ms, apex at 48%. Tracking the icon frame by frame fits a parabola — a
ballistic toss — to within 0.4px, so the rise is a quadratic ease-out and the
fall its mirror, and it bounces exactly once. The tooltip rides up with the
icon, the running dot (which appears as the bounce starts) stays put, and a
click on an app that is already open does not bounce at all. Replayed back
against the recording, our curve tracks it to a mean of 0.3px.

**Menu bar** — 22px tall over a 1px border. 10px inset, then the Apple item
(glyph 13x16 at x 21) and titles at 9px padding, 14px text with the app name
semibold: Finder 55, File 117, Edit 158, View 201, Go 251, Window 288,
Help 358 — all reproduced to the pixel.

**Finder windows** — the unified bar is 22px of title over a 32px toolbar
row, closed by a 1px #979697 rule; toolbar controls are 24px capsules and
the selected view segment is a dark fill with a white glyph. The sidebar is
138px with 26px rows, and its selection is a grey wash, not the list blue.
List rows are 19px under a 23px header whose stripes carry on past the last
file; icon view is a 134 x 112 grid of 64px icons with 12px/16px labels --
the same metrics as the desktop, which the View Options panel confirms
("Icon size: 64 x 64", "Text size: 12").

**Selection and renaming** — from the 12.00 shots: a selected icon in a
window sits on a 72 x 72 #e0e0e0 block with its name in a #2168d6 pill; on
the desktop the block is white at 26% instead, and the pill goes #d0d0d0
with black text the moment a window takes the focus. Renaming replaces the
label with a white box in a blue focus ring that shows the *whole* name,
wrapping over as many lines as it needs.

**Alerts** — a sheet with no title bar, centred on the window it belongs to:
icon at the left, bold first line, lighter second, buttons bottom right.
Two icons and either default: Empty Trash uses the caution triangle with the
Finder peeking out behind it and a blue Empty Trash; Delete Immediately uses
the plain Finder icon and makes *Cancel* the default.

**Menu extras** — boxes 34, 26, 32, 33, 35, 87, 31 and 49 wide, which lands
Time Machine's glyph at x 961 and leaves the notification lines 23px clear of
the right edge. Time Machine, Bluetooth, volume and battery are Apple's own
menu extra artwork from `assets/icons/menubar/` (PDFs converted to SVG,
drawn at their page size in points and centred in the box): `TMIdle`,
`Bluetooth_Idle` / `Bluetooth_Off`, `Volume1`–`Volume4` by level (1 is
muted), and for the battery either `BatteryCharging` /
`BatteryChargedAndPlugged` on power or the `BatteryEmpty` shell with the
level built from the 2x8 `BatteryLevelCap` slices (left, a stretched
middle, right; the red `R` set at 10% and under). Wi-Fi 20x15, Spotlight
15x15 and notifications 18x10 are still traced from their pixel maps. Time
Machine draws dimmed, as it does unconfigured.

**Menus** — 19px rows with the text ink 4px down, 14px type, labels 22px in,
shortcuts 10px from the right, and a 12px separator block with its hairline
centred. The Apple menu's panel edge lines up with its title's, at x 10.

**Desktop icons** — a 122 x 112 grid, right-hand column centred 65px from the
screen edge, top row's art box at y 31. An image icon is a 52x32 thumbnail in
a 3px white frame (58 x 38 overall), and labels are 12px on a 16px line,
middle-truncated the way Finder does it.

## What works

- **Menu bar** — Apple, Finder, File, Edit, View, Go, Window, Help, with real
  submenus, shortcut glyphs, and rows that grey out when nothing is selected.
  Press a title and drag across the bar to switch menus, as on the real thing.
  Help searches the current app's own menu commands.
- **Menu extras** — Time Machine, Bluetooth, Wi-Fi (with the network list),
  volume (a working vertical slider), battery (reads real hardware when the
  browser exposes it; Show Percentage toggles), clock (analog or digital).
- **Spotlight** — ⌘Space or the magnifier. Apps, files, bookmarks, a
  definition row, and arithmetic. Arrow keys move, Return opens.
- **Notification Center** — the menu icon at the far right; Today and
  Notifications, and the desktop slides aside for it.
- **Desktop** — click, shift-click, rubber-band select, drag, drag to the
  Trash, rename in place (Return), Get Info, Clean Up / Sort By, and the
  background menu in the order the reference lists it -- Paste simply absent
  when there is nothing to paste, and no shortcuts on the context-menu
  submenus.
- **Files** — a new folder is "untitled folder", then "untitled folder 2";
  renaming onto a name that is taken is refused with the Finder's own alert.
- **The Trash** — its window carries the Trash bar with the Empty button, and
  its items get their own menu: Put Back, Delete Immediately… (with the
  Cancel-default warning), Reveal in Finder. **Put Back** plays the copy
  sound, returns the file to the folder it came from, and opens a new window
  there with the item selected, exactly as the real one does.
- **Dock** — magnification, tooltips, running dots, bounce on launch, and
  right-click menus on items, the Trash and the Dock itself.
- **Finder** — tabs (each with its own folder, view, selection and history),
  all four views (icons, list with sortable columns, columns with a preview
  pane, Cover Flow), a sidebar of Favourites, Devices and Tags, search that
  opens its own tab with a scope bar, toolbar help tags, and the Arrange,
  Action, Share and Tags menus. AirDrop and iCloud Drive are places with
  their own empty states, and tagging a file files it under that tag.
- **Panels** — Get Info with its disclosure sections (renaming from the Name
  & Extension field works), Quick Look (space or ⌘Y), Show View Options with
  a live icon-size slider, the tag popover, Go to Folder, Connect to Server,
  About Finder, Mac Help, the Clipboard window, Emoji & Symbols, and alerts
  laid out with the caution icon on the left.
- **Windows** — drag, resize, traffic lights, zoom, minimise into the Dock,
  stacking, About This Mac and Force Quit.
- **Power** — Sleep, Restart, Shut Down and Log Out from the Apple menu.
  Sleep goes straight to sleep; the other three put up the 11.01 shots'
  confirmation panel (Apple's 112px artwork from `assets/icons/112/`, a
  60-second countdown that goes ahead on its own, the remembered "Reopen
  windows when logging back in" checkbox, Return / Esc).

## Keyboard

⌘Space Spotlight · ⌘N new Finder window · ⌘W close · ⌘M minimise ·
⌘A select all · ⌘I Get Info · ⌘D duplicate · ⌘Z undo · ⌘⌫ move to Trash ·
⌘Q quit · Return rename · Esc dismiss.

## Layout

    css/   base, menubar, menus, desktop, window, dock, spotlight,
           notification-center
    css/   base, menubar, menus, desktop, window, finder, panels, dock,
           spotlight, notification-center
    js/    core (helpers, icons, clock) · fs (apps, file system, artwork) ·
           menu (the menu engine) · windows · finder (tabs + the four views) ·
           panels (Get Info, Quick Look, dialogs) · desktop · menubar ·
           extras · dock · spotlight · notifications ·
           cursor-data + cursors (the custom pointer) · start
    assets/fonts   SF UI Text / Display
    assets/img     wallpaper.jpg
    assets/icons   your icon PNGs go here
    assets/cursors your cursor SVGs/PNGs + cursors.json go here
