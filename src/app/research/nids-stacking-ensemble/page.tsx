import type { Metadata } from "next";
import Link from "next/link";
import { research } from "@/lib/config";

const paper = research.preprints[0];

export const metadata: Metadata = {
  title: paper.title,
  description:
    "Five machine learning algorithms benchmarked across five public intrusion detection datasets, then combined into a two-tier stacking ensemble under a leakage-resistant evaluation protocol.",
  openGraph: { title: paper.title, type: "article" },
};

/** Wide tables scroll inside their own box rather than pushing the page sideways. */
function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[34rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-bg-subtle/60 text-left">
            {head.map((h) => (
              <th
                key={h}
                className="px-3 py-2 font-mono text-[11px] font-normal uppercase tracking-widest text-fg-muted"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, i) => (
                <td
                  key={head[i]}
                  className={
                    i === 0
                      ? "px-3 py-2 whitespace-nowrap font-medium"
                      : "px-3 py-2 text-fg-muted"
                  }
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The id a section heading answers to. This page is hand-written JSX rather
 * than MDX, so rehype-slug never sees it and the ids have to be derived here —
 * by the same rule, so a link into this page looks like a link into a post.
 */
function slugify(text: React.ReactNode) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function Heading({ children }: { children: React.ReactNode }) {
  const id = slugify(children);
  return (
    <h2 id={id} className="group mt-10 text-lg font-medium tracking-tight">
      {children}
      <a
        href={`#${id}`}
        aria-label="Link to this section"
        className="ml-2 font-mono text-fg-muted no-underline opacity-0 transition-opacity hover:text-accent focus-visible:opacity-100 group-hover:opacity-100"
      >
        #
      </a>
    </h2>
  );
}

export default function PaperPage() {
  return (
    <article className="max-w-3xl py-10">
      <Link href="/#research" className="font-mono text-xs text-fg-muted hover:text-accent">
        ← research
      </Link>

      <h1 className="mt-6 text-2xl font-medium leading-snug tracking-tight">{paper.title}</h1>

      {/* Byline and status on one line each, kept tight so the page opens on the
          work rather than on its own masthead. */}
      <p className="mt-2 text-sm text-fg">{paper.authors?.join(" · ")}</p>
      <p className="mt-1 font-mono text-xs text-fg-muted">
        Preprint · {paper.year} · manuscript in preparation
      </p>

      <p className="mt-6 leading-relaxed text-fg-muted">
        Five machine learning algorithms are benchmarked across five public intrusion detection
        datasets and then combined into a two-tier stacking ensemble. The subject of the study is
        as much the evaluation protocol as the models: the whole pipeline is arranged so that no
        learned step can see data outside its own training partition, and each dataset is split
        along whatever boundary it genuinely supports rather than at random.
      </p>
      <p className="mt-4 leading-relaxed text-fg-muted">
        That distinction is the point. A random split over network traffic lets a model be right
        for reasons that have nothing to do with detection — a duplicated flow record, a capture
        timestamp that happens to separate the attack simulations from the benign baseline, a
        source port that is unique to one host. Each of those is a way of being accidentally
        correct, and each one is removed here deliberately.
      </p>

      <Heading>Datasets</Heading>
      <p className="mt-2 leading-relaxed text-fg-muted">
        The first four differ in age, capture environment and traffic type, so that a result
        holding across all of them is likelier to generalise than one tuned to a single capture.
      </p>
      <Table
        head={["Dataset", "Raw rows", "Clean rows", "Classes", "Features", "Role"]}
        rows={[
          ["CIC-IDS2017", "3,119,345", "2,518,083", "15", "79", "Modern flows; supports correlation"],
          ["UNSW-NB15", "2,540,047", "2,059,414", "10", "40", "Widely reported benchmark"],
          ["ToN-IoT", "211,043", "190,474", "10", "39", "IoT traffic; majority-attack"],
          ["NSL-KDD", "148,517", "148,517", "40", "41", "Reference set with a fixed split"],
          ["NF-UNSW-NB15-v3", "2,365,424", "2,350,609", "10", "45", "UNSW re-extracted as NetFlow"],
          ["Total", "8,384,376", "7,267,097", "—", "—", "—"],
        ]}
      />
      <p className="mt-4 leading-relaxed text-fg-muted">
        The fifth is not a fifth environment. NF-UNSW-NB15-v3 is the same UNSW-NB15 capture
        re-extracted with a standard NetFlow feature set, which makes it a controlled comparison
        isolating the effect of the feature set — so the five are never averaged as though they
        were five independent captures. Class imbalance is the dominant property of this data
        throughout, and most of the design below follows from it.
      </p>

      <Heading>Evaluation protocol</Heading>
      <p className="mt-2 leading-relaxed text-fg-muted">
        Each split is chosen by what the dataset supports, not by preference. Where a capture
        carries time, the split respects it; where it carries host identity but no clock, whole
        hosts move together; where the literature reports on a published boundary, that boundary
        is used. A random stratified split is retained alongside as a baseline for comparison with
        published figures, never as evidence of generalisation.
      </p>
      <Table
        head={["Dataset", "Primary split", "Split key"]}
        rows={[
          ["CIC-IDS2017", "Temporal, by capture day", "timestamp, grouped by capture file"],
          ["UNSW-NB15", "Temporal", "Stime"],
          ["ToN-IoT", "Grouped, by source host", "src_ip"],
          ["NSL-KDD", "Canonical published split", "KDDTrain+ / KDDTest+"],
          ["NF-UNSW-NB15-v3", "Temporal", "FLOW_START_MILLISECONDS"],
        ]}
      />

      <Heading>Models under comparison</Heading>
      <p className="mt-2 leading-relaxed text-fg-muted">
        All base learners run at near-default hyperparameters, since tuning one harder than the
        rest would measure effort rather than algorithms. Each is a complete pipeline in its own
        right — impute, scale, encode, select, resample — rebuilt inside every fold, and the
        meta-learner is fitted on out-of-fold predictions so it never sees a base model scoring
        rows it was trained on.
      </p>
      <Table
        head={["Model", "Family", "Role"]}
        rows={[
          ["XGBoost", "Gradient-boosted trees", "Base learner"],
          ["LightGBM", "Gradient-boosted trees", "Base learner"],
          ["CatBoost", "Gradient-boosted trees", "Base learner"],
          ["Random Forest", "Bagged trees", "Base learner"],
          ["MLP (100, 50)", "Feed-forward network", "Base learner"],
          ["Logistic Regression", "Linear", "Meta-learner, on out-of-fold predictions"],
        ]}
      />

      <Heading>Preprocessing and leakage control</Heading>
      <p className="mt-2 leading-relaxed text-fg-muted">
        Deduplication runs on feature columns plus target, before the split, and a hard assertion
        re-hashes both sides afterwards and raises if any test row still matches a training row —
        an exception rather than a warning, because a leaking split does not produce a missing
        number, it produces a confident wrong one that nothing downstream can catch. Rows with
        identical features but conflicting labels are kept deliberately: memorising such a row is
        wrong as often as right, so it cannot inflate a score, though it does cap what is
        achievable.
      </p>
      <p className="mt-4 leading-relaxed text-fg-muted">
        Rebalancing is capped rather than absolute. The majority class is undersampled and
        minorities raised to meet it, but no class is inflated beyond a fixed multiple of its real
        support, because synthesising a hundred thousand points from a handful of genuine ones
        manufactures a class rather than balancing it. Test data is separated before any
        resampling and is never transformed.
      </p>

      <Heading>Feature selection and capture artifacts</Heading>
      <p className="mt-2 leading-relaxed text-fg-muted">
        Features are ranked by Random Forest importance on the training partition and the top
        twenty retained, with selection and scaling as steps of the fitted pipeline rather than
        standalone stages — an earlier design ran them as scripts writing intermediate files,
        which put both outside the split boundary.
      </p>
      <p className="mt-4 leading-relaxed text-fg-muted">
        Removing capture artifacts mattered more than the selection itself. Flow start timestamps
        rank highly for the simple reason that the attack simulations were run on different days
        from the benign baseline; source ports rank highly because they are ephemeral and
        near-unique; TCP base sequence numbers are near-unique by construction. A model handed any
        of these learns the capture, not the traffic. All are excluded, while destination port is
        retained as a genuine property of a flow. Two of the captures need a second control, since
        host identity survives in their TTL and packet-length columns, so every run on those exists
        in both artifact-present and artifact-controlled variants.
      </p>

      <Heading>Tasks</Heading>
      <p className="mt-2 leading-relaxed text-fg-muted">
        Every dataset that supports both is evaluated on two tasks over the same rows and the same
        split: a binary one, asking whether a flow is an attack, and a multiclass one, asking which
        family it belongs to. Metrics are macro-averaged, because accuracy on this data is
        dominated by the benign class and reports a healthy number for a model that has learned
        almost nothing about the rare classes. Attack families that appear only at test time are
        mapped to a sentinel no model can predict and counted as misses, which is the honest score
        for a family never shown to the model.
      </p>
      <p className="mt-4 leading-relaxed text-fg-muted">
        A third strand covers alert correlation. No dataset ships correlation labels, so pairs are
        derived by treating flows as alerts and pairing them; only two of the five carry the
        addresses and timestamps this needs.
      </p>

      <Heading>Status</Heading>
      <p className="mt-2 leading-relaxed text-fg-muted">
        Base-model training and ensemble evaluation are complete across every dataset, task, split
        and variant combination, and each figure is generated from saved prediction arrays rather
        than transcribed. Results are held back for the full manuscript, which is in preparation.
      </p>
    </article>
  );
}
