export default async function handler(req, res) {
  // ===== CORS (맨 위에 고정) =====
  res.setHeader('Access-Control-Allow-Origin', '*'); // 필요하면 나중에 Webflow 도메인으로 제한 가능
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { placeId, lang } = req.query;

    // placeId 없으면 에러
    if (!placeId) {
      return res.status(400).json({ error: 'Missing placeId' });
    }

    // 언어 결정 (ko / en)
    const language = lang === 'ko' ? 'ko' : 'en';

    const url =
      'https://maps.googleapis.com/maps/api/place/details/json' +
      `?place_id=${encodeURIComponent(placeId)}` +
      '&fields=rating,user_ratings_total,reviews' +
      `&language=${language}` +
      `&key=${process.env.GOOGLE_MAPS_API_KEY}`;

    const r = await fetch(url);
    const data = await r.json();

    // Google API 에러 처리
    if (!r.ok || (data.status && data.status !== 'OK')) {
      console.error('Google API error:', data);
      return res.status(502).json({
        error: data.status || 'GoogleAPIError',
        details: data.error_message || null,
      });
    }

    const result = data.result || {};
    const reviews = Array.isArray(result.reviews) ? result.reviews : [];

    // 캐시 헤더 (선택 사항)
    res.setHeader(
      'Cache-Control',
      's-maxage=3600, stale-while-revalidate=86400'
    );

    // Webflow에서 쓰는 JSON 형태로 응답
    return res.status(200).json({
      rating: result.rating ?? null,
      count: result.user_ratings_total ?? reviews.length ?? 0,
      reviewsCount: result.user_ratings_total ?? reviews.lengt
