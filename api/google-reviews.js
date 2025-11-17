export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { placeId, lang } = req.query;

    if (!placeId) {
      return res.status(400).json({ error: 'Missing placeId' });
    }

    const language = lang === 'ko' ? 'ko' : 'en';

    const url =
      'https://maps.googleapis.com/maps/api/place/details/json' +
      `?place_id=${encodeURIComponent(placeId)}` +
      '&fields=rating,user_ratings_total,reviews' +
      `&language=${language}` +
      `&key=${process.env.GOOGLE_MAPS_API_KEY}`;

    const r = await fetch(url);
    const data = await r.json();

    if (!r.ok || (data.status && data.status !== 'OK')) {
      console.error('Google API error:', data);
      return res.status(502).json({
        error: data.status || 'GoogleAPIError',
        details: data.error_message || null,
      });
    }

    const result  = data.result || {};
    const reviews = Array.isArray(result.reviews) ? result.reviews : [];

    res.setHeader(
      'Cache-Control',
      's-maxage=3600, stale-while-revalidate=86400'
    );

    return res.status(200).json({
      rating: result.rating ?? null,
      count: result.user_ratings_total ?? reviews.length ?? 0,
      reviewsCount: result.user_ratings_total ?? reviews.length ?? 0,
      reviews: reviews.map((rv) => ({
        author: rv.author_name,
        rating: rv.rating,
        text: rv.text,
        time: rv.time,
      })),
    });
  } catch (err) {
    console.error('ServerError:', err);
    return res.status(500).json({ error: 'ServerError' });
  }
}
