async function callGeminiEngine(apiKey, systemPrompt, userMessage) {
  const domain = ["generativelanguage", "googleapis", "com"].join(".");
  const endpoint = "https://" + domain + "/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: userMessage }] }]
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates.at(0).content.parts.at(0).text;
}

async function runKoreanBrain(apiKey, mode, query, onStatus) {
  if (mode === "APP") {
    onStatus("⚡ BUILDING LIVE APP...");
    let rawCode = await callGeminiEngine(apiKey, "You are an elite Instant App Generator. Return ONLY complete, working single-file HTML/CSS/JS code starting with <!DOCTYPE html> and nothing else. No markdown.", query);
    return { type: "app", code: rawCode.replace(/```html|```/g, "").trim() };
  }
  onStatus("🧠 BRAIN 1: PLANNING...");
  const plan = await callGeminiEngine(apiKey, `Mode: ${mode}. You are Master Planner. Create a sharp, practical strategy.`, query);
  onStatus("🔍 BRAIN 2: CHECKING FLAWS...");
  const critique = await callGeminiEngine(apiKey, `Mode: ${mode}. You are Critic & Security Guard. Find flaws or risks and improve the draft.`, `Query: ${query}\nDraft: ${plan}`);
  onStatus("⚡ BRAIN 3: FINALIZING...");
  const finalReply = await callGeminiEngine(apiKey, `Mode: ${mode}. You are KOREAN Master Advisor. Combine everything into the sharpest, action-ready reply in Hindi/Hinglish.`, `Query: ${query}\nPlan: ${plan}\nCritique: ${critique}`);
  return { type: "text", text: finalReply };
}
