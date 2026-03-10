# Vedic Numerology

## Current State
The app has full numerology charts (natal, dasa, year, month, day) with color coding, watermarking, and a comparison tab. All features are publicly accessible with no authentication or access control. Destiny number is orange. Day numbers are shown per individual day.

## Requested Changes (Diff)

### Add
- **Admin login**: Hardcoded credentials (email: vikaskharb50@gmail.com, password: vikasadmin123). Admin logs in via a hidden admin route or a login button.
- **Admin panel**: After admin login, show a user management table. Admin can create new user accounts with: username, password, and section level (2 or 3).
- **User login**: A login button/modal on the main app. Users enter username + password to access their assigned section.
- **Backend user store**: Motoko canister stores user accounts: username (text), hashed password (text), section_level (nat: 2 or 3).
- **Section gating**:
  - Section 1 (Free, no login): Natal chart, Year chart, Dasa numbers visible to all.
  - Section 2 (Paid, requires login with level 2 or 3): Month chart and detailed year number views.
  - Section 3 (Advanced, requires login with level 3): Prediction section -- show "Coming Soon" placeholder.
- **Day numbers plural view**: In the day chart section, show all day numbers for the full month period at once (all days listed together) rather than requiring individual card taps.

### Modify
- **Destiny number color**: Change from orange to yellow.

### Remove
- Nothing removed.

## Implementation Plan
1. Add Motoko backend with:
   - User type: { username: Text; passwordHash: Text; sectionLevel: Nat }
   - createUser(username, password, sectionLevel) -> accessible only via admin token
   - login(username, password) -> returns session token + sectionLevel
   - getUsers() -> admin only, list all users
   - deleteUser(username) -> admin only
2. Frontend:
   - Add login modal with username/password fields
   - Add admin login flow (separate route or hidden admin button)
   - Admin panel page: table of users, create user form (username, password, section selector)
   - AuthContext: store current user session (username, sectionLevel) in localStorage
   - Gate Month chart and Day chart behind sectionLevel >= 2
   - Gate Prediction tab behind sectionLevel >= 3 (show Coming Soon placeholder)
   - Show login prompt when non-logged user tries to access gated section
   - Day chart view: render all days in the month period in a scrollable list at once
   - Change destiny number color from orange to yellow
