# Tenant Assets Directory

This directory is structured to hold tenant-specific static assets.
The structure must be:
`/public/assets/[tenant_id]/`

## Examples:
- `/public/assets/d290f1ee-6c54-4b01-90e6-d701748f0851/logo.png`
- `/public/assets/d290f1ee-6c54-4b01-90e6-d701748f0851/theme.json` (Optional future expanding)

## Access Strategy
The frontend can dynamically load these assets based on the User's session `tenant_id`:
```tsx
<img src={`/assets/${tenantId}/logo.png`} alt="CFA Logo" />
```
OR via a CSS variable injection in the root layout if we serve a CSS file.
