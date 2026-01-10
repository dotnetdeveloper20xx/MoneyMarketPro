# MoneyMarketPro - Portfolio Demo Site

A polished mini-site showcasing the MoneyMarketPro P2P Lending Platform for portfolio presentation.

**Developer:** Faz Ahmed
**Portfolio:** [dotnetdeveloper.co.uk](https://dotnetdeveloper.co.uk)

---

## Overview

This demo site provides a comprehensive technical showcase of the MoneyMarketPro application, designed to demonstrate professional software engineering skills to potential employers and clients.

## Files Structure

```
portfolio-demo/
├── index.html          # Landing page with project overview
├── backend.html        # Technical deep dive into .NET architecture
├── frontend.html       # Angular frontend feature showcase
├── styles.css          # Professional styling
├── README.md           # This file
├── PLAN.md             # Discovery & planning document
├── SCREENSHOTS.md      # Screenshot capture guide
├── LICENSE.md          # Copyright notice
└── screenshots/        # Screenshot images (add your own)
    └── .gitkeep
```

## Quick Start

1. **Open Locally:** Simply open `index.html` in a web browser
2. **Deploy:** Upload all files to any static hosting (GitHub Pages, Netlify, Vercel)

## Adding Screenshots

1. Capture screenshots following the guide in `SCREENSHOTS.md`
2. Save images to the `screenshots/` folder
3. Update the HTML files to reference your screenshots:

```html
<!-- Replace placeholder with actual screenshot -->
<div class="screenshot-card">
    <img src="screenshots/borrower-dashboard.png" alt="Borrower Dashboard">
    <p>Overview of active loans, wallet balance, and upcoming payments</p>
</div>
```

## Customization

### Update Developer Information

Search and replace the following throughout all HTML files:
- `Faz Ahmed` - Your name
- `dotnetdeveloper.co.uk` - Your portfolio URL
- `2026` - Current year (for copyright)

### Modify Styling

Edit `styles.css` to change:
- **Colors:** Update CSS variables at the top of the file
- **Typography:** Change the Google Fonts imports
- **Layout:** Adjust spacing variables

```css
:root {
    --primary: #0d3880;      /* Main brand color */
    --secondary: #00a0d2;    /* Accent color */
    --accent: #28a745;       /* Success/action color */
}
```

### Add Social Links

Add your professional links to the footer in each HTML file:

```html
<div class="footer-social">
    <a href="https://linkedin.com/in/yourprofile"><i class="fab fa-linkedin"></i></a>
    <a href="https://github.com/yourusername"><i class="fab fa-github"></i></a>
</div>
```

## Deployment Options

### GitHub Pages
1. Push the `portfolio-demo` folder to a GitHub repository
2. Go to Settings > Pages
3. Select the branch and folder to deploy

### Netlify
1. Drag and drop the `portfolio-demo` folder to Netlify
2. Or connect your GitHub repository for automatic deployments

### Vercel
1. Import from Git or upload folder
2. No configuration needed for static HTML

## Technologies Used in Demo Site

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Flexbox, Grid
- **Google Fonts** - Inter, JetBrains Mono
- **Font Awesome 6** - Icons
- **Prism.js** - Syntax highlighting

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Copyright (c) 2026 Faz Ahmed. All rights reserved.

See `LICENSE.md` for full terms.

---

*This demo site showcases the MoneyMarketPro application - a P2P lending platform built with .NET 8, Angular 17+, Clean Architecture, and Domain-Driven Design.*
