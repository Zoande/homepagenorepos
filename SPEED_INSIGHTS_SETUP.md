# Vercel Speed Insights - Setup Documentation

## Overview

This project has been configured with **Vercel Speed Insights** to track and monitor web performance metrics, including Core Web Vitals.

## Implementation Details

### Package Installation

- **Package**: `@vercel/speed-insights` v2.0.0
- **Installation Method**: npm
- **Package Manager**: npm (package-lock.json will be generated on deployment)

### Configuration Method

Since this is a **static HTML website** without a JavaScript framework or build system, Speed Insights has been implemented using the **enhanced static site pattern** recommended by Vercel:

1. **Initialization Script**: Added `window.si` initialization to provide a queue for Speed Insights events before the library loads
2. **Script Injection**: Using Vercel's automatic script serving from `/_vercel/speed-insights/script.js`

### Code Implementation

The following code has been added to **all 15 HTML files** in the project:

```html
<!-- Vercel Speed Insights - Enhanced initialization -->
<script>
  window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
</script>
<script defer src="/_vercel/speed-insights/script.js"></script>
```

### Files Modified

**Main Pages:**
- `index.html`
- `about.html`
- `contact.html`

**Project Pages:**
- `projects/dh-citybuilder.html`
- `projects/dh-isrlo-ibdp-subject.html`
- `projects/dh-polymarket-bot.html`
- `projects/dh-sticky-notes-app.html`
- `projects/dh-studymaster.html`
- `projects/dh-swapspot.html`
- `projects/dh-task-sorter-app.html`
- `projects/dh-typing-platformer.html`
- `projects/zoande-ahhh.html`
- `projects/zoande-brokersim.html`
- `projects/zoande-call-of-idk.html`
- `projects/zoande-onlineagent.html`

### Additional Files Created

- `package.json` - NPM package configuration with `@vercel/speed-insights` dependency
- `.gitignore` - Git ignore file to exclude `node_modules/` and other build artifacts
- `SPEED_INSIGHTS_SETUP.md` - This documentation file

## How It Works

1. **Initialization**: The `window.si` function is initialized immediately, creating a queue for any Speed Insights events
2. **Script Loading**: The Speed Insights script loads asynchronously (using `defer`)
3. **Data Collection**: Once loaded, Speed Insights automatically tracks:
   - Core Web Vitals (LCP, FID, CLS, TTFB, INP)
   - Navigation timing
   - Performance metrics
4. **Reporting**: Data is sent to Vercel's Speed Insights dashboard

## Vercel Dashboard Setup

To view Speed Insights data:

1. Navigate to your project in the [Vercel Dashboard](https://vercel.com)
2. Go to the "Speed Insights" tab
3. Enable Speed Insights for this project if not already enabled
4. Deploy the project to start collecting data
5. View real-time performance metrics and Core Web Vitals

## Features

- ✅ Automatic tracking of Core Web Vitals
- ✅ Real User Monitoring (RUM)
- ✅ No configuration required in code
- ✅ Works across all pages in the site
- ✅ Zero impact on page load performance (script loads deferred)
- ✅ Privacy-friendly (no PII collected)

## Testing

Speed Insights only tracks data in **production mode**. To test:

1. Deploy to Vercel
2. Visit your deployed site
3. Navigate between pages
4. Check the Speed Insights dashboard after a few minutes

## Development

Speed Insights does **not** track data in development mode to avoid polluting production metrics.

## Browser Support

Speed Insights supports all modern browsers that support the Web Vitals metrics:
- Chrome/Edge 77+
- Firefox 69+
- Safari 14+

## Documentation

For more information, see:
- [Vercel Speed Insights Documentation](https://vercel.com/docs/speed-insights)
- [Speed Insights Quickstart Guide](https://vercel.com/docs/speed-insights/quickstart)
- [@vercel/speed-insights Package](https://www.npmjs.com/package/@vercel/speed-insights)

## Troubleshooting

### No data appearing in dashboard

1. Ensure Speed Insights is enabled in Vercel dashboard
2. Verify the site is deployed to Vercel
3. Wait 5-10 minutes for initial data to appear
4. Check browser console for any errors

### Script not loading

1. Verify you're on a Vercel deployment (not local development)
2. Check that `/_vercel/speed-insights/script.js` is accessible
3. Ensure no ad blockers are interfering with the script

## Notes

- The `@vercel/speed-insights` package is included in `package.json` for dependency management and potential future enhancements
- For static HTML sites, the package itself isn't bundled; instead, Vercel serves the script automatically
- The enhanced initialization pattern (`window.si`) allows for potential custom event tracking in the future
- No build step is required; this is a runtime-only solution

---

**Setup completed on**: April 12, 2026  
**Package version**: @vercel/speed-insights v2.0.0  
**Implementation method**: Static HTML with enhanced initialization pattern
