"use server";

import nodemailer from "nodemailer";

export type SurveyAnswers = Record<string, string | string[]>;

function formatAnswers(answers: SurveyAnswers): string {
  const questionLabels: Record<string, string> = {
    q1:   "Q1  — Age group",
    q1b:  "Q2  — Current weight",
    q2:   "Q3  — Highest level of education",
    q3:   "Q4  — Employment status",
    q4:   "Q5  — How long ago diagnosed with PCOS",
    q5:   "Q6  — PCOS symptoms experienced",
    q6:   "Q7  — Family history of PCOS or hormonal disorders",
    q7:   "Q8  — Lifestyle modification role in PCOS",
    q8:   "Q9  — Ever followed a specific diet plan for PCOS",
    q9:   "Q10 — Low-GI foods and insulin resistance (Likert)",
    q10:  "Q11 — Mediterranean-style diet belief (Likert)",
    q11:  "Q12 — Limiting sugary/processed foods (Likert)",
    q12:  "Q13 — Intermittent fasting familiarity",
    q13:  "Q14 — Importance of micronutrients",
    q14:  "Q15 — Ever taken supplements for PCOS",
    q15:  "Q16 — Who recommended supplements",
    q16:  "Q17 — Noticed improvement from diet/supplements",
    q17:  "Q18 — Heard about inositol supplements",
    q18:  "Q19 — Used inositol supplements",
    q19:  "Q20 — Importance of inositol in PCOS management",
    q20:  "Q21 — Herb that improves insulin sensitivity",
    q21:  "Q22 — Functional foods / antioxidants belief",
    q22:  "Q23 — Seed cycling first phase seeds",
    q23:  "Q24 — Exercise frequency and type",
    q24:  "Q25 — Sleep habits and quality",
    q25:  "Q26 — Stress frequency and management",
    q26:  "Q27 — Current diet type",
    q27:  "Q28 — Supplement safety awareness",
    q28:  "Q29 — Challenges with supplements",
    q29:  "Q30 — Dietary changes + medical treatment (Likert)",
    q31:  "Q31 — Most important PCOS management strategy",
  };

  let rows = "";
  for (const [key, value] of Object.entries(answers)) {
    const label = questionLabels[key] ?? key;
    const display = Array.isArray(value) ? value.join(", ") : value;
    rows += `
      <tr>
        <td style="padding:8px 12px;border:1px solid #e2d6cc;background:#faf7f2;font-size:13px;color:#3d2b2b;font-weight:500;vertical-align:top;width:42%;">
          ${label}
        </td>
        <td style="padding:8px 12px;border:1px solid #e2d6cc;font-size:13px;color:#555;vertical-align:top;">
          ${display || "<em>No answer</em>"}
        </td>
      </tr>`;
  }

  return `
    <div style="font-family:Arial,sans-serif;max-width:800px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <div style="background:#3d2b2b;padding:28px 32px;">
        <h1 style="color:#faf7f2;font-size:22px;margin:0 0 6px;">PCOS Research Survey — New Response</h1>
        <p style="color:rgba(250,247,242,0.65);font-size:13px;margin:0;">
          Submitted on ${new Date().toLocaleString("en-US", { timeZone: "UTC" })} UTC
        </p>
      </div>
      <div style="padding:28px 32px;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              <th style="padding:8px 12px;border:1px solid #e2d6cc;background:#3d2b2b;color:#faf7f2;text-align:left;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Question</th>
              <th style="padding:8px 12px;border:1px solid #e2d6cc;background:#3d2b2b;color:#faf7f2;text-align:left;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Response</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div style="background:#faf7f2;padding:16px 32px;border-top:1px solid #e2d6cc;">
        <p style="color:#7a6262;font-size:12px;margin:0;">This response was submitted via the PCOS Research Survey form.</p>
      </div>
    </div>`;
}

export async function sendSurveyMail(answers: SurveyAnswers) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_EMAIL,
      pass: process.env.MAIL_PASSWORD,
    },
    tls: { rejectUnauthorized: false },
  });

  const htmlContent = formatAnswers(answers);
  const textContent = Object.entries(answers)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
    .join("\n");

  try {
    await transporter.sendMail({
      from: `"PCOS Survey" <${process.env.MAIL_EMAIL}>`,
      to: (process.env.MAIL_TO ?? process.env.MAIL_EMAIL ?? "").split(",").map((e) => e.trim()),
      subject: `New PCOS Survey Response — ${new Date().toLocaleDateString()}`,
      html: htmlContent,
      text: textContent,
    });
    return { status: 200 };
  } catch (error) {
    console.error("Mail error:", error);
    return { status: 500 };
  }
}