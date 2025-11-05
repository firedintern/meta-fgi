import axios from 'axios';

let cache = { data: null, timestamp: null };
const CACHE_TTL = 600000;

const getStatus = (s) => {
    if (s < 20) return 'BLOOD IN THE STREETS';
    if (s < 40) return 'PAPER HANDS EVERYWHERE';
    if (s < 60) return 'CRAB MARKET';
    if (s < 80) return 'FOMO KICKING IN';
    return 'EUPHORIA - TOP IS IN';
};

const getDegen = (s) => {
    if (s < 20) return '🔥 FIRE SALE';
    if (s < 40) return '💎 Accumulate';
    if (s < 60) return '🦀 Touch Grass';
    if (s < 80) return '🚀 Take Profits';
    return '⚠️ GET OUT';
};

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
