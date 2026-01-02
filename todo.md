# Generator Technician Knowledge Test - Redesign TODO

## Branding & Logos
- [x] Add Generator Source logo to public folder
- [x] Add DaVinci.AI logo to public folder
- [x] Place Generator Source logo in upper left corner (all pages)
- [x] Place DaVinci.AI branding in bottom right corner (all pages)

## Welcome Page Redesign
- [x] Create professional, centered name input section
- [x] Improve typography and spacing
- [x] Make instructions more prominent and readable
- [x] Optimize layout for tablet/desktop (no mobile)
- [x] Add better visual hierarchy

## Test Interface Redesign
- [x] Relocate countdown timer to avoid covering buttons
- [x] Add green indicator when timer is running
- [x] Improve applicant name placement
- [x] Redesign choice buttons - larger, clearer, more professional
- [x] Ensure all content is fully visible
- [x] Optimize for tablet/desktop viewing
- [x] Improve overall layout and spacing

## Testing & Deployment
- [ ] Test on local server
- [ ] Build production version
- [ ] Deploy to Vercel
- [ ] Verify live site

## Self-Evaluation Feature
- [x] Add skill level selector on welcome screen (Level 1-4)
- [x] Store selected skill level in state
- [x] Update results to show self-evaluation vs actual performance
- [x] Add performance assessment based on level comparison

## Layout Fixes
- [ ] Fix answer option styling and spacing
- [ ] Ensure all content is properly visible
- [ ] Improve mobile responsiveness for tablets
- [ ] Test on different screen sizes

## Contact Information Collection
- [x] Add phone number field to welcome screen
- [x] Add email field to welcome screen
- [x] Add validation for phone and email formats
- [x] Update state management to store contact info

## Supabase Backend Integration
- [ ] Create test_results table in Supabase
- [ ] Define schema (id, name, email, phone, skill_level, test_date, score, percentage, performance_level, self_evaluation, assessment, detailed_results)
- [ ] Install Supabase client in application
- [ ] Implement data insertion after test completion
- [ ] Test database connection and data storage

## Email Automation
- [ ] Set up email service (Supabase Edge Function or external service)
- [ ] Create email template for test results
- [ ] Generate PDF attachments (certificate and report)
- [ ] Implement automatic email sending after test completion
- [ ] Test email delivery

## Content Updates
- [x] Add 3 new interesting questions to reach 100 total questions
- [x] Update test instructions to reflect 100 questions instead of 97
- [ ] Update timer if needed for 100 questions

## Branch Selection and Email Routing
- [x] Add branch selector to welcome screen
- [x] Add branch state management
- [x] Configure email routing based on branch selection
- [ ] Brighton, CO → emett@generatorsource.com
- [ ] Jacksonville, FL → chad@generatorsource.com
- [ ] Austin, TX → jbrown@generatorsource.com
- [ ] Pensacola, FL → oliver@generatorsource.com
- [ ] All results → emett@generatorsource.com (master copy)
- [x] Update validation to require branch selection
- [x] Store branch information in database

## Deployment Fix
- [ ] Update .gitignore to exclude node_modules
- [ ] Remove node_modules from git tracking
- [ ] Push clean repository for deployment

## SendGrid Email Integration
- [ ] Install SendGrid npm package
- [ ] Configure SendGrid API key
- [ ] Create email template for test results
- [ ] Implement email sending in submit-test endpoint
- [ ] Send results to applicant
- [ ] Send results to branch manager
- [ ] Send copy to emett@generatorsource.com
- [ ] Test email delivery
