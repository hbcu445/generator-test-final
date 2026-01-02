# AI Help Service TODO
<!-- Last updated: 2026-01-02 03:00 EST -->

## Test Page Complete Redesign (from sketch)
- [x] Header row: Generator Source logo | Location | Date | Person icon + name | Clock + timer | Pause button
- [x] Progress display: "QUESTION 1 of 100 | COMPLETE: 1%"
- [x] Question text: Large, clear, centered
- [x] Answer options: Radio button style (A, B, C, D) with circles
- [x] Navigation: Yellow BACK arrow (left) | Yellow NEXT arrow (right)
- [x] DaVinci AI logo in bottom right corner

## Test Page Layout Fixes (from user screenshot feedback)
- [x] Fix header: all info (location, date, name, timer, pause) should be in ONE horizontal row (currently stacked) - Fixed CSS conflicts
- [ ] Fix progress display formatting: showing "1001%" instead of "1%"
- [ ] Remove "BASIC ELECTRICITY" category text from test page
- [ ] Improve navigation arrow styling with proper yellow triangular shapes

## Deployment Issues
- [x] Fix deployment error: Cannot find module '/usr/src/app/dist/index.js' - Added Dockerfile
- [x] Configure proper build output for server deployment - Dockerfile builds frontend then starts server
- [ ] Ensure Supabase and email integration work in production - needs testing after deployment

## Vercel Deployment Issues
- [ ] Vercel still showing old layout despite latest code being pushed to GitHub
- [ ] Need to investigate why CSS fixes aren't appearing in deployed version
- [ ] Verify vercel.json configuration is correct
