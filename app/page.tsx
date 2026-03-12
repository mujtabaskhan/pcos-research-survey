"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sendSurveyMail, SurveyAnswers } from "./actions/send-mail";

/* ─── Types ──────────────────────────────────────────────── */
type QuestionDef = {
  name: string;
  label: string;
  note?: string;
  type: "radio" | "checkbox" | "likert";
  cols?: 2 | 3 | 4;
  options: { value: string; label: string }[];
};

type SectionDef = {
  number: number;
  title: string;
  subtitle: string;
  questions: QuestionDef[];
};

/* ─── Survey data ─────────────────────────────────────────── */
const SECTIONS: SectionDef[] = [
  {
    number: 1,
    title: "Demographic Information",
    subtitle: "Basic profile details",
    questions: [
      {
        name: "q0", label: "What is your age group?", type: "radio", cols: 4,
        options: [
          { value: "lt18",  label: "Under 18" },
          { value: "18-24", label: "18–24" },
          { value: "25-34", label: "25–34" },
          { value: "35-44", label: "35–44" },
          { value: "45+",   label: "45 and above" },
        ],
      },
      {
        name: "q1", label: "What is your gender?", type: "radio", cols: 3,
        options: [
          { value: "female",        label: "Female" },
          { value: "male",          label: "Male" },
          { value: "nonbinary",     label: "Non-binary" },
          { value: "prefernot",     label: "Prefer not to say" },
        ],
      },
      {
        name: "q2", label: "What is your educational background?", type: "radio", cols: 2,
        options: [
          { value: "highschool",  label: "High School or below" },
          { value: "diploma",     label: "Diploma / Certificate" },
          { value: "bachelor",    label: "Bachelor's Degree" },
          { value: "postgrad",    label: "Postgraduate (Master's / PhD)" },
          { value: "medical",     label: "Medical / Health Sciences" },
        ],
      },
      {
        name: "q3", label: "What is your current Body Mass Index (BMI) category?", type: "radio", cols: 2,
        options: [
          { value: "underweight",   label: "Underweight (< 18.5)" },
          { value: "normal",        label: "Normal weight (18.5–24.9)" },
          { value: "overweight",    label: "Overweight (25–29.9)" },
          { value: "obese",         label: "Obese (≥ 30)" },
          { value: "dontknow",      label: "I don't know" },
        ],
      },
    ],
  },
  {
    number: 2,
    title: "PCOS Background",
    subtitle: "Diagnosis, symptoms, and current treatment",
    questions: [
      {
        name: "q4", label: "Have you been diagnosed with Polycystic Ovary Syndrome (PCOS)?", type: "radio", cols: 3,
        options: [
          { value: "yes",       label: "Yes" },
          { value: "no",        label: "No" },
          { value: "suspected", label: "Suspected but not confirmed" },
        ],
      },
      {
        name: "q5", label: "If yes, how long ago were you diagnosed?", type: "radio", cols: 2,
        options: [
          { value: "lt1yr",  label: "Less than 1 year ago" },
          { value: "1-3yr",  label: "1–3 years ago" },
          { value: "3-5yr",  label: "3–5 years ago" },
          { value: "gt5yr",  label: "More than 5 years ago" },
          { value: "na",     label: "Not applicable" },
        ],
      },
      {
        name: "q6",
        label: "Which PCOS symptoms have you experienced? (Select all that apply)",
        note: "Please select all that apply.",
        type: "checkbox", cols: 2,
        options: [
          { value: "irregular_periods",  label: "Irregular or absent periods" },
          { value: "weight_gain",        label: "Weight gain / difficulty losing weight" },
          { value: "acne",               label: "Acne / oily skin" },
          { value: "hair_loss",          label: "Hair loss / thinning" },
          { value: "hirsutism",          label: "Excess facial / body hair (hirsutism)" },
          { value: "infertility",        label: "Difficulty conceiving" },
          { value: "mood",               label: "Mood swings / depression / anxiety" },
          { value: "none",               label: "None of the above" },
        ],
      },
      {
        name: "q7", label: "What is your current PCOS treatment?", type: "radio", cols: 2,
        options: [
          { value: "medication",   label: "Medication (e.g., metformin, OCP)" },
          { value: "lifestyle",    label: "Lifestyle changes only" },
          { value: "supplements",  label: "Supplements / herbal remedies" },
          { value: "combined",     label: "Combination of the above" },
          { value: "none",         label: "No current treatment" },
        ],
      },
    ],
  },
  {
    number: 3,
    title: "Nutritional Awareness",
    subtitle: "Knowledge of diet in PCOS management",
    questions: [
      {
        name: "q8", label: "Are you aware that nutritional management can help control PCOS symptoms?", type: "radio", cols: 3,
        options: [
          { value: "yes",      label: "Yes, fully aware" },
          { value: "partial",  label: "Somewhat aware" },
          { value: "no",       label: "Not aware" },
        ],
      },
      {
        name: "q9", label: "Where do you primarily get nutritional information about PCOS? (Select all that apply)", type: "checkbox", cols: 2,
        options: [
          { value: "doctor",        label: "Doctor / gynaecologist" },
          { value: "dietitian",     label: "Nutritionist / dietitian" },
          { value: "internet",      label: "Internet / social media" },
          { value: "books",         label: "Books / journals" },
          { value: "community",     label: "Community / support groups" },
          { value: "none",          label: "I don't seek nutritional information" },
        ],
      },
      {
        name: "q10", label: "Are you aware that a low-glycaemic index (low-GI) diet may help manage insulin resistance in PCOS?", type: "radio", cols: 3,
        options: [
          { value: "yes",      label: "Yes" },
          { value: "no",       label: "No" },
          { value: "notsure",  label: "Not Sure" },
        ],
      },
      {
        name: "q11", label: "Do you believe omega-3 fatty acids (found in fatty fish, flaxseeds) may benefit PCOS symptoms?", type: "radio", cols: 3,
        options: [
          { value: "yes",      label: "Yes" },
          { value: "no",       label: "No" },
          { value: "notsure",  label: "Not Sure" },
        ],
      },
      {
        name: "q12", label: "Are you aware of anti-inflammatory foods (e.g., berries, leafy greens, turmeric) and their potential benefit in managing PCOS?", type: "radio", cols: 3,
        options: [
          { value: "yes",      label: "Yes" },
          { value: "no",       label: "No" },
          { value: "notsure",  label: "Not Sure" },
        ],
      },
      {
        name: "q13", label: "Do you believe that reducing dairy intake may improve PCOS symptoms?", type: "radio", cols: 3,
        options: [
          { value: "yes",        label: "Yes" },
          { value: "no",         label: "No" },
          { value: "notsure",    label: "Not Sure" },
          { value: "depends",    label: "It depends" },
        ],
      },
    ],
  },
  {
    number: 4,
    title: "Supplement Use",
    subtitle: "Current supplementation practices and awareness",
    questions: [
      {
        name: "q14",
        label: "Which supplements do you currently take for PCOS? (Select all that apply)",
        type: "checkbox", cols: 2,
        options: [
          { value: "inositol",     label: "Inositol (myo-inositol / D-chiro-inositol)" },
          { value: "vitd",         label: "Vitamin D" },
          { value: "omega3",       label: "Omega-3 / fish oil" },
          { value: "magnesium",    label: "Magnesium" },
          { value: "zinc",         label: "Zinc" },
          { value: "nac",          label: "N-acetylcysteine (NAC)" },
          { value: "berberine",    label: "Berberine" },
          { value: "evening",      label: "Evening primrose oil" },
          { value: "none",         label: "None" },
        ],
      },
      {
        name: "q15", label: "Have you heard of inositol (specifically myo-inositol or D-chiro-inositol) as a supplement for PCOS management?", type: "radio", cols: 3,
        options: [
          { value: "yes_used",    label: "Yes, and I've used it" },
          { value: "yes_noused",  label: "Yes, but haven't used it" },
          { value: "no",          label: "No, never heard of it" },
        ],
      },
      {
        name: "q16", label: "What is your primary reason for taking supplements for PCOS?", type: "radio", cols: 2,
        options: [
          { value: "recommended",   label: "Recommended by a healthcare professional" },
          { value: "selfreport",    label: "Self-researched online" },
          { value: "family",        label: "Advised by family / friends" },
          { value: "notaking",      label: "I do not take supplements" },
        ],
      },
      {
        name: "q17", label: "Have you consulted a nutritionist or dietitian specifically for PCOS management?", type: "radio", cols: 3,
        options: [
          { value: "yes_reg",    label: "Yes, regularly" },
          { value: "yes_once",   label: "Yes, once or twice" },
          { value: "no",         label: "No" },
        ],
      },
    ],
  },
  {
    number: 5,
    title: "Dietary Attitudes & Behaviour",
    subtitle: "Personal dietary choices and awareness",
    questions: [
      {
        name: "q18", label: "Do you believe that diet significantly influences PCOS symptoms?", type: "radio", cols: 3,
        options: [
          { value: "strongly",   label: "Strongly agree" },
          { value: "agree",      label: "Agree" },
          { value: "neutral",    label: "Neutral" },
          { value: "disagree",   label: "Disagree" },
        ],
      },
      {
        name: "q19", label: "Are you interested in improving your diet to better manage PCOS?", type: "radio", cols: 3,
        options: [
          { value: "yes",      label: "Yes" },
          { value: "already",  label: "Already doing it" },
          { value: "no",       label: "No" },
        ],
      },
      {
        name: "q20",
        label: "Have you tried any of the following dietary changes for PCOS management? (Select all that apply)",
        type: "checkbox", cols: 2,
        options: [
          { value: "lowgi",       label: "Low-GI diet" },
          { value: "antiinflam",  label: "Anti-inflammatory diet" },
          { value: "dairyfree",   label: "Dairy-free diet" },
          { value: "glutenfree",  label: "Gluten-free diet" },
          { value: "intermit",    label: "Intermittent fasting" },
          { value: "none",        label: "None" },
        ],
      },
    ],
  },
  {
    number: 6,
    title: "Functional Foods & Herbal Remedies",
    subtitle: "Awareness and use of natural food-based interventions",
    questions: [
      {
        name: "q21", label: "Do you think functional foods rich in antioxidants (such as moringa, cinnamon, and turmeric) may help improve PCOS symptoms?", type: "radio", cols: 3,
        options: [
          { value: "yes",      label: "Yes" },
          { value: "no",       label: "No" },
          { value: "notsure",  label: "Not Sure" },
        ],
      },
      {
        name: "q22", label: "Which of the following seeds are commonly used in the first phase of seed cycling to help balance hormones?", type: "radio", cols: 2,
        options: [
          { value: "flax_pumpkin",      label: "Flax seeds & Pumpkin seeds" },
          { value: "sunflower_sesame",  label: "Sunflower seeds & Sesame seeds" },
          { value: "chia_mustard",      label: "Chia seeds & Mustard seeds" },
          { value: "dontknow",          label: "I don't know" },
        ],
      },
    ],
  },
  {
    number: 7,
    title: "Lifestyle Interventions",
    subtitle: "Exercise, sleep, stress, and daily habits",
    questions: [
      {
        name: "q23",
        label: "How often do you engage in physical exercise per week, and what type do you primarily perform?",
        note: "Please select the option that best describes your current exercise routine.",
        type: "radio", cols: 2,
        options: [
          { value: "never",        label: "I do not exercise" },
          { value: "1-2_aerobic",  label: "1–2×/week – Aerobic (walking/jogging)" },
          { value: "3-4_resist",   label: "3–4×/week – Resistance training" },
          { value: "5+_hiit",      label: "5+×/week – HIIT or mixed" },
          { value: "yoga",         label: "Any frequency – Yoga / stretching" },
        ],
      },
      {
        name: "q24", label: "How would you describe your sleep habits and quality?", type: "radio", cols: 2,
        options: [
          { value: "lt5_poor",   label: "Less than 5 hrs – Poor quality" },
          { value: "5-6_avg",    label: "5–6 hrs – Average quality" },
          { value: "7-8_good",   label: "7–8 hrs – Good quality" },
          { value: "8+_vgood",   label: "More than 8 hrs – Very good quality" },
        ],
      },
      {
        name: "q25", label: "How often do you feel stressed, and do you practice any stress-management techniques?", type: "radio", cols: 2,
        options: [
          { value: "often_yes",      label: "Often stressed – Yes, I manage it" },
          { value: "often_no",       label: "Often stressed – No management" },
          { value: "sometimes_yes",  label: "Sometimes stressed – Yes, I manage it" },
          { value: "rarely",         label: "Rarely or never stressed" },
        ],
      },
      {
        name: "q26", label: "Which type of diet do you currently follow?", type: "radio", cols: 2,
        options: [
          { value: "balanced",  label: "Balanced / general healthy diet" },
          { value: "highprot",  label: "High-protein diet" },
          { value: "lowcarb",   label: "Low-carbohydrate diet" },
          { value: "plant",     label: "Vegetarian / plant-based diet" },
          { value: "none",      label: "No specific diet" },
        ],
      },
    ],
  },
  {
    number: 8,
    title: "Supplement Safety & Adherence",
    subtitle: "Awareness of risks, interactions, and challenges",
    questions: [
      {
        name: "q27", label: "Are you aware that dietary or herbal supplements may cause side effects and could interact with prescribed PCOS medications (e.g., metformin or oral contraceptive pills)?", type: "radio", cols: 2,
        options: [
          { value: "yes_aware",        label: "Yes, aware of both" },
          { value: "aware_se_only",    label: "Aware of side effects only" },
          { value: "aware_inter_only", label: "Aware of drug interactions only" },
          { value: "not_aware",        label: "Not aware of either" },
        ],
      },
      {
        name: "q28",
        label: "What practical challenges do you face when taking supplements for PCOS? (Select all that apply)",
        type: "checkbox", cols: 2,
        options: [
          { value: "cost",        label: "High cost" },
          { value: "toomanypills", label: "Too many pills / products" },
          { value: "forgetting",  label: "Forgetting doses" },
          { value: "unclear",     label: "Unclear benefits" },
          { value: "sideeffects", label: "Side effects experienced" },
          { value: "noguidance",  label: "Lack of medical guidance" },
        ],
      },
    ],
  },
  {
    number: 9,
    title: "Clinical Implications of Nutrition",
    subtitle: "Overall views on nutrition, treatment, and counseling",
    questions: [
      {
        name: "q29",
        label: "Dietary changes combined with medical treatment can significantly improve PCOS management outcomes, and being overweight can worsen PCOS symptoms.",
        type: "likert",
        options: [
          { value: "1", label: "Strongly Disagree" },
          { value: "2", label: "Disagree" },
          { value: "3", label: "Neutral" },
          { value: "4", label: "Agree" },
          { value: "5", label: "Strongly Agree" },
        ],
      },
      {
        name: "q31", label: "Which of the following do you consider most important for managing PCOS, and are you willing to adopt these changes?", type: "radio", cols: 2,
        options: [
          { value: "diet_yes",     label: "Healthy diet – Yes, willing to adopt" },
          { value: "exercise_yes", label: "Regular exercise – Yes, willing to adopt" },
          { value: "all_yes",      label: "All of the above – Yes, willing" },
          { value: "all_maybe",    label: "All of the above – Maybe" },
        ],
      },
    ],
  },
];

const TOTAL_Q = SECTIONS.reduce((acc, s) => acc + s.questions.length, 0);

/* ─── Toast helper ────────────────────────────────────────── */
function Toast({ msg, kind }: { msg: string; kind: "success" | "error" }) {
  return (
    <div className={`toast ${kind}`} role="alert" aria-live="polite">
      {msg}
    </div>
  );
}

/* ─── Page component ──────────────────────────────────────── */
export default function SurveyPage() {
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<{ msg: string; kind: "success" | "error" } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string, kind: "success" | "error") => {
    setToast({ msg, kind });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  /* recalculate progress whenever answers change */
  const recalcProgress = useCallback((ans: SurveyAnswers) => {
    const answered = Object.values(ans).filter((v) =>
      Array.isArray(v) ? v.length > 0 : v !== ""
    ).length;
    setProgress(Math.round((answered / TOTAL_Q) * 100));
  }, []);

  const handleRadio = (name: string, value: string) => {
    const next = { ...answers, [name]: value };
    setAnswers(next);
    recalcProgress(next);
  };

  const handleCheckbox = (name: string, value: string, checked: boolean) => {
    const current = (answers[name] as string[] | undefined) ?? [];
    const next = checked ? [...current, value] : current.filter((v) => v !== value);
    const updated = { ...answers, [name]: next };
    setAnswers(updated);
    recalcProgress(updated);
  };

  const handleSubmit = async () => {
    const answeredCount = Object.values(answers).filter((v) =>
      Array.isArray(v) ? v.length > 0 : v !== ""
    ).length;

    if (answeredCount < 25) {
      showToast("Please answer at least the majority of questions before submitting.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const result = await sendSurveyMail(answers);
      if (result.status === 200) {
        setSubmitted(true);
        setProgress(100);
        showToast("Response submitted successfully — thank you!", "success");
      } else {
        showToast("Failed to submit. Please try again.", "error");
      }
    } catch {
      showToast("An unexpected error occurred. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* Render a single question */
  const renderQuestion = (q: QuestionDef, globalIdx: number) => {
    const qNum = globalIdx + 1;
    return (
      <div className="q-card" key={q.name}>
        <span className="q-number">Question {qNum} of {TOTAL_Q}</span>
        <p className="q-text" dangerouslySetInnerHTML={{ __html: q.label }} />
        {q.note && <p className="q-note">{q.note}</p>}

        {q.type === "likert" ? (
          <div className="likert-row">
            {q.options.map((opt) => (
              <label className="likert-option" key={opt.value}>
                <input
                  type="radio"
                  name={q.name}
                  value={opt.value}
                  checked={answers[q.name] === opt.value}
                  onChange={() => handleRadio(q.name, opt.value)}
                />
                <span className="likert-label">{opt.label}</span>
              </label>
            ))}
          </div>
        ) : (
          <div className={`options-grid cols-${q.cols ?? 2}`}>
            {q.options.map((opt) => (
              <label className="option-label" key={opt.value}>
                <input
                  type={q.type}
                  name={q.name}
                  value={opt.value}
                  checked={
                    q.type === "checkbox"
                      ? ((answers[q.name] as string[] | undefined) ?? []).includes(opt.value)
                      : answers[q.name] === opt.value
                  }
                  onChange={(e) =>
                    q.type === "checkbox"
                      ? handleCheckbox(q.name, opt.value, e.target.checked)
                      : handleRadio(q.name, opt.value)
                  }
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

  let globalIdx = 0;

  return (
    <>
      {/* Header */}
      <div className="header-banner">
        <span>PCOS Research Survey</span>
        <span>Research Study · 2025</span>
      </div>

      {/* Cover */}
      <div className="cover">
        <span className="cover-label">Research Instrument · Nutritional Management</span>
        <h1>
          Awareness & Use of <em>Nutrition, Supplements</em> and Lifestyle Interventions in PCOS
        </h1>
        <p className="cover-sub">
          This questionnaire is designed to assess your knowledge and practices regarding nutritional approaches and supplementation for Polycystic Ovary Syndrome (PCOS) management. Your participation is voluntary and all responses are anonymous.
        </p>
        <div className="cover-divider" />
        <div className="cover-meta">
          <div className="cover-meta-item">
            <label>Estimated Time</label>
            <span>8–12 minutes</span>
          </div>
          <div className="cover-meta-item">
            <label>Total Questions</label>
            <span>{TOTAL_Q} items</span>
          </div>
          <div className="cover-meta-item">
            <label>Sections</label>
            <span>9 sections</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-wrap" aria-label="Survey progress">
        <span className="progress-label">Progress</span>
        <div className="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="progress-label" id="progressPct">{progress}%</span>
      </div>

      {/* Survey Body */}
      <div className="survey-body">
        <div className="instructions">
          <p>
            <strong>Instructions:</strong> Please read each question carefully and select the response that best describes your experience or opinion. For questions that allow multiple selections, check all that apply. There are no right or wrong answers — your honest responses are greatly appreciated.
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          {SECTIONS.map((section) => (
            <div key={section.number}>
              <div className="section-header">
                <div className="section-number">{section.number}</div>
                <div className="section-info">
                  <h2>{section.title}</h2>
                  <p>{section.subtitle}</p>
                </div>
              </div>
              <div className="section-rule" />

              {section.questions.map((q) => {
                const node = renderQuestion(q, globalIdx);
                globalIdx++;
                return node;
              })}
            </div>
          ))}

          {/* Submit */}
          <div className="submit-section">
            {submitted ? (
              <>
                <h3>✓ Response Submitted</h3>
                <p>Thank you for completing the survey. Your responses have been recorded and will contribute to important research on PCOS management.</p>
              </>
            ) : (
              <>
                <h3>Thank you for your participation</h3>
                <p>Your responses will contribute to important research on PCOS management. Please review your answers before submitting.</p>
                <button
                  type="submit"
                  className={`btn-submit${submitted ? " success" : ""}`}
                  disabled={submitting || submitted}
                >
                  {submitting ? "Submitting…" : "Submit Questionnaire"}
                </button>
              </>
            )}
          </div>
        </form>
      </div>

      {/* Toast notification */}
      {toast && <Toast msg={toast.msg} kind={toast.kind} />}
    </>
  );
}
