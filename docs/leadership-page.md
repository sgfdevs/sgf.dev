# Leadership page

`/about/leadership/` uses the typed public leadership operation, not Delivery member pickers. The CMS must have an anonymously accessible published Leadership node at that route. Missing or protected content is 404; malformed or upstream errors are controlled 502, configuration and timeout errors 503. There is no successful fallback data.

The page retains the legacy officers, Board Of Directors, History and board application layout using existing theme tokens, shell and static artwork. The three member selections retain their CMS order. The native model and legacy view contain no year grouping, so no years are inferred. History retains its blank-title "Board Member" fallback and a local heading link instead of an invented profile destination.

Only officer biographies render HTML, through the existing page sanitizer. Names and titles remain escaped Svelte text. Profile paths derive from validated public usernames. Avatars use the existing same-origin media mapper or pipey placeholder. PageData does not retain raw properties, IDs, keys or security values. Root metadata handling accepts the leadership title/path while preserving private configuration and canonical policy.
