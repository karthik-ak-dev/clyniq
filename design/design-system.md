# DoctorRx Design System (from Figma — TeamHub Template)

> Source: Peterdraw TeamHub HR Management Dashboard (adapted for DoctorRx)
> Last updated: 2026-04-10

---

## Color Palette

### Primary (Green/Teal)
| Token            | Hex       | Usage                                      |
|------------------|-----------|---------------------------------------------|
| `dark-green`     | `#0E4D41` | Sidebar background, dark text               |
| `green`          | `#35BFA3` | Primary accent, active states, CTA buttons  |
| `light-green`    | `#E4F2D3` | Light badge background                      |
| `subtle-green`   | `#F8FCF3` | Very light green tint                       |

### Neutrals
| Token              | Hex       | Usage                                     |
|--------------------|-----------|-------------------------------------------|
| `black`            | `#203430` | Headings, primary text                    |
| `dark-grey`        | `#63716E` | Secondary text, labels ("Job Title", etc) |
| `light-grey`       | `#A4ACAB` | Placeholder text, muted content           |
| `semi-subtle-grey` | `#E5E6E6` | Borders, dividers                         |
| `subtle-grey`      | `#F7F7F7` | Page background                           |
| `white`            | `#FFFFFF` | Card backgrounds                          |

### Status Colors
| Token          | Hex       | Usage                         |
|----------------|-----------|-------------------------------|
| `red`          | `#E63D4B` | Error, Absent badge           |
| `subtle-red`   | `#FAEFF0` | Light red background          |
| `yellow`       | `#F8C947` | Warning, On Leave badge       |
| `light-yellow` | `#FDF5DF` | Light yellow background       |

---

## Typography

### Font Family
**Plus Jakarta Sans** (Google Fonts)
- Weights: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold)
- Line height: ~120% for headings, ~130% for body

### Scale
| Style              | Size | Weight   | Line Height | Usage                        |
|--------------------|------|----------|-------------|------------------------------|
| Heading/40-Bold    | 40px | Bold     | 120%        | Hero headings (unused in app)|
| Heading/28-Bold    | 28px | Bold     | 120%        | Page titles                  |
| Heading/24-Bold    | 24px | Bold     | 120%        | Section headings             |
| Heading/24-Semi    | 24px | SemiBold | 120%        | Section headings (alt)       |
| Heading/20-Bold    | 20px | Bold     | 120%        | Card titles                  |
| Heading/18-Bold    | 18px | Bold     | 120%        | Employee/Patient name        |
| Heading/18-Semi    | 18px | SemiBold | 120%        | Sub-headings                 |
| Heading/16-Semi    | 16px | SemiBold | 120%        | Small headings               |
| Body/16-Regular    | 16px | Regular  | 130%        | Body text                    |
| Body/14-Medium     | 14px | Medium   | 130%        | Info values (department, etc)|
| Body/14-Regular    | 14px | Regular  | 130%        | Body text                    |
| Body/12-Medium     | 12px | Medium   | 130%        | Small labels                 |
| Body/12-Regular    | 12px | Regular  | 130%        | Secondary info, EMP IDs      |
| Body/11-Bold       | 11px | Bold     | 130%        | Badge text                   |
| Body/11-Medium     | 11px | Medium   | 130%        | Small muted text             |
| Bio/16-SemiBold    | 16px | SemiBold | 130%        | Bio text emphasis            |
| Bio/14-Medium      | 14px | Medium   | 130%        | Bio info                     |

---

## Component Specs

### Sidebar (Desktop)
- Width: ~245px
- Background: `#0E4D41` (dark-green)
- Logo: White text + green icon
- Nav items:
  - Inactive: white text, 14px Regular, no background
  - Active: `#35BFA3` bg pill, white text, 14px Medium, rounded-lg
  - Hover: subtle white overlay
- Bottom: promotional card (we'll adapt for doctor profile)
- Hidden on mobile (show bottom nav instead)

### Top Header Bar
- Background: white
- Left: Page title (breadcrumb "Dashboard / Employees")
- Right: Settings icon, notification bell, user avatar + name
- Border-bottom: 1px `#E5E6E6`

### Patient/Employee Grid Card
- Background: `#FFFFFF`
- Border: 1px `#E5E6E6`
- Border-radius: 12px
- Padding: ~20px
- Shadow: none (flat cards with border)
- Layout (top to bottom):
  1. Avatar (circular, 64px, green border ring `#35BFA3`)
  2. ID text (12px Regular, `#A4ACAB`)
  3. Name (18px Bold, `#203430`)
  4. Info rows: "Job Title: X" / "Department: Y" (12px labels `#63716E`, 14px values `#203430`)
  5. Tag row: badge pills at bottom
- Grid: 4 columns desktop, 2 columns tablet, 1 column mobile

### Badges/Tags
- Border-radius: 9999px (full pill)
- Padding: 4px 12px
- Font: 11px Bold
- Variants:
  - **Active**: bg `#35BFA3`, text white
  - **Absent**: bg `#E63D4B`, text white
  - **On Leave**: bg `#F8C947`, text `#203430`
  - **Type tags** (Full-Time, Remote, etc.): border 1px `#E5E6E6`, bg white, text `#203430`, 11px Medium
  - **Condition**: Diabetes/Obesity → teal outlined or filled

### Search Bar
- Background: white
- Border: 1px `#E5E6E6`
- Border-radius: 8px
- Padding: 10px 16px
- Left icon: search (grey)
- Placeholder: `#A4ACAB`
- Font: 14px Regular

### Filter Dropdowns
- Background: white
- Border: 1px `#E5E6E6`
- Border-radius: 8px
- Padding: 8px 12px
- Font: 14px Medium
- Chevron icon right
- Text: `#203430`

### Primary Button ("New Employee" / "Add Patient")
- Background: `#35BFA3`
- Text: white, 14px SemiBold
- Border-radius: 8px
- Padding: 10px 16px
- Hover: darken slightly

### Pagination
- Number pills: 32px x 32px, rounded-lg
- Active: bg `#35BFA3`, text white
- Inactive: bg transparent, text `#63716E`
- Arrows: `<` `>` buttons

### Avatar (circular)
- Size: 64px on cards, 40px on header, 32px on sidebar
- Border: 3px solid `#35BFA3` (green ring)
- Fallback: initials on gradient bg

---

## Spacing System
- Page padding: 24px (desktop), 16px (mobile)
- Card gap: 20px (desktop), 16px (tablet), 12px (mobile)
- Card inner padding: 20px
- Section gap: 24px
- Element gap (within cards): 8px-12px

---

## Breakpoints
| Name    | Width   | Grid Cols | Sidebar |
|---------|---------|-----------|---------|
| Mobile  | < 768px | 1         | Hidden (bottom nav) |
| Tablet  | 768-1024px | 2      | Hidden (bottom nav) |
| Desktop | > 1024px | 4        | Visible |

---

## Mapping: Figma → DoctorRx

| Figma (HR)         | DoctorRx              |
|---------------------|-----------------------|
| Employee            | Patient               |
| EMP-0234            | Patient ID / condition|
| Job Title           | Condition             |
| Department          | Compliance Score      |
| Full-Time/Hybrid    | Diabetes/Obesity tags |
| Active/Absent       | On Track/High Risk    |
| New Employee button  | Add Patient button    |
| All Department filter| All Conditions filter |
| All Position filter  | All Statuses filter   |
