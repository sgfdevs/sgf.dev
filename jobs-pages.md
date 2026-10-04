# Jobs pages

`/jobs/` renders the legacy ordered table with every public returned row, creation-date label and a whole-row link. Filter features remain coming soon; Post a Job still links to `/about/sponsorship/`. No sorting, expiry rule, pagination or skill filtering is added.

`/companies/{company}/{job}/` renders the parent company, job name, location, employment type, compensation, sanitized description, safe new-tab Apply Now link and ordered skill labels without directory filters. The Company Jobs tab remains Coming Soon.

Both pages reuse the shell, theme, page HTML/href sanitizer, media mapping and generated public SDK. Server loaders use request-scoped fetch, the fixed private CMS origin, anonymous GETs without cookies or API keys, disabled redirects and exact job paths. PageData contains only mapped visible fields and metadata, not raw picker/member values. Missing/protected content is 404; upstream/configuration errors have controlled messages.

The public OpenAPI snapshot is the real export from backend `d4ca400`; the generated types come from those bytes. Added operations are the jobs list and job detail, plus PublicJobDto. Prior operations and components are unchanged.
