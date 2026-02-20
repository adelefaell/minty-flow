

This skill guides creation of distinctive, production-grade **mobile frontend interfaces** that avoid generic "AI slop" design. Implement real working code with exceptional attention to aesthetic details and creative choices, optimized for touch, gestures, and small screens.

The user provides mobile requirements: a screen, flow, application, or component to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a **BOLD mobile aesthetic direction**:
- **Purpose**: What problem does this interface solve? Who uses it on a phone?
- **Tone**: Pick an extreme: brutally minimal, playful toy-like, retro-futuristic, organic/natural, luxury/refined, cyberpunk, editorial, brutalist, soft/pastel, industrial/utilitarian, neon arcade, etc. Choose one and fully commit.
- **Constraints**: Mobile realities (performance, gestures, accessibility, thumb reach, battery, offline use).
- **Differentiation**: What makes this screen unforgettable on a phone? What single visual or interaction will users remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Mobile design must feel intentional, not cramped desktop layouts shrunk to fit.

Then implement working code using:
- **React Native**
- **Unistyles** for theming and layout
- **Reanimated** for motion and gestures

The result must be:
- Production-grade and performant
- Visually striking and memorable
- Cohesive with a strong aesthetic point-of-view
- Carefully tuned for touch interactions

## Mobile Frontend Aesthetics Guidelines

Focus on:

- **Typography**: Choose fonts that are expressive and readable on small screens. Avoid default system fonts unless the aesthetic demands it. Use strong display fonts for headers and refined humanist fonts for body text. Respect line height and vertical rhythm.

- **Color & Theme**: Commit to a clear palette. Use Unistyles tokens for colors, spacing, and radii. Mobile benefits from high-contrast themes and dominant colors with sharp accents.

- **Motion & Interaction**: Use Reanimated for high-impact motion. Focus on:
  - Screen transitions
  - Gesture-driven interactions
  - Elastic feedback
  - Staggered entrances  
  Motion should feel physical, playful, and intentional. One strong animation is better than ten weak ones.

- **Spatial Composition**: Design for thumbs, not mice. Use:
  - Vertical storytelling
  - Layered cards
  - Overlapping surfaces
  - Asymmetric spacing  
  Avoid rigid grids. Let elements breathe or collide depending on the aesthetic.

- **Backgrounds & Visual Details**: Go beyond flat colors. Use:
  - Gradient meshes
  - Subtle noise overlays
  - Blur and translucency
  - Custom shapes and masks  
  Depth matters more on mobile than desktop.

NEVER use generic mobile UI patterns like:
- Default Material or iOS components without customization
- Predictable card stacks
- Overused color gradients
- Stock iconography with no identity

Interpret creatively and make unexpected choices that feel **designed for a phone**, not ported from the web.

**IMPORTANT**: Match implementation complexity to the vision.  
Maximalist designs require complex gestures and layered animations.  
Minimalist designs require obsessive attention to spacing, rhythm, and micro-interactions.

Remember: mobile is the most intimate interface humans use.  
Design like it lives in someone’s pocket, not in a browser tab.
