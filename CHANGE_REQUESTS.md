# CHANGE_REQUESTS.md — Glimr QA Report

**Tested by:** Panda (Playwright + visual review)  
**Test date:** 2026-03-10  
**Method:** Playwright headless Chromium, mobile (390×844) + desktop (1280×900)  
**Verdict:** Functional prototype. Not ready for users. Significant gaps across all pages.

---

## 🔴 CRITICAL BUGS (breaks core functionality)

### CR-001 — Registration does not redirect to dashboard
**Page:** `/register`  
**What happens:** After submitting the registration form, the user stays on `/register`. They are not redirected to `/dashboard`. The account may or may not be created — unclear. Either the API call is failing silently or the redirect logic is broken.  
**Expected:** Successful registration → auto-login → redirect to `/dashboard`.

### CR-002 — Classic theme public profile redirects to login
**Page:** `/admin` (Classic theme user)  
**What happens:** Visiting the admin user's public profile `/admin` redirects to the login page instead of showing the profile. This suggests either: (a) the profile page auth guard is incorrectly treating public pages as protected, or (b) a username conflict with the `/admin` route catches before `[username]`.  
**Expected:** `/[username]` is always a public page, no auth required.  
**Note:** The `/admin` route likely collides with the `[username]` dynamic route. Username "admin" is reserved/conflicting.

### CR-003 — Default Next.js 404 page (no branding)
**Page:** Any non-existent URL  
**What happens:** Shows the bare Next.js default 404 — white page, black text, no Glimr branding, no navigation, no way back.  
**Expected:** A branded Glimr 404 page with: logo, brand colors, friendly message, "Go Home" button, and optionally a "claim this username" CTA.  
**Impact:** HIGH — users who mistype a username will see this constantly.

---

## 🟠 HIGH PRIORITY — Missing critical UX features

### CR-004 — No "Forgot Password" link on login
**Page:** `/login`  
**Issue:** There is no password recovery flow whatsoever. Any user who forgets their password is permanently locked out with no visible escape.  
**Fix:** Add a "Forgot password?" link. Implement a reset flow (email token or at minimum a placeholder page).

### CR-005 — No password visibility toggle
**Pages:** `/login`, `/register`  
**Issue:** Password fields have no show/hide toggle. On mobile, typos are frequent and unrecoverable.  
**Fix:** Add eye icon button to toggle `type="password"` ↔ `type="text"`.

### CR-006 — No password confirmation field on register
**Page:** `/register`  
**Issue:** Single password field with no confirmation. One typo = locked account.  
**Fix:** Add "Confirm Password" field. Validate they match before submitting.

### CR-007 — Theme picker missing or broken on dashboard
**Page:** `/dashboard`  
**Issue:** Automated test found no "theme", "classic", "neon", or "soft" text visible on the main dashboard view. The Settings tab either doesn't work or the theme picker isn't rendering.  
**Fix:** Ensure the Settings tab loads and the theme picker (3 theme cards) renders correctly.

### CR-008 — No real-time username availability check on register
**Page:** `/register`  
**Issue:** Users fill out the entire form then discover on submit that their username is taken. The URL preview updates correctly but availability is not checked.  
**Fix:** On username input blur (or after 500ms debounce), call an API to check availability. Show ✅ available or ❌ taken inline.

### CR-009 — No copy-URL button on dashboard
**Page:** `/dashboard`  
**Issue:** The user's page URL is shown as text but there's no one-click copy button. Copying your link to paste into Instagram bio is the #1 action after setup.  
**Fix:** Add a "Copy link" button next to the page URL. Use `navigator.clipboard.writeText()`.

### CR-010 — No delete confirmation on links
**Page:** `/dashboard`  
**Issue:** The delete (×) button on link cards has no confirmation. One misclick = link gone. No undo exists.  
**Fix:** Add a confirmation dialog ("Delete this link? This can't be undone") or implement a brief undo toast ("Link deleted — Undo").

### CR-011 — No inline editing for existing links
**Page:** `/dashboard`  
**Issue:** There is no way to edit an existing link's title, URL, or icon. To change anything, the user must delete and re-create.  
**Fix:** Add an Edit button per link card that expands an inline edit form (or a modal) with the current values pre-filled.

### CR-012 — No "Add a link" form visible / theme picker tab not working
**Page:** `/dashboard` (Settings tab)  
**Issue:** The automated test could not detect theme-related content, suggesting the Settings tab may not be rendering properly.  
**Fix:** Verify tab switching works. Ensure each tab renders its content.

### CR-013 — Analytics bar chart shows full bars at zero data
**Page:** `/dashboard/analytics`  
**Issue:** "Top Links" shows 5 links all with full-width purple bars — but all have 0 clicks and 0%. Full bars visually imply high performance. This is a data visualization lie.  
**Fix:** When click_count = 0, the bar should be empty (0% width) or the section should show an empty state ("No clicks yet").

### CR-014 — No Terms of Service / Privacy Policy
**Pages:** `/register`  
**Issue:** No checkbox, no linked legal text, nothing. This is a legal compliance gap (GDPR, CCPA).  
**Fix:** Add "By creating an account you agree to our Terms of Service and Privacy Policy" below the submit button (can link to placeholder pages for now).

---

## 🟡 MEDIUM PRIORITY — Polish, design, and UX gaps

### CR-015 — Neon theme is not actually neon
**Page:** `/[username]` (neon theme)  
**Issue:** "Neon" theme just has dark background with muted purple borders. No glow, no light-bleed, no saturated halos. Looks identical to "dark mode."  
**Fix:** Add CSS `box-shadow` glow effects on buttons and borders. Use `text-shadow` on names. Use saturated neon colors (e.g. `#FF00FF`, `#00FFFF`, `#7B2FFF`) with strong `box-shadow: 0 0 20px currentColor`.

### CR-016 — Themes are palette swaps, not real themes
**Page:** `/[username]`  
**Issue:** All themes share identical button shapes, spacing, avatar treatment, and layout. Only colors differ. Users expect themes to feel meaningfully different.  
**Fix:** Differentiate button shape per theme (Classic: sharp/squared, Neon: pill/rounded, Soft: extra-rounded with shadow). Change typography weight. Add theme-specific avatar ring styles.

### CR-017 — Emoji icons on link buttons look unprofessional
**Pages:** `/[username]`, `/dashboard`  
**Issue:** System emojis (🔥, 📷, 🎵, 🔗) render differently across OS/browser and look amateurish as UI icons.  
**Fix:** Auto-detect the platform from the URL and display proper SVG icons (Instagram, TikTok, OnlyFans, Telegram, YouTube, Twitter/X, etc.). Fall back to a generic link icon (not 🔗 emoji). Use Lucide icons or custom SVGs.

### CR-018 — No live profile preview on dashboard
**Page:** `/dashboard`  
**Issue:** Users edit their page blind, then have to open a new tab to see results. Every competitor (Linktree, Beacons) shows a live phone mockup preview.  
**Fix:** Add a side panel (desktop) or a "Preview" tab (mobile) showing a scaled-down live preview of the user's profile. Update in real-time as links are added/removed/reordered.

### CR-019 — No drag-and-drop link reordering
**Page:** `/dashboard`  
**Issue:** Reordering uses up/down arrows (▲▼). This is a painful UX for users with many links. Drag handles are the industry standard.  
**Fix:** Implement drag-and-drop with `@dnd-kit/core` or `react-beautiful-dnd`. Show a grab handle (⠿) on the left of each link card.

### CR-020 — Next.js dev watermark visible on all pages
**All pages**  
**Issue:** The "N" circular button in the bottom-left corner appears on every page. This is the Next.js devtools indicator. It must not appear in any user-facing view.  
**Fix:** This button only shows in dev mode (`NODE_ENV=development`). It won't appear in production builds. Note for Dusan: this will go away on `npm run build && npm start`.

### CR-021 — Analytics 30-day chart X-axis is unreadable
**Page:** `/dashboard/analytics`  
**Issue:** Date labels are tiny, angled, and barely contrast against the dark background. The chart format is not clear (MM/DD? DD/MM?).  
**Fix:** Use larger, horizontal date labels at every 7-day interval (e.g., "Mar 1", "Mar 8", "Mar 15"). Add Y-axis labels. Use a subtle horizontal gridline.

### CR-022 — Analytics shows no empty state for charts
**Page:** `/dashboard/analytics`  
**Issue:** When there's no data, the chart area is just an empty dark rectangle. Looks broken.  
**Fix:** Show a friendly empty state inside the chart area: "No visits yet — share your page to start collecting data."

### CR-023 — No date range selector on analytics
**Page:** `/dashboard/analytics`  
**Issue:** Charts are fixed to "Last 30 Days" with no way to change the period.  
**Fix:** Add a simple date range picker: Last 7 days / Last 30 days / Last 90 days / All time.

### CR-024 — Admin table has no sorting or search
**Page:** `/admin`  
**Issue:** User table cannot be sorted by visits, clicks, or join date. With more than 20 users, finding anyone requires scrolling.  
**Fix:** Add clickable column headers for sorting (ascending/descending). Add a search input to filter by username or email.

### CR-025 — Admin "Disable" has no confirmation and no "Enable" visibility
**Page:** `/admin`  
**Issue:** No confirmation dialog on disable. Also unclear how to re-enable a disabled user.  
**Fix:** Add confirmation dialog. Change button to "Enable" when user is already disabled (toggle state clearly visible).

### CR-026 — Landing page: no product preview
**Page:** `/`  
**Issue:** The landing page shows zero screenshots, mockups, or demos of what a Glimr page actually looks like. This is the #1 conversion killer.  
**Fix:** Add a phone frame mockup showing a sample Glimr profile page. Either a static image or a live embed of a demo profile.

### CR-027 — Landing page: no username claim input
**Page:** `/`  
**Issue:** Linktree and all competitors let users claim their username right on the landing page. Glimr just has a "Get Started" button that goes to a separate form.  
**Fix:** Add an input field in the hero: `glimr.io/` + `[text input]` + "Claim" button. Submit → redirect to register with username pre-filled.

### CR-028 — Landing page: no social proof
**Page:** `/`  
**Issue:** No user count, testimonials, or example profiles. Nothing shows the product is real and used.  
**Fix:** Add a "Join X+ creators" counter (even a modest real number). Add 2-3 creator testimonial quotes. Add "See example pages" links to demo profiles.

### CR-029 — Profile page header section too tall
**Pages:** `/[username]`  
**Issue:** Avatar + name + bio takes up 50%+ of the mobile viewport before any links appear. Users have to scroll to see what the page is for.  
**Fix:** Reduce header padding. Limit bio to 2 lines with "read more" expansion. Move bio below the first link or make avatar smaller.

### CR-030 — No loading state on form submissions
**Pages:** `/login`, `/register`  
**Issue:** Clicking submit gives zero visual feedback. The button doesn't disable, doesn't show a spinner, doesn't change text. Users double-click.  
**Fix:** On submit, disable the button and show a spinner or change text to "Creating..." / "Logging in...".

### CR-031 — Login error doesn't highlight affected fields
**Page:** `/login`  
**Issue:** Error message appears but neither input field gets a red/error border. Visual signal is weak.  
**Fix:** On auth failure, apply a red border to both email and password fields. Keep the inline error text.

### CR-032 — Inconsistent copy voice (your vs. my)
**Page:** `/register`  
**Issue:** Header says "Create **your** page" but button says "Create **My** Page." Mixed first/second person on the same screen.  
**Fix:** Pick one and stick to it. Recommended: first-person for buttons ("Create My Page", "Save My Settings") — it's more engaging.

### CR-033 — No "Remember me" option on login
**Page:** `/login`  
**Issue:** No way to persist the session. Users on personal devices have to log in every visit.  
**Fix:** Add a "Remember me" checkbox that extends JWT session expiry.

---

## 🔵 LOW PRIORITY — Nice to have / polish

### CR-034 — No auto-favicon detection for link buttons
**Page:** `/[username]`  
**Issue:** Each link shows a user-picked emoji icon. It would look far more polished to auto-fetch favicons from the link URL.  
**Fix:** Use `https://www.google.com/s2/favicons?sz=64&domain={domain}` as a fallback icon source, or auto-detect platform from URL and map to a known icon set.

### CR-035 — Zero click counts are demoralizing on dashboard
**Page:** `/dashboard`  
**Issue:** Every link showing "👆 0" for a new user feels discouraging. Empty states should be encouraging, not metric-heavy.  
**Fix:** Hide click count when it's 0. Show it only once there's real data. Replace with a subtle "No clicks yet" or nothing.

### CR-036 — No footer navigation links
**Pages:** All  
**Issue:** Footer only has copyright text. No links to Terms, Privacy, Contact, About.  
**Fix:** Add minimal footer links. Even if ToS/Privacy pages are stubs, they must exist.

### CR-037 — Username "admin" is reserved/conflicts with /admin route
**Issue:** The seed script creates a user with username "admin", which collides with the `/admin` route in Next.js.  
**Fix:** Add a reserved username list: `['admin', 'dashboard', 'login', 'register', 'api', 'settings', 'analytics']. Block these at registration and seed with a different admin username or handle the routing conflict.

### CR-038 — No RTA meta label on profile pages
**Page:** `/[username]`  
**Issue:** Research confirmed that adult content pages need the RTA (Restricted To Adults) meta label to comply with parental control software standards.  
**Fix:** Add `<meta name="rating" content="RTA-5042-1996-1400-1577-RTA" />` to all profile page `<head>` tags.

### CR-039 — Mobile: toggle and delete button touch targets too close
**Page:** `/dashboard` (mobile)  
**Issue:** The enabled/disabled toggle and the delete (×) button sit adjacent on the same row. On mobile, misclicks are very likely.  
**Fix:** Add more spacing between them, or move the delete action to a separate menu (three-dot ⋮ button).

### CR-040 — "Made with ✨ Glimr" footer is barely visible
**Pages:** `/[username]`  
**Issue:** The footer text is tiny and low-contrast on both themes.  
**Fix:** Either remove it or style it properly. If it's a branding/SEO moment, make it look intentional — a small, clean pill or badge.

### CR-041 — No page title / breadcrumbs inside dashboard sections
**Page:** `/dashboard/analytics`  
**Issue:** Only a "← Dashboard" link for navigation. No indication of where the user is in the hierarchy.  
**Fix:** Add a clear page title ("Analytics") and breadcrumb nav ("Dashboard / Analytics").

### CR-042 — Analytics CTR shows "0.0%" on insufficient data
**Page:** `/dashboard/analytics`  
**Issue:** With 0-1 visits, CTR is statistically meaningless. Showing "0.0%" is misleading precision.  
**Fix:** Show "—" or "N/A" when sample size is below a threshold (e.g., fewer than 10 visits). Add a tooltip: "CTR is calculated once you have enough data."

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical bugs | 3 |
| 🟠 High priority | 11 |
| 🟡 Medium priority | 19 |
| 🔵 Low priority | 9 |
| **Total** | **42** |

### Must-fix before anyone uses this
CR-001 (register redirect), CR-002 (public profile auth conflict), CR-003 (404 page), CR-004 (forgot password), CR-005 (password toggle), CR-006 (password confirm), CR-010 (delete confirmation), CR-014 (ToS/PP), CR-037 (reserved usernames).

### Makes it feel like a real product
CR-007 (theme picker), CR-008 (username availability), CR-009 (copy URL), CR-011 (inline edit), CR-015+CR-016 (real themes), CR-017 (proper icons), CR-026+CR-027 (landing page product demo + username claim input).
