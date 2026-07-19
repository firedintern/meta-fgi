module.exports = async (req, res) => {
  try {
    const history = req.query.history === 'true';
    const limit = history ? 30 : 1;
    const apiResponse = await fetch(`https://api.alternative.me/fng/?limit=${limit}`);
    const apiData = await apiResponse.json();

    let result;
    if (history) {
      result = {
        history: apiData.data.map(item => ({
          date: new Date(item.timestamp * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          score: parseInt(item.value, 10)
        })).reverse() // Reverse so oldest date is first for the chart
      };
    } else {
      const item = apiData.data[0];
      const score = parseInt(item.value, 10);
      // Canonical thresholds: ≤24 / 25–44 / 45–59 / 60–79 / ≥80
      let degen_status;
      if (score <= 24) degen_status = 'Extreme fear — historically an accumulation zone';
      else if (score <= 44) degen_status = 'Fear — sentiment below average';
      else if (score <= 59) degen_status = 'Neutral — no directional signal';
      else if (score <= 79) degen_status = 'Greed — sentiment elevated';
      else degen_status = 'Extreme greed — historically a distribution zone';
      result = {
        meta_score: score,
        status: item.value_classification,
        degen_status,
        timestamp: item.timestamp * 1000 // Convert to milliseconds for JS Date
      };
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};