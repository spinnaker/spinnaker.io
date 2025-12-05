---
title: "How canary judgment works"
linkTitle: "Canary judgment"
weight: 2
description: >
  Description  of how the default canary judge works.
---


> __Note__: Automated canary analysis in Spinnaker is designed to support pluggable
> judges. This document describes how the default judge (NetflixACAJudge) works.

To assess the quality of a canary deployment against a baseline, metrics from
both deployments are compared in order to check for significant degradation.
This is done in two phases:

* Metric collection (retrieval)

  This phase retrieves the key metrics from the baseline and canary deployments.
  These metrics are typically stored in a time-series database, and include a
  set of tags or annotations that identify which deployment the data was
  collected from (canary or baseline).

  This phase is performed by Kayenta, not by the judge. Besides the default
  judge, it is possible to plug in a custom judge, and metric collection is not
  the responsibility of the judge. The judge merely receives timeseries from
  Kayenta and analyzes those.

* Judgment

  In this phase Spinnaker compares those metrics and renders a decision to pass
  or fail the canary (that is, was there a significant degradation in the
  metrics?) The judgment can also be configured to continue on with a canary
  when the result is "marginal."

  The judgment consists of four main steps, and they're described below.


## Step 1: Data validation and NaN handling

Data validation ensures there's data for the baseline and canary metrics before
analysis begins. The behavior depends on the `nanStrategy` configuration:

### NaN strategies

* **`remove`** (default): NaN values are filtered out of the metric arrays.
  If this results in an empty array, the metric is classified based on other flags.

* **`replace`**: NaN values are replaced with `0.0`. The metric proceeds to
  comparison even if all original values were NaN (the array will contain zeros).

### Classification when data is missing

When either baseline or canary has no data after NaN handling:

| `nanStrategy` | `mustHaveData` | `critical` | Classification |
|---------------|----------------|------------|----------------|
| `remove` | `false` | `false` | `Nodata` |
| `remove` | `false` | `true` | `Nodata` (critical) |
| `remove` | `true` | `false` | `NodataFailMetric` |
| `replace` | any | any | `Pass` (arrays have zeros) |

* **`Nodata`**: Metric is excluded from group score calculations (doesn't hurt
  or help the score), but counts toward the 50% NODATA threshold.
* **`NodataFailMetric`**: Metric counts as a failure in group score calculations.

> **Tip**: Use `nanStrategy: replace` for error metrics where no data means
> zero errors. Use `mustHaveData: true` for metrics that should always have data.

## Step 2: Data cleaning (outlier removal)

After NaN handling, the judge can optionally remove outliers from the data.

### Outlier detection

When `outliers.strategy: remove` is configured, the judge uses an IQR-based
detector with reduced sensitivity:

1. Calculate Q1 (25th percentile) and Q3 (75th percentile)
2. Calculate IQR = Q3 - Q1
3. Calculate standard Tukey fences: `[Q1 - factor×IQR, Q3 + factor×IQR]`
4. Also calculate 1st and 99th percentiles
5. Final fences: `[min(P1, lower_fence), max(P99, upper_fence)]`

The default `outlierFactor` is 3.0. Values outside the final fences are removed.

> **Note**: The reduced sensitivity approach makes outlier detection less
> aggressive than standard Tukey's test, keeping more data points.

## Step 3: Metric comparison (classification)

The judge compares canary and baseline data for each metric and assigns a
classification indicating whether there's a significant difference.

### Classification labels

| Label | Meaning |
|-------|---------|
| `Pass` | No significant difference detected |
| `High` | Canary is significantly higher than baseline |
| `Low` | Canary is significantly lower than baseline |
| `Nodata` | Insufficient data for comparison |
| `NodataFailMetric` | Missing data for a metric with `mustHaveData: true` |
| `Error` | Classification failed due to an internal error |

{{< figure src="./metric_classifications.png" >}}

### Mann-Whitney U test

The judge uses the Mann-Whitney U test (a nonparametric statistical test) with
a **98% confidence level**. A metric is classified as High or Low only when:

1. The entire confidence interval falls outside a tolerance band
2. The effect size exceeds the configured threshold (`allowedIncrease`/`allowedDecrease`)
3. The metric's `direction` allows that classification

The tolerance band is calculated as ±(0.25 × |Hodges-Lehmann estimate|).

### Effect size and thresholds

The `effectSize` configuration controls classification sensitivity:

* **`allowedIncrease`**: Minimum ratio for a High classification (default: 1.0)
* **`allowedDecrease`**: Maximum ratio for a Low classification (default: 1.0)
* **`criticalIncrease`/`criticalDecrease`**: Thresholds for critical failures

> **Important**: Effect size thresholds are secondary gates. A metric must first
> show statistical significance before the effect size is checked. This means a
> metric with a 20% increase might still pass if the confidence interval is wide.

### Critical metrics

When a metric has `critical: true` and is classified as High or Low with an
effect size exceeding `criticalIncrease`/`criticalDecrease`, it becomes a
**critical failure**. This immediately sets the canary score to 0.

## Step 4: Score computation

After classification, the judge computes group scores and a summary score.

### Group scores

For each metric group:

```
Group Score = (Pass count / Total count) × 100
```

Where **Total count** includes `Pass`, `High`, `Low`, and `NodataFailMetric`
classifications. Metrics classified as `Nodata` are **excluded** from the count.

If all metrics in a group are `Nodata`, the group gets an effective score of 100
(it doesn't penalize the canary).

### Summary score

The summary score is a weighted average of group scores:

* Groups with configured weights use those weights
* Unweighted groups share the remaining weight equally:
  `(100 - sum_of_configured_weights) / number_of_unweighted_groups`

### Automatic failures

The canary automatically fails (score = 0) in these cases:

1. **Critical metric failure**: Any metric with `critical: true` that is
   classified as High or Low
2. **50% NODATA rule**: If 50% or more of all metrics are classified as `Nodata`

### Muted metrics

Metrics with `muted: true` are excluded from all scoring calculations but still
appear in results for visibility.

### Final classification

The summary score is compared against thresholds (comparisons are inclusive):

* Score ≥ `passThreshold` → **Pass**
* Score ≥ `marginalThreshold` → **Marginal**
* Otherwise → **Fail**

## Reference

### Effect size measures

The judge supports two effect size measures:

| Measure | Formula | Range | Default | Best for |
|---------|---------|-------|---------|----------|
| `meanRatio` | canary_mean / baseline_mean | 0 to ∞ | 1.0 | Latency, throughput metrics |
| `cles` | Proportion of pairs where canary > baseline | 0 to 1 | 0.5 | When means can be zero |

> **Note**: `meanRatio` returns NaN if either mean is zero. Use `cles` for
> metrics like error counts where zero values are common.

### Result metadata

Each metric result includes statistics for debugging:

* `controlMetadata.stats`: `{min, max, mean, std, count}` for baseline
* `experimentMetadata.stats`: `{min, max, mean, std, count}` for canary
* `resultMetadata.ratio`: The mean ratio (may be NaN)

These statistics are calculated **after** NaN handling and outlier removal.

### Hard-coded constants

These values are built into NetflixACAJudge and cannot be configured:

| Constant | Value | Purpose |
|----------|-------|---------|
| Confidence level | 98% | Mann-Whitney U test confidence interval |
| Tolerance | 0.25 | Tolerance band = ±(0.25 × estimate) |
| NODATA threshold | 50% | Canary fails if ≥50% metrics are Nodata |
| Reduce sensitivity | true | Outlier detection uses permissive fences |

### Special cases

* **Identical data**: If baseline and canary arrays are identical after
  transformation, the metric is classified as `Pass` with ratio `1.0`.

* **Degenerate distributions**: If both arrays have only one unique value,
  tiny Gaussian noise is added to enable the Mann-Whitney test.
