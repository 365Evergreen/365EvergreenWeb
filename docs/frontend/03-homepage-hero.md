# Component: Homepage hero

***

## ✅ User story (Designer)

**As a user**, I want a visually striking hero section so that I immediately understand the purpose of the site and where to go next.

***

## ✅ Acceptance criteria

### Layout

* Hero uses a **60 / 40 horizontal split**:
  * Left (60%): text content
  * Right (40%): image
* Content is vertically centred within viewport height
* Text container:
  * Max width \~520px
  * Left aligned
* Image:
  * Fills full height of hero
  * Aligns to right edge of screen
  * Slightly cropped for aesthetic balance

***

### Visual design

Based on the provided image:

* Background is **clean and minimal**
* Right side image:
  * Soft neutral tones (light grey background)
  * Subject (plant in glass vase) positioned slightly off-centre
* Strong visual balance between:
  * Negative space (left)
  * Image weight (right)

***

### Content

* Hero must support:
  * Headline (large, prominent)
  * Optional subheading
  * Primary CTA (e.g. *See how it works*)
* CTA:
  * Clearly visible
  * Positioned below text content
  * High contrast

***

### Responsive behaviour

**Desktop**

* 60 / 40 layout maintained
* Image visible

**Tablet**

* Layout shifts toward stacked or 70 / 30
* Image may reduce in prominence

**Mobile**

* Fully stacked:
  1. Text
  2. Image (or optional background image)
* Text remains readable without overlap

***

### Motion design

* Headline:
  * Fades in on load
  * Duration: \~300–500ms
* Background image:
  * Ultra-slow zoom (1–2% scale)
  * Continuous and subtle (no noticeable jump)
* Motion must:
  * Not distract from content
  * Be smooth and GPU-friendly

***

### Accessibility

* Text contrast meets WCAG AA
* CTA is keyboard accessible
* Motion respects:
  * `prefers-reduced-motion`
* Image includes descriptive `alt` text

***

## ✅ User story (Developer)

**As a developer**, I want a reusable hero component with structured layout and animated behaviour so that it can be consistently reused across pages.

***

## ✅ Acceptance criteria

### 1. Component structure (MANDATORY)

```
/components/Hero
  ├── Hero.tsx
  ├── Hero.module.scss
  ├── Hero.types.ts
  ├── index.ts
```

***

### 2. Subcomponents (recommended)

```
/components/Hero
/components/HeroContent
/components/HeroImage
/components/HeroCTA
```

***

### 3. Props design

`Hero.types.ts`:

```ts
export interface HeroProps {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaLink?: string;
  imageSrc: string;
  imageAlt: string;
}
```

***

### 4. Layout implementation

* Use flex or grid for 60 / 40 split

Example approach:

```tsx
<div className={styles.hero}>
  <div className={styles.content}></div>
  <div className={styles.image}></div>
</div>
```

***

### 5. SCSS module implementation

**Hero.module.scss**

```scss
.hero {
  display: grid;
  grid-template-columns: 60% 40%;
  min-height: 100vh;
}

.content {
  max-width: 520px;
  display: flex;
  flex-direction: column;
  justify-content: centre;
}

.image {
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
```

***

### 6. Image behaviour

* Use:
  ```scss
  object-fit: cover;
  ```
* Ensure:
  * Right-aligned cropping
  * No distortion

***

### 7. Motion implementation

#### Headline fade-in

```scss
.title {
  opacity: 0;
  transform: translateY(10px);
  animation: fadeIn 0.4s ease forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

***

#### Background slow zoom

```scss
.image img {
  animation: slowZoom 20s ease-in-out infinite alternate;
}

@keyframes slowZoom {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.02);
  }
}
```

***

### 8. Reduced motion support

```scss
@media (prefers-reduced-motion: reduce) {
  .title,
  .image img {
    animation: none;
  }
}
```

***

### 9. Responsive breakpoints

```scss
@media (max-width: 1024px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .image {
    height: 300px;
  }
}
```

***

### 10. Routing integration

* CTA uses React Router:

```tsx
<Link to={ctaLink}>{ctaLabel}</Link>
```

***

### 11. Performance

* Optimised image:
  * Use modern formats (`.webp`)
* Avoid layout shifts:
  * Set container height explicitly
* Animations:
  * Use `transform` only (no layout-triggering props)

***

# ✅ DevOps backlog CSV (append-ready)

```
Work Item Type,Title,Description,Acceptance Criteria,Area Path,Iteration Path,Tags
Epic,Homepage hero component,Primary landing hero section,Responsive hero with motion and image layout,SWA React App,Backlog,UI;Landing
User Story,Design homepage hero,Create visual hero layout,"60/40 split; max text width; cropped image; CTA placement","SWA React App",Backlog,Designer
User Story,Implement hero component,Build reusable hero,"Component folder; SCSS module; responsive grid; props-driven","SWA React App",Backlog,Developer
User Story,Implement hero animations,Add motion to hero,"Headline fade-in; subtle zoom; smooth transitions","SWA React App",Backlog,Developer;Animation
User Story,Implement responsive behaviour,Ensure hero works on all devices,"Desktop split; tablet adjust; mobile stack","SWA React App",Backlog,Developer;Responsive
User Story,Ensure hero accessibility,Accessible hero component,"Contrast; reduced motion; alt text; keyboard CTA","SWA React App",Backlog,Accessibility
```

***


