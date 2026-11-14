# Matching evaluation

Hybrid improved this synthetic set; retain baseline until larger, real-outcome evaluation confirms the result.

Sample: 6 hand-labelled synthetic scenarios. Not a production-quality estimate.

| Ranker | Precision at 5 | NDCG |
| --- | --- | --- |
| baseline | 0.600 | 0.927 |
| hybrid | 0.800 | 0.964 |

Acceptance and join rates use only recommendation-attributed outcomes. Values are suppressed below five people.
Observed outcomes: {"sent": 0, "accepted": 0, "joined": 0, "sampleSize": 0, "acceptanceRate": null, "joinRate": null, "suppressed": true}.

The optional TF-IDF ranker uses only allow-listed skills and shared profile text. Baseline remains the default.
