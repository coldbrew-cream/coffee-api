export default function handler(req, res) {
  // CORS (최소 설정)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 그냥 테스트용 응답만 보내기
  res.status(200).json({
    ok: true,
    query: req.query,
  });
}
