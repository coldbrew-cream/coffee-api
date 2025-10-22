export default async function handler(req, res) {
  try {
    const { placeId } = req.query;
    if (!placeId) return res.status(400).json({ error: "Missing placeId" });

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating,user_ratings_total,reviews&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const r = await fetch(url);
    const data = await r.json();

    if (data.status && data.status !== "OK") {
      return res.status(502).json({ error: data.status, details: data.error_message });
    }

    const result = data.result || {};
    res.status(200).json({
      rating: result.rating ?? null,
      reviewsCount: result.user_ratings_total ?? 0,
      reviews: (result.reviews || []).map(v => ({
        author: v.author_name,
        text: v.text,
        rating: v.rating,
        time: v.time
      }))
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
