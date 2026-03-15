// Proxy for DeepL API — keeps the API key server-side
export default async (req) => {
  const body = await req.json();

  const res = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${process.env.VITE_DEEPL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
};

export const config = { path: '/api/translate' };
