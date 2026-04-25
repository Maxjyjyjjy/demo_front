---
name: The Design System
colors:
  surface: '#f9f9fc'
  surface-dim: '#d9dadd'
  surface-bright: '#f9f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f6'
  surface-container: '#edeef1'
  surface-container-high: '#e7e8eb'
  surface-container-highest: '#e1e2e5'
  on-surface: '#191c1e'
  on-surface-variant: '#41484d'
  inverse-surface: '#2e3133'
  inverse-on-surface: '#f0f0f4'
  outline: '#71787e'
  outline-variant: '#c1c7ce'
  surface-tint: '#2e6385'
  primary: '#2e6385'
  on-primary: '#ffffff'
  primary-container: '#a5d8ff'
  on-primary-container: '#285f80'
  inverse-primary: '#9accf3'
  secondary: '#2f6a3f'
  on-secondary: '#ffffff'
  secondary-container: '#b2f2bb'
  on-secondary-container: '#357044'
  tertiary: '#75565f'
  on-tertiary: '#ffffff'
  tertiary-container: '#f0c8d2'
  on-tertiary-container: '#70525a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c9e6ff'
  primary-fixed-dim: '#9accf3'
  on-primary-fixed: '#001e2f'
  on-primary-fixed-variant: '#0c4b6c'
  secondary-fixed: '#b2f2bb'
  secondary-fixed-dim: '#96d5a0'
  on-secondary-fixed: '#00210b'
  on-secondary-fixed-variant: '#145129'
  tertiary-fixed: '#ffd9e2'
  tertiary-fixed-dim: '#e4bcc6'
  on-tertiary-fixed: '#2b151c'
  on-tertiary-fixed-variant: '#5b3f47'
  background: '#f9f9fc'
  on-background: '#191c1e'
  surface-variant: '#e1e2e5'
typography:
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  h3:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-xs:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-padding: 20px
  gutter: 12px
---

## Brand & Style

The design system is centered on a "Gentle Productivity" philosophy. It aims to transform the often-stressful nature of schedule management into a calm, encouraging experience. The brand personality is approachable and supportive, utilizing a Soft Minimalist aesthetic that prioritizes clarity and breathing room. 

The visual direction avoids harsh lines and high-contrast triggers, instead opting for a "cloud-like" interface where elements feel light and tactile. This approach reduces cognitive load and visual fatigue, making the daily routine of checking course schedules feel like a moment of mindfulness rather than a chore.

## Colors

The palette is built on a foundation of "Fresh Pastels." Rather than using a single brand color, the design system utilizes a quad-color module system to categorize course types or time blocks.

- **Primary (Sky Blue):** Used for core navigation and "Core" subjects.
- **Secondary (Mint):** Used for labs, practical sessions, or "Completed" states.
- **Tertiary (Pale Pink):** Used for creative workshops or urgent deadlines.
- **Quaternary (Soft Yellow):** Used for extracurriculars or elective modules.

Backgrounds remain strictly clean white or very light gray to ensure the pastel modules pop without vibrating against the page. Neutral tones are used sparingly to maintain the "soft" threshold of the interface.

## Typography

This design system utilizes **Plus Jakarta Sans** for all levels of hierarchy. Its modern, rounded terminals provide a friendly and optimistic tone that aligns with the "Soft" brand style. 

Headlines are set with tight letter-spacing and heavier weights to provide a clear anchor for the eye. Body text maintains generous line-height to ensure readability, especially when viewing dense schedules. Labels and small metadata should be set in semi-bold or bold to ensure they remain legible even at smaller scales on mobile devices.

## Layout & Spacing

The layout follows a fluid-first approach optimized for mobile mini-programs. It uses a soft 8px grid system for general components and 4px for internal padding within small elements.

Content is housed within a central container with 20px side margins to prevent elements from touching the screen edges. Vertical rhythm is driven by the 16px (md) unit, creating a sense of order without looking overly rigid. White space is treated as a functional element—generous gaps between different days or course categories help the user distinguish their schedule at a glance.

## Elevation & Depth

Depth in the design system is achieved through **Ambient Shadows**. Instead of harsh, dark shadows, this system uses low-opacity, highly diffused shadows that are often tinted with the color of the element they sit beneath.

- **Level 1 (Static Cards):** A very light 4px blur, 5% opacity shadow to separate white cards from light gray backgrounds.
- **Level 2 (Draggable Modules):** An increased 12px blur, 8% opacity shadow. When a user interacts with a module to drag it, the shadow expands to simulate the element lifting off the surface.
- **Interactive States:** Subtle inner shadows can be used for "pressed" states to create a tactile, squishy feel without resorting to full skeuomorphism.

## Shapes

The shape language is consistently rounded to reinforce the approachable and friendly nature of the system. 

- **Course Modules:** Use `rounded-lg` (16px) to create a distinct, toy-like feel that suggests they can be easily grabbed and moved.
- **Time Slots:** Use a more subtle `rounded-sm` (4px) to maintain a structural, timeline-like appearance.
- **Buttons and Chips:** Use full pill-shaping (rounded-full) for high-action items to differentiate them from information modules.

## Components

### Course Modules (Cards)
The hero component of the design system. These use the pastel palette as background colors. They feature a high corner radius (16px) and a subtle handle icon (usually two or three horizontal lines) to indicate draggability. Text within cards should use the `h3` for the course name and `body-md` for location or time.

### Time-Slot Track
A vertical list utilizing the `background_alt` (light gray) as a background track. Time indicators are placed to the left in `label-sm` weight, with course modules snapping to the right of these indicators.

### Status Chips
Pill-shaped elements used within cards to denote "Live," "Upcoming," or "Cancelled." These should use a slightly more saturated version of the card's pastel color to remain visible but harmonious.

### Action Buttons
Primary buttons use a soft gradient of the primary blue or a solid pastel with a soft shadow. They are always pill-shaped and utilize the `h3` or `body-lg` font size for high touchability.

### Input Fields
Soft-edged rectangles with a `background_alt` fill rather than a heavy border. The focus state is indicated by a soft 2px glow in the primary blue color.