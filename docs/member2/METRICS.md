# Member 2 metric definitions

All reporting is admin-only. Events are aggregated in SQL. Event payloads are not stored because they may contain private content. Every daily breakdown requires at least five distinct actors; suppressed values are null, not zero. Synthetic events are explicitly labelled and counted separately. Counts use the selected creation-date window unless the label explicitly says all time. Counts describe records, not inferred human effort.

- Profiles created: User creation count; marked not live while real authentication is disabled.
- Projects, invitations sent/accepted, active teams, completed/verified projects, certificates: counts of existing persisted records. Module flags indicate availability where present.
- Recommendation acceptance: attributed accepted invitations / attributed sent invitations. A latest saved recommendation run must contain that candidate before an event is attributed. Outcome dedupe keys prevent repeated delivery from duplicating outcomes.
- Recommendation join rate: attributed membership joins / attributed sent invitations. These descriptive rates are not causal estimates.
- Milestone completion: Done milestones / milestones created in the selected window.
- Overdue task frequency: unfinished tasks past due / tasks created in the selected window.
- Recruiter shortlist total: existing Shortlist rows, explicitly all time because that inherited table has no timestamp.
- Contacts: CandidateContacted event count in the selected range. No message contents are read.
- Daily activity: event type and date with count and distinct-actor sample size.
- Offline evaluation: precision at five uses a fixed denominator of five; NDCG uses graded synthetic relevance labels. Real outcome rates remain null below five people or when no invitations were sent. Fixture metrics are not production performance claims.

The baseline remains the default. The optional local TF-IDF blend uses canonical skills and learning goals; arbitrary biography text is excluded because it may contain protected attributes. No individual behaviour dashboard is exposed.

Additional measures: adapter profile completeness requires name/headline/availability plus at least one skill and remains Not yet live until the real profile module is enabled. Downstream completion compares distinct recommended-team projects, not invitation counts. Days to verification uses the first recorded ProjectVerified event relative to project creation; it does not guess completion timestamps from updatedAt. Rescue/search/contact/response measures stay Not yet live until their producing modules are available. Summary responses have a short cache; events invalidate it.
