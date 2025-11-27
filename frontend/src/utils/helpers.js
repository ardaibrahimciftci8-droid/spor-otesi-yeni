// AI Helper function
export async function askGemini(prompt) {
  try {
    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'Sen yardımcı bir spor asistanısın. Türkçe cevap ver.' },
          { role: 'user', content: prompt }
        ],
        model: 'openai',
        seed: 42
      }),
    });
    if (!response.ok) throw new Error("AI Servis Hatası");
    return await response.text();
  } catch (error) {
    console.error("AI Hatası:", error);
    return "⚠️ Bağlantı hatası. Lütfen tekrar deneyin.";
  }
}
