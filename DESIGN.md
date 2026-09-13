# Design Brief

## Direction

Warzone Vault — a dark, tactical marketplace for buying and selling Call of Duty accounts, styled like a military loadout dossier.

## Tone

Dark-only, high-contrast, tactical HUD aesthetic — deep charcoal-navy surfaces with a neon emerald primary and amber prestige accent, executed with sharp angular precision.

## Differentiation

Every listing card reads as a military dossier: a neon-emerald top-edge accent line, mono rank/price readouts, and sharp 8px corners that make the browse grid feel like a weapons loadout wall.

## Color Palette

| Token      | OKLCH          | Role                        |
| ---------- | -------------- | --------------------------- |
| background | 0.13 0.02 250  | deep charcoal-navy canvas   |
| foreground | 0.95 0.01 250  | primary text                |
| card       | 0.17 0.02 250  | listing/dossier surfaces    |
| primary    | 0.72 0.19 150  | neon emerald CTA / HUD      |
| accent     | 0.78 0.17 75   | amber prestige highlight    |
| muted      | 0.21 0.02 250  | secondary surfaces          |
| border     | 0.27 0.02 250  | hairline separators         |

## Typography

- Display: Space Grotesk — headings, listing titles, hero, section headers
- Body: DM Sans — paragraphs, UI labels, descriptions
- Mono: JetBrains Mono — prices, rank tiers, prestige, stat readouts
- Scale: hero `text-5xl md:text-7xl font-bold tracking-tight`, h2 `text-3xl md:text-5xl font-bold tracking-tight`, label `text-sm font-semibold tracking-widest uppercase`, body `text-base`

## Elevation & Depth

Card surfaces sit one step above the canvas with a hairline border and a soft elevated shadow; interactive cards lift with `shadow-elevated` on hover, no neon glows.

## Structural Zones

| Zone    | Background  | Border   | Notes                                    |
| ------- | ----------- | -------- | ---------------------------------------- |
| Header  | bg-card     | border-b | sticky nav, emerald logo mark            |
| Content | bg-background | —      | browse grid + alternating muted sections |
| Footer  | bg-muted/40 | border-t | account/legal links, muted text          |

## Spacing & Rhythm

Section gaps `py-16 md:py-24`, card grids `gap-6`, micro-spacing `space-y-2` inside cards; generous whitespace around the hero, tighter density in the browse grid.

## Component Patterns

- Buttons: sharp `rounded-md`, emerald primary / ghost secondary, hover lift + brightness
- Cards: `rounded-lg` 8px, `bg-card`, `shadow-subtle` resting, `shadow-elevated` on hover, emerald top accent line
- Badges: `rounded-sm` mono uppercase, emerald for rank tier, amber for prestige, muted for platform

## Motion

- Entrance: `animate-fade-up` staggered 60ms on grid cards
- Hover: card `shadow-elevated` + `border-primary/40` at 200ms
- Decorative: none — restrained, functional motion only

## Constraints

- Dark mode only; no light theme
- Token-only colors, no raw hex/rgb literals in components
- No neon/glow shadows — depth via elevation not glow
- Mono readouts reserved for price, rank, and prestige stats

## Signature Detail

The neon-emerald top-edge accent line on every dossier card — a single sharp stroke that ties the whole marketplace to a tactical HUD identity.
