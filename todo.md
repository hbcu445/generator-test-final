# Generator Technician Knowledge Test - TODO

## Remove AI Lifelines
- [x] Remove AI Lifeline button from test interface
- [x] Remove AI help dialog and related UI components
- [ ] Remove AI help API endpoint from server.js (not needed for frontend-only changes)
- [x] Update test instructions to remove mention of AI lifelines
- [x] Remove lifeline counter and related state management

## Improve Readability and Design
- [x] Increase font sizes for better readability on desktop
- [x] Improve question text styling with better line height and spacing
- [x] Make answer options more prominent with larger, clearer buttons
- [x] Add better visual separation between question and answer options
- [x] Improve selected answer indication with clear visual feedback
- [x] Optimize layout for desktop viewing (wider content area)
- [x] Ensure clean, professional design suitable for hiring assessment

## Testing
- [x] Test question navigation
- [x] Test answer selection and deselection
- [x] Test timer functionality
- [ ] Test results display and certificate generation (not tested yet)
- [x] Verify all 97 questions display correctly

## Application Simplification (User Request - 2026-01-02)
- [x] Remove Supabase database integration
- [x] Remove Express server (server.js)
- [x] Remove backend API routes
- [x] Configure email to work via SendGrid serverless function
- [x] Update vercel.json for static site deployment
- [x] Remove Dockerfile (not needed for static site)
- [x] Test build and verify it works
- [ ] Push to GitHub and verify Vercel deploys correctly
