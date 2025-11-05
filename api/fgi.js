import axios from 'axios';

let cache = { data: null, timestamp: null };
const CACHE_TTL = 600000;

const getStatus = (s) => s < 20 ? 'EXTREME FEAR' : s < 40 ? 'FEAR' : s < 60 ? 'NEUTRAL' : s < 80 ? 'GREED' : 'EXTREME GREED';
const getDegen = (s) => s < 20 ? '🔥 FIRE SALE' : s < 40 ? '💎 Accumulate' : s < 60 ? '🤷 Neutral' : s < 80 ? '🚀 Take profits' : '⚠️ TOP SIGNAL';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        if (cache.data && Date.now() - cache.timestamp < CACHE_TTL) {
            return res.status(200).json({ ...cache.data, cached: true });
        }

        const response = await axios.get('https://api.alternative.me/fng/?limit=1', { timeout: 8000 });
        const score = parseInt(response.data.data[0].value);
        
        const result = {
            meta_score: score,
            status: getStatus(score),
            degen_status: getDegen(score),
            timestamp: new Date().toISOString()
        };

        cache = { data: result, timestamp: Date.now() };
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
