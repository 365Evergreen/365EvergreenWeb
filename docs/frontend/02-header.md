Great constraint—that’s a solid, scalable pattern and aligns well with how you structure reusable components.

I’ve updated the **user stories + acceptance criteria** to explicitly enforce:

* ✅ Component-per-folder structure
* ✅ `.module.scss` styling only (no inline styles, no Tailwind)
* ✅ Strong separation of concerns

***

# Component: Site header (SCSS modules + isolated structure)

***

## ✅ User story (Designer)

**As a user**, I want a clean, responsive header so that I can easily navigate the site on any device.

### Acceptance criteria

**Layout (desktop)**

* Header spans full width (100%)
* Logo aligned left
* Navigation aligned right
* Spacing consistent with design system grid

**Layout (mobile/tablet)**

* Navigation hidden at defined breakpoint (e.g. 1024px)
* Hamburger replaces navigation
* Logo remains visible and left aligned
* Hamburger right aligned with sufficient padding

**Visual behaviour**

* Header is transparent at top of page
* On scroll:
  * Background changes to solid colour
  * Optional shadow appears
* Transition is:
  * Smooth (200–300ms)
  * Visually consistent (no flicker)

**Sticky behaviour**

* Header remains fixed at top
* Content is not hidden behind header (proper spacing applied)

**Accessibility**

* All interactive elements:
  * Keyboard accessible
  * Have visible focus states
* Colour contrast meets WCAG AA in both states

***

## ✅ User story (Developer)

**As a developer**, I want a reusable, encapsulated header component using SCSS modules so that styling is maintainable and scoped.

***

## ✅ Acceptance criteria

### 1. Component structure (MANDATORY pattern)

Each component must follow this structure:

```
/components/Header
  ├── Header.tsx
  ├── Header.module.scss
  ├── Header.types.ts (optional)
  ├── Header.test.tsx (optional)
  └── index.ts
```

***

### 2. Styling rules

* ✅ All styles defined in `Header.module.scss`
* ✅ No inline styles
* ✅ No global CSS leakage
* ✅ No Tailwind or CSS-in-JS

**Example usage:**

```tsx
import styles from "./Header.module.scss";
```

***

### 3. Component composition

Header is split into subcomponents:

```
/components/Header
/components/Logo
/components/Nav
/components/MobileMenu
/components/HamburgerButton
```

Each follows the same structure:

```
ComponentName/
  ├── ComponentName.tsx
  ├── ComponentName.module.scss
  └── index.ts
```

***

### 4. Behaviour (scroll + state)

* Scroll detection implemented:
  ```ts
  window.scrollY > 50
  ```

* Internal state:
  * `isScrolled`
  * `isMenuOpen`

* Conditional class applied:
  ```tsx
  className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}
  ```

***

### 5. CSS (SCSS module expectations)

Example `Header.module.scss`:

```scss
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;

  display: flex;
  justify-content: space-between;
  align-items: centre;

  padding: 1rem 2rem;

  background: transparent;
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

.scrolled {
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;

  display: flex;
  justify-content: space-between;
  align-items: centre;
}
```

***

### 6. Responsive behaviour

* Breakpoints defined in SCSS:

```scss
@media (max-width: 1024px) {
  .nav {
    display: none;
  }

  .hamburger {
    display: block;
  }
}
```

* Desktop:
  * Nav visible
  * Hamburger hidden
* Mobile:
  * Nav hidden
  * Hamburger visible

***

### 7. Routing integration

* React Router used
* No \`\` for internal navigation

```tsx
import { Link } from "react-router-dom";
```

***

### 8. Accessibility

* Hamburger button:

```tsx
<button
  aria-label="Toggle navigation menu"
  aria-expanded={isMenuOpen}
  className={styles.hamburger}
>
```

* Menu behaviour:
  * ESC closes menu
  * Focus remains inside when open

***

### 9. Performance

* Scroll handler:
  * Uses passive listener
  * Optional optimisation:
    * `requestAnimationFrame` or throttle
* Avoid unnecessary re-renders:
  * State updates only when value changes

***

# ✅ Updated DevOps backlog CSV (append-ready)

```
Work Item Type,Title,Description,Acceptance Criteria,Area Path,Iteration Path,Tags
Epic,Site header component (SCSS modules),Responsive header using modular SCSS,Componentised header using isolated SCSS modules,SWA React App,Backlog,UI;Standards
User Story,Design site header (responsive),Create accessible responsive header,"Full width; transparent to solid on scroll; desktop nav; mobile hamburger","SWA React App",Backlog,Designer
User Story,Implement header with SCSS modules,Build reusable header component,"Component folder structure; .module.scss only; no inline styles; scroll detection; responsive","SWA React App",Backlog,Developer
User Story,Implement mobile navigation menu,Build hamburger menu interaction,"Toggle menu; responsive visibility; close on select and outside click","SWA React App",Backlog,Developer
User Story,Enforce component standards,Ensure consistent structure across components,"Each component in its own folder; SCSS module required; index export pattern","SWA React App",Backlog,Developer;Standards
User Story,Enhance header accessibility,Ensure accessible navigation,"ARIA attributes; keyboard navigation; focus management","SWA React App",Backlog,Accessibility
```

***

# ✅ Recommended standard (you should enforce this across your repo)

Given your architecture, I’d strongly recommend you standardise:

### ✅ Component rules (document this once)

* 1 component = 1 folder
* Must include `.module.scss`
* Must NOT include inline styles
* Must export via `index.ts`
* Prefer functional components with hooks
* No business logic inside presentational components

***

