import { db } from "hatchable";

export const access = "public";
export const methods = ["POST"];

function textValue(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export default async function (req, res) {
  const body = req.body || {};
  const name = textValue(body.name);
  const email = textValue(body.email).toLowerCase();
  const phone = textValue(body.phone);
  const category = textValue(body.category);
  const details = textValue(body.details);
  const budget = textValue(body.budget);
  const timeline = textValue(body.timeline);

  if (!name || name.length > 100) return res.status(400).json({ error: "Please enter a name of up to 100 characters." });
  if (!email || email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Please enter a valid email address." });
  if (phone.length > 40) return res.status(400).json({ error: "Phone number must be 40 characters or fewer." });
  if (!category || category.length > 120) return res.status(400).json({ error: "Please choose a project category." });
  if (details.length < 15 || details.length > 5000) return res.status(400).json({ error: "Please describe your project in 15 to 5,000 characters." });
  if (budget.length > 80 || timeline.length > 80) return res.status(400).json({ error: "Please check your budget and timeline selections." });

  const result = await db.query(
    "INSERT INTO project_requests (name, email, phone, category, details, budget, timeline) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, created_at",
    [name, email, phone || null, category, details, budget || null, timeline || null]
  );

  return res.status(201).json({ ok: true, request_id: result.rows[0].id, received_at: result.rows[0].created_at });
}