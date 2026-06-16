"use client";

import { useState } from "react";
import styles from "./FollowUpQuestions.module.css";

export default function FollowUpQuestions({ questions, onSubmit, onSkip }) {
  const [answers, setAnswers] = useState({});

  const handleSelect = (question, option) => {
    setAnswers((prev) => ({ ...prev, [question]: option }));
  };

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  return (
    <div className={styles.container} id="follow-up-questions">
      <div className={styles.header}>
        <div className={styles.aiAvatar}>🤖</div>
        <div>
          <p className={styles.title}>Just a couple of things…</p>
          <p className={styles.subtitle}>
            Answer these to get precise nutrition data
          </p>
        </div>
      </div>

      <div className={styles.questions}>
        {questions.map((q, i) => (
          <div key={i} className={styles.questionBlock}>
            <p className={styles.question}>
              <span className={styles.qNum}>{i + 1}</span>
              {q.question}
            </p>
            <div className={styles.options}>
              {q.options.map((opt, j) => (
                <button
                  key={j}
                  className={`chip ${answers[q.question] === opt ? "chip-green active" : ""}`}
                  onClick={() => handleSelect(q.question, opt)}
                  id={`q${i}-opt${j}`}
                >
                  {answers[q.question] === opt && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <button
          className="btn btn-primary btn-full"
          onClick={() => onSubmit(answers)}
          disabled={!allAnswered}
          id="submit-answers-btn"
        >
          {allAnswered ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="9" />
              </svg>
              Recalculate Nutrition
            </>
          ) : (
            `Answer ${questions.length - answeredCount} more…`
          )}
        </button>
        <button
          className="btn btn-ghost btn-full"
          onClick={onSkip}
          id="skip-questions-btn"
        >
          Skip & use current estimates
        </button>
      </div>
    </div>
  );
}
