// One interface for the three AI providers. The key is passed per request and is never stored.
export const PROVIDER_IDS = ['gemini', 'claude', 'openai'];

const TIMEOUT_MS = 25000;

// Sends a system + user prompt and returns the model's text. Throws a readable Error on failure.
export async function callProvider({ provider, apiKey, system, user }) {
  if (!PROVIDER_IDS.includes(provider)) throw new Error('Unknown AI provider.');
  if (!apiKey) throw new Error('No API key provided.');

  const signal = AbortSignal.timeout(TIMEOUT_MS);
  let res;
  let text;

  if (provider === 'gemini') {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.4 },
      }),
      signal,
    });
    const data = await readJson(res, 'Gemini');
    text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  }

  if (provider === 'claude') {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-5-5',
        max_tokens: 1200,
        system,
        messages: [{ role: 'user', content: user }],
      }),
      signal,
    });
    const data = await readJson(res, 'Claude');
    text = (data?.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
  }

  if (provider === 'openai') {
    res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
      signal,
    });
    const data = await readJson(res, 'OpenAI');
    text = data?.choices?.[0]?.message?.content || '';
  }

  if (!text.trim()) throw new Error('The AI returned an empty answer.');
  return text;
}

async function readJson(res, name) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new Error(`${name} rejected the key. Check it in your profile.`);
    if (res.status === 429) throw new Error(`${name} rate limit reached. Try again shortly.`);
    throw new Error(`${name} returned an error (${res.status}).`);
  }
  return data;
}
