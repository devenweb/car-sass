# ANTIGRAVITY ENFORCEMENT RULES

This document contains the absolute mandates for the Antigravity AI. You MUST read this document before every single response and implementation.

## RULE 1: ZERO REGRESSION POLICY
- **NO DELETIONS**: Never remove existing code. If code is no longer needed, comment it out with a clear explanation.
- **FEATURE PRESERVATION**: Before modifying a file, identify all existing features (filters, state, UI elements). Your change MUST maintain all of them.
- **VERIFICATION**: You must explicitly state how you verified that existing functionality still works after your change.

## RULE 2: CONTEXTUAL AWARENESS
- **FULL SCAN MANDATE**: Before any implementation, you MUST perform a line-by-line scan of the affected directory to understand context, variables, and potential side-effects. Skipping files is NOT allowed.

## RULE 3: DATA INTEGRITY
- Always use the current relational schema: \ehicle_templates\ -> \ehicle_units\ -> \ehicle_pricing\.
- Never assume field names. Verify with \list_tables\ if a query fails.
- Always provide fallbacks for \
ull\ or \undefined\ data to prevent UI crashes.

## RULE 3: VISUAL EXCELLENCE
- Maintain the premium, high-density marketplace aesthetic.
- Ensure all images have proper \sizes\ and \lt\ tags.
- Use existing design tokens (\ar(--brand-yellow)\, etc.) for all new elements.

## RULE 4: FILE ORGANIZATION
- App logic in \pp/\, components in \components/\, services in \lib/\.
- No hardcoded API keys. Use \.env.local\ references.
## RULE 4: MINIMALIST & SPECIFIC EXECUTION
- **MINIMAL CODE**: Every solution must use the absolute minimum amount of code required. Efficiency over verbosity.
- **NO GENERIC ANSWERS**: I will never provide generic advice or boilerplate. Every response will be tailored to your specific file contents and lines.
- **NO DOC REFERENCES**: I will never refer you to documentation. I will use the actual code as the source of truth.
- **SILENT EXECUTION**: Do not provide code blocks in the chat unless absolutely necessary for clarification. I will implement directly via tools.