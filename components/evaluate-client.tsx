"use client";

import { useMemo, useState } from "react";
import { Check, TriangleAlert } from "lucide-react";
import { EVALUATE_QUESTIONS, evaluateTools, type IntakeAnswers } from "@/lib/evaluate";
import { withBasePath } from "@/lib/site";
import { formatToolTypeLabel, toolTypeTintStyles } from "@/lib/tool-type";
import type { Tool } from "@/lib/types";

type AnswerState = Partial<Record<keyof IntakeAnswers, string>>;

export function EvaluateClient({ tools }: { tools: Tool[] }) {
  const [answers, setAnswers] = useState<AnswerState>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = EVALUATE_QUESTIONS.every((question) => Boolean(answers[question.id]));

  const results = useMemo(() => {
    if (!submitted || !allAnswered) return [];
    return evaluateTools(tools, answers as IntakeAnswers);
  }, [submitted, allAnswered, answers, tools]);

  function selectAnswer(id: keyof IntakeAnswers, value: string) {
    setAnswers((current) => ({ ...current, [id]: value }));
    setSubmitted(false);
  }

  function reset() {
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (allAnswered) setSubmitted(true);
        }}
        className="flex flex-col gap-4"
      >
        {EVALUATE_QUESTIONS.map((question, index) => (
          <fieldset
            key={question.id}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5"
          >
            <legend className="px-1 text-sm font-semibold text-[var(--color-text-primary)]">
              {index + 1}. {question.label}
            </legend>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{question.help}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {question.options.map((option) => {
                const checked = answers[question.id] === option.value;
                return (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm transition ${
                      checked
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-text-inverse)]"
                        : "border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.value}
                      checked={checked}
                      onChange={() => selectAnswer(question.id, option.value)}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!allAnswered}
            className="inline-flex items-center rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--color-text-inverse)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Show my shortlist
          </button>
          {Object.keys(answers).length > 0 ? (
            <button
              type="button"
              onClick={reset}
              className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:underline"
            >
              Start over
            </button>
          ) : null}
          {!allAnswered ? (
            <span className="text-xs text-[var(--color-text-secondary)]" aria-live="polite">
              Answer all {EVALUATE_QUESTIONS.length} questions to see results.
            </span>
          ) : null}
        </div>
      </form>

      {submitted && allAnswered ? (
        <section aria-live="polite" className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {results.length > 0 ? `Top ${results.length} for your requirements` : "No matches"}
          </h2>
          {results.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)]">
              No tracked tools satisfy every hard requirement. Try relaxing the deployment or licensing constraint.
            </p>
          ) : (
            <ol className="flex flex-col gap-3">
              {results.map((result, index) => (
                <li
                  key={result.tool.id}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[var(--color-text-secondary)]">#{index + 1}</span>
                        <a
                          href={withBasePath(`/tools/${result.tool.id}`)}
                          className="truncate text-base font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-primary)] hover:underline"
                        >
                          {result.tool.name}
                        </a>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${toolTypeTintStyles[result.tool.type]}`}>
                          {formatToolTypeLabel(result.tool.type)}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-[var(--color-text-secondary)]">{result.tool.description}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[var(--color-bg-surface)] px-2.5 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                      Fit {result.score}
                    </span>
                  </div>

                  {result.matches.length > 0 ? (
                    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                      {result.matches.map((match) => (
                        <li key={match} className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-primary)]">
                          <Check size={13} className="text-[var(--color-success)]" />
                          {match}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {result.cautions.length > 0 ? (
                    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                      {result.cautions.map((cautionText) => (
                        <li key={cautionText} className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                          <TriangleAlert size={13} className="text-[var(--color-warning)]" />
                          {cautionText}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <a
                    href={withBasePath(`/tools/${result.tool.id}`)}
                    className="mt-3 inline-flex text-sm font-medium text-[var(--color-primary)] hover:underline"
                  >
                    View full governance posture
                  </a>
                </li>
              ))}
            </ol>
          )}
        </section>
      ) : null}
    </div>
  );
}
