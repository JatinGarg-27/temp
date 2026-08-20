import type { InterviewPrepResponse } from "@/lib/schema";

const CATEGORY_LABEL: Record<string, string> = {
  technical: "Technical",
  behavioral: "Behavioral",
  situational: "Situational",
  "role-specific": "Role-specific",
};

type Props = {
  data: InterviewPrepResponse;
};

export function QuestionList({ data }: Props) {
  return (
    <section aria-labelledby="results-heading" className="flex flex-col gap-6">
      <div>
        <h2 id="results-heading" className="text-xl font-semibold">
          Your interview prep
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{data.candidateSummary}</p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-foreground">Focus areas</h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {data.focusAreas.map((area) => (
            <li
              key={area}
              className="rounded-full border border-black/15 dark:border-white/20 px-3 py-1 text-xs"
            >
              {area}
            </li>
          ))}
        </ul>
      </div>

      <ol className="flex flex-col gap-4">
        {data.questions.map((q, i) => (
          <li
            key={i}
            className="rounded-lg border border-black/10 dark:border-white/15 p-4 flex flex-col gap-2"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium text-foreground">{q.question}</p>
              <span className="shrink-0 rounded-full bg-black/[.06] dark:bg-white/[.08] px-2.5 py-1 text-xs font-medium">
                {CATEGORY_LABEL[q.category] ?? q.category}
              </span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{q.rationale}</p>
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                A strong answer covers
              </h4>
              <ul className="mt-1 list-disc pl-5 text-sm text-zinc-600 dark:text-zinc-400">
                {q.whatAGoodAnswerCovers.map((point, j) => (
                  <li key={j}>{point}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
