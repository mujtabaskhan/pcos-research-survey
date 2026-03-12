"use client";

import { useCallback, useRef, useState } from "react";
import { sendSurveyMail, SurveyAnswers } from "./actions/send-mail";

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

const SECTIONS: SectionDef[] = [
  {
    number: 1,
    title: "Demographic Information",
    subtitle: "Basic background details about yourself",
    questions: [
      {
        name: "q1", label: "What is your age group?", type: "radio", cols: 2,
        options: [
          { value: "under18", label: "Under 18" },
          { value: "18-24",   label: "18 – 24 years" },
          { value: "25-34",   label: "25 – 34 years" },
          { value: "35-44",   label: "35 – 44 years" },
          { value: "45+",     label: "45 years or older" },
        ],
      },
      {
        name: "q1b", label: "What is your current weight?", type: "radio", cols: 2,
        options: [
          { value: "under40", label: "Less than 40 KG" },
          { value: "40-60",   label: "40–60 KG" },
          { value: "60-80",   label: "60–80 KG" },
          { value: "80-100",  label: "80–100 KG" },
          { value: "100+",    label: "More than 100 KG" },
        ],
      },
      {
        name: "q2", label: "What is your highest level of education?", type: "radio", cols: 2,
        options: [
          { value: "hs",       label: "High School" },
          { value: "bachelor", label: "Bachelor's Degree" },
          { value: "master",   label: "Master's Degree" },
          { value: "phd",      label: "Doctorate / PhD" },
          { value: "other",    label: "Other" },
        ],
      },
      {
        name: "q3", label: "What is your current employment status?", type: "radio", cols: 2,
        options: [
          { value: "student",    label: "Student" },
          { value: "employed",   label: "Employed" },
          { value: "unemployed", label: "Unemployed" },
          { value: "homemaker",  label: "Homemaker" },
        ],
      },
      {
        name: "q4", label: "How long ago were you diagnosed with PCOS?", type: "radio", cols: 2,
        options: [
          { value: "lt1",     label: "Less than 1 year" },
          { value: "1-3",     label: "1 – 3 years" },
          { value: "3-5",     label: "3 – 5 years" },
          { value: "gt5",     label: "More than 5 years" },
          { value: "notdiag", label: "Not diagnosed" },
        ],
      },
    ],
  },
  {
    number: 2,
    title: "PCOS Awareness & Symptoms",
    subtitle: "Your familiarity with PCOS and related experiences",
    questions: [
      {
        name: "q5",
        label: "Which of the following PCOS symptoms have you personally experienced? <em>(Select all that apply)</em>",
        type: "checkbox", cols: 2,
        options: [
          { value: "irregular",  label: "Irregular menstrual cycles" },
          { value: "acne",       label: "Acne or severe pimples" },
          { value: "hirsutism",  label: "Excess facial / body hair" },
          { value: "hairloss",   label: "Hair thinning or hair loss" },
          { value: "weightgain", label: "Weight gain / abdominal fat" },
          { value: "none",       label: "None of the above" },
        ],
      },
      {
        name: "q6", label: "Do you have a family history of PCOS or hormonal disorders?", type: "radio", cols: 3,
        options: [
          { value: "yes",     label: "Yes" },
          { value: "no",      label: "No" },
          { value: "notsure", label: "Not Sure" },
        ],
      },
      {
        name: "q7", label: "Do you believe that lifestyle modification (diet, exercise, sleep) plays an important role in managing PCOS?", type: "radio", cols: 3,
        options: [
          { value: "yes",     label: "Yes" },
          { value: "no",      label: "No" },
          { value: "notsure", label: "Not Sure" },
        ],
      },
    ],
  },
  {
    number: 3,
    title: "Dietary Patterns in PCOS Management",
    subtitle: "Evidence-based dietary approaches and your views",
    questions: [
      {
        name: "q8", label: "Have you ever followed a specific diet plan for PCOS management?", type: "radio", cols: 2,
        options: [
          { value: "yes", label: "Yes" },
          { value: "no",  label: "No" },
        ],
      },
      {
        name: "q9",
        label: "Consuming low glycemic index (low-GI) foods helps maintain stable blood glucose and may reduce insulin resistance in women with PCOS.",
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
        name: "q10",
        label: "A Mediterranean-style diet (rich in fruits, vegetables, whole grains, and healthy fats) can improve hormonal balance and overall health in women with PCOS.",
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
        name: "q11",
        label: "Limiting sugary, processed foods and refined carbohydrates may help reduce PCOS symptoms and improve insulin sensitivity.",
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
        name: "q12", label: "Are you familiar with intermittent fasting as a dietary strategy? If yes, do you think it may help improve metabolic health in women with PCOS?", type: "radio", cols: 2,
        options: [
          { value: "yes_helpful", label: "Yes, familiar & believe it helps" },
          { value: "yes_unsure",  label: "Yes, familiar but unsure" },
          { value: "notfamiliar", label: "Not familiar with it" },
          { value: "no_helps",    label: "Familiar but don't think it helps" },
        ],
      },
    ],
  },
  {
    number: 4,
    title: "Micronutrients & Supplements",
    subtitle: "Vitamins, minerals, and supplementation in PCOS care",
    questions: [
      {
        name: "q13", label: "How important do you think micronutrients (vitamins and minerals) are in improving hormonal balance and metabolism in PCOS?", type: "radio", cols: 3,
        options: [
          { value: "very",     label: "Very Important" },
          { value: "somewhat", label: "Somewhat Important" },
          { value: "not",      label: "Not Important" },
        ],
      },
      {
        name: "q14", label: "Have you ever taken supplements (such as Vitamin D, Omega-3, Magnesium, or Inositol) to help manage your PCOS symptoms?", type: "radio", cols: 3,
        options: [
          { value: "yes",      label: "Yes" },
          { value: "no",       label: "No" },
          { value: "planning", label: "Planning to Take" },
        ],
      },
      {
        name: "q15", label: "Who recommended the supplements you take (or have taken) for PCOS management?", type: "radio", cols: 2,
        options: [
          { value: "doctor", label: "Doctor or Dietitian" },
          { value: "social", label: "Internet / Social Media / Friends" },
          { value: "self",   label: "Self-decided" },
          { value: "none",   label: "I do not take supplements" },
        ],
      },
      {
        name: "q16", label: "Have you noticed any improvement in your energy levels or weight after improving your diet or taking supplements?", type: "radio", cols: 3,
        options: [
          { value: "yes",     label: "Yes" },
          { value: "no",      label: "No" },
          { value: "notsure", label: "Not Sure" },
        ],
      },
    ],
  },
  {
    number: 5,
    title: "Inositol Supplementation",
    subtitle: "Awareness and use of inositol in PCOS management",
    questions: [
      {
        name: "q17", label: "Have you ever heard about inositol supplements (e.g., Myo-inositol or D-chiro-inositol) used for PCOS management, and do you know they may help improve insulin resistance and hormonal balance?", type: "radio", cols: 3,
        options: [
          { value: "yes_know",     label: "Yes, and I know its benefits" },
          { value: "heard_unsure", label: "Heard of it, but not sure" },
          { value: "never",        label: "Never heard of it" },
        ],
      },
      {
        name: "q18", label: "Have you ever used inositol supplements, and if so, for how long?", type: "radio", cols: 2,
        options: [
          { value: "current_lt3", label: "Currently using – less than 3 months" },
          { value: "current_gt3", label: "Currently using – 3 to 6 months" },
          { value: "past_gt6",    label: "Used in the past – more than 6 months" },
          { value: "never",       label: "Never used" },
        ],
      },
      {
        name: "q19", label: "In your opinion, how important are nutritional supplements such as inositol in managing PCOS?", type: "radio", cols: 2,
        options: [
          { value: "very",     label: "Very Important" },
          { value: "somewhat", label: "Somewhat Important" },
          { value: "not",      label: "Not Important" },
          { value: "notsure",  label: "Not Sure" },
        ],
      },
    ],
  },
  {
    number: 6,
    title: "Herbal & Functional Foods",
    subtitle: "Natural remedies and functional food approaches",
    questions: [
      {
        name: "q20", label: "Which herb is commonly known to help improve insulin sensitivity in women with PCOS?", type: "radio", cols: 2,
        options: [
          { value: "cinnamon", label: "Cinnamon" },
          { value: "ginger",   label: "Ginger" },
          { value: "garlic",   label: "Garlic" },
          { value: "all",      label: "All of the above" },
        ],
      },
      {
        name: "q21", label: "Do you think functional foods rich in antioxidants (such as moringa, cinnamon, and turmeric) may help improve PCOS symptoms?", type: "radio", cols: 3,
        options: [
          { value: "yes",     label: "Yes" },
          { value: "no",      label: "No" },
          { value: "notsure", label: "Not Sure" },
        ],
      },
      {
        name: "q22", label: "Which of the following seeds are commonly used in the first phase of seed cycling to help balance hormones?", type: "radio", cols: 2,
        options: [
          { value: "flax_pumpkin",     label: "Flax seeds & Pumpkin seeds" },
          { value: "sunflower_sesame", label: "Sunflower seeds & Sesame seeds" },
          { value: "chia_mustard",     label: "Chia seeds & Mustard seeds" },
          { value: "dontknow",         label: "I don't know" },
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
          { value: "never",       label: "I do not exercise" },
          { value: "1-2_aerobic", label: "1–2×/week – Aerobic (walking/jogging)" },
          { value: "3-4_resist",  label: "3–4×/week – Resistance training" },
          { value: "5+_hiit",     label: "5+×/week – HIIT or mixed" },
          { value: "yoga",        label: "Any frequency – Yoga / stretching" },
        ],
      },
      {
        name: "q24", label: "How would you describe your sleep habits and quality?", type: "radio", cols: 2,
        options: [
          { value: "lt5_poor", label: "Less than 5 hrs – Poor quality" },
          { value: "5-6_avg",  label: "5–6 hrs – Average quality" },
          { value: "7-8_good", label: "7–8 hrs – Good quality" },
          { value: "8+_vgood", label: "More than 8 hrs – Very good quality" },
        ],
      },
      {
        name: "q25", label: "How often do you feel stressed, and do you practice any stress-management techniques?", type: "radio", cols: 2,
        options: [
          { value: "often_yes",     label: "Often stressed – Yes, I manage it" },
          { value: "often_no",      label: "Often stressed – No management" },
          { value: "sometimes_yes", label: "Sometimes stressed – Yes, I manage it" },
          { value: "rarely",        label: "Rarely or never stressed" },
        ],
      },
      {
        name: "q26", label: "Which type of diet do you currently follow?", type: "radio", cols: 2,
        options: [
          { value: "balanced", label: "Balanced / general healthy diet" },
          { value: "highprot", label: "High-protein diet" },
          { value: "lowcarb",  label: "Low-carbohydrate diet" },
          { value: "plant",    label: "Vegetarian / plant-based diet" },
          { value: "none",     label: "No specific diet" },
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
          { value: "cost",         label: "High cost" },
          { value: "toomanypills", label: "Too many pills / products" },
          { value: "forgetting",   label: "Forgetting doses" },
          { value: "unclear",      label: "Unclear benefits" },
          { value: "sideeffects",  label: "Side effects experienced" },
          { value: "noguidance",   label: "Lack of medical guidance" },
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

function Toast({ msg, kind }: { msg: string; kind: "success" | "error" }) {
  return (
    <div className={`toast ${kind}`} role="alert" aria-live="polite">
      {msg}
    </div>
  );
}

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
      <div className="header-banner">
        <span>Thesis Research · Survey Instrument</span>
        <span>Confidential &amp; Anonymous</span>
      </div>

      <div className="cover">
        <span className="cover-label">Research Questionnaire</span>
        <h1>The Role of <em>Dietary Interventions</em> &amp; Functional Foods in the Management of PCOS</h1>
        <p className="cover-sub">
          An integrative study on Nutrition, Lifestyle, and Supplementation in women with Polycystic Ovary Syndrome. Your responses are strictly confidential and will be used solely for academic research purposes.
        </p>
        <div className="cover-divider" />
        <div className="cover-meta">
          <div className="cover-meta-item"><label>Study Type</label><span>Integrative Thesis Research</span></div>
          <div className="cover-meta-item"><label>Est. Completion Time</label><span>8 – 12 Minutes</span></div>
          <div className="cover-meta-item"><label>Questions</label><span>{TOTAL_Q} Questions · 9 Sections</span></div>
        </div>
      </div>

      <div className="progress-bar-wrap" aria-label="Survey progress">
        <span className="progress-label">Progress</span>
        <div className="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="progress-label">{progress}%</span>
      </div>

      <div className="survey-body">
        <div className="instructions">
          <p>
            <strong>Instructions:</strong> Please read each question carefully and select the answer that best reflects your experience or opinion. There are no right or wrong answers. All responses are anonymous and will only be used for academic research. Questions marked with <strong>*</strong> are required.
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

          <div className="submit-section">
            {submitted ? (
              <>
                <h3>✓ Response Submitted</h3>
                <p>Thank you for completing the survey. Your responses have been recorded and will contribute to important research on PCOS management.</p>
              </>
            ) : (
              <>
                <h3>Thank you for your participation</h3>
                <p>Your responses have been recorded and will contribute to important research on PCOS management.</p>
                <button type="submit" className={`btn-submit${submitted ? " success" : ""}`} disabled={submitting || submitted}>
                  {submitting ? "Submitting…" : "Submit Questionnaire"}
                </button>
              </>
            )}
          </div>
        </form>
      </div>

      {toast && <Toast msg={toast.msg} kind={toast.kind} />}
    </>
  );
}