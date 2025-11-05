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
      let degen_status;
      if (score < 20) degen_status = 'BLOOD IN THE STREETS!';
      else if (score < 40) degen_status = 'PAPER HANDS EVERYWHERE';
      else if (score < 60) degen_status = 'CRAB MARKET';
      else if (score < 80) degen_status = 'FOMO KICKING IN';
      else degen_status = 'EUPHORIA - TOP IS IN';
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