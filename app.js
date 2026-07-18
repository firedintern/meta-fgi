        let currentScore=0,particlesEnabled=true,notificationsEnabled=false,lastNotificationScore=null,isSpinning=false;
        let audioContext;
        
        function initAudio(){
            if(!audioContext){
                audioContext=new(window.AudioContext||window.webkitAudioContext)();
            }
        }
        
        function playJackpotSound(){
            initAudio();
            const now=audioContext.currentTime;
            const notes=[523.25,659.25,783.99,1046.50];
            notes.forEach((freq,i)=>{
                const osc=audioContext.createOscillator();
                const gain=audioContext.createGain();
                osc.type='sine';
                osc.frequency.setValueAtTime(freq,now+(i*0.15));
                gain.gain.setValueAtTime(0,now+(i*0.15));
                gain.gain.linearRampToValueAtTime(0.3,now+(i*0.15)+0.01);
                gain.gain.exponentialRampToValueAtTime(0.01,now+(i*0.15)+0.4);
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.start(now+(i*0.15));
                osc.stop(now+(i*0.15)+0.5);
            });
            setTimeout(()=>{
                [523.25,659.25,783.99].forEach(freq=>{
                    const osc=audioContext.createOscillator();
                    const gain=audioContext.createGain();
                    const time=audioContext.currentTime;
                    osc.type='sine';
                    osc.frequency.setValueAtTime(freq,time);
                    gain.gain.setValueAtTime(0.2,time);
                    gain.gain.exponentialRampToValueAtTime(0.01,time+0.8);
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    osc.start(time);
                    osc.stop(time+0.8);
                });
            },600);
        }
        
        const matrixCanvas=document.getElementById('matrix-canvas');
        const matrixPattern=document.querySelector('.matrix-pattern');
        const delays=['-2.5s','-3.2s','-1.8s','-2.9s','-1.5s','-3.8s','-2.1s','-2.7s','-3.4s','-1.9s','-3.6s','-2.3s','-3.1s','-2.6s','-3.7s','-2.8s','-3.3s','-2.2s','-3.9s','-2.4s'];
        const durations=['3s','4s','2.5s','3.5s','3s','4.5s','2.8s','3.2s','3.8s','2.7s','4.2s','3.1s','3.6s','2.9s','4.1s','3.3s','3.7s','2.6s','4.3s','3.4s'];

        // Generate matrix columns to fill entire width
        function generateMatrixColumns(){
            matrixPattern.innerHTML='';
            const columnSpacing=25;
            const cols=Math.ceil(window.innerWidth/columnSpacing)+2;
            for(let i=0;i<cols;i++){
                const column=document.createElement('div');
                column.className='matrix-column';
                column.style.left=i*columnSpacing+'px';
                column.style.animationDelay=delays[i%delays.length];
                column.style.animationDuration=durations[i%durations.length];
                matrixPattern.appendChild(column);
            }
        }

        generateMatrixColumns();

        // Matrix is OFF by default — toggled by the ✨ button
        let matrixEnabled = false;

        // Wire up matrix toggle button
        const matrixToggleBtn = document.getElementById('matrixToggleBtn');
        if (matrixToggleBtn) {
            matrixToggleBtn.addEventListener('click', function() {
                matrixEnabled = !matrixEnabled;
                matrixCanvas.classList.toggle('visible', matrixEnabled);
                matrixToggleBtn.classList.toggle('active', matrixEnabled);
            });
        }

        window.addEventListener('resize',()=>{
            generateMatrixColumns();
        });
        
        function getColorForScore(s){
            if(s<20)return '#c0392b';   // Extreme Fear — red
            if(s<40)return '#e67e22';   // Fear — amber
            if(s<60)return '#D0DB97';   // Neutral — gold
            if(s<80)return '#27ae60';   // Greed — green
            return '#f7931a';           // Extreme Greed — orange
        }
        
        function getSymbolForScore(s){
            if(s<=25)return '💀';  // Extreme Fear: 0-25 (matches API classification)
            if(s<=45)return '😱';  // Fear: 26-45
            if(s<=54)return '😐';  // Neutral: 46-54
            if(s<=74)return '😏';  // Greed: 55-74
            return '🤑';           // Extreme Greed: 75-100
        }

        function getQuoteForScore(s){
            if(s<=25){  // Extreme Fear: 0-25
                return {
                    icon: '💎',
                    text: 'Be greedy when others are fearful. Blood in the streets means diamonds in the wallet.'
                };
            }
            if(s<=45){  // Fear: 26-45
                return {
                    icon: '🤔',
                    text: 'The best buys happen when everyone\'s too scared to click. Your future self will thank you.'
                };
            }
            if(s<=54){  // Neutral: 46-54
                return {
                    icon: '😐',
                    text: 'Boring markets build wealth. Patience pays more than FOMO ever will.'
                };
            }
            if(s<=74){  // Greed: 55-74
                return {
                    icon: '🚨',
                    text: 'When your barber\'s giving crypto tips, it\'s time to secure the bag. Bulls make money, bears make money, pigs get slaughtered.'
                };
            }
            return {  // Extreme Greed: 75-100
                icon: '⚠️',
                text: 'Euphoria is expensive. Everyone\'s a genius in a bull market until the music stops. Cash out before the rug pull.'
            };
        }

        function updateSentimentQuote(score, color){
            const quote = getQuoteForScore(score);
            document.getElementById('quoteIcon').textContent = quote.icon;
            document.getElementById('quoteText').textContent = quote.text;
            document.getElementById('sentimentQuote').style.borderColor = color;
            document.getElementById('sentimentQuote').style.color = color;
        }

        function triggerWinEffect(color){
            // Flash effect disabled per user request
            // Users should see the result without the distracting flash animation
            return;
        }

        function spinSlots(){
            if(isSpinning){
                console.log('Already spinning, ignoring click');
                return;
            }
            isSpinning=true;
            console.log('Spin started, isSpinning =', isSpinning);

            playJackpotSound();
            refreshAll();
        }

        function updateSlotMachine(score){
            const symbol=getSymbolForScore(score);
            const color=getColorForScore(score);

            // Map symbol to index position (0-4)
            const symbolMap = {'💀':0, '😱':1, '😐':2, '😏':3, '🤑':4};
            const targetIndex = symbolMap[symbol] || 0;
            const firstSymbol = document.querySelector('.symbol');
            const symbolHeight = firstSymbol ? firstSymbol.offsetHeight : 120;
            const targetPosition = -targetIndex * symbolHeight;

            const reels = document.querySelectorAll('.reel');
            const machine = document.getElementById('slotMachine');

            // First, reset all reels to show clovers at position 0
            reels.forEach(reel => {
                const strip = reel.querySelector('.reel-strip');
                strip.style.transform = 'translateY(0) translateZ(0)';
            });

            // Reset symbols to clovers before spinning
            document.querySelectorAll('.symbol[data-actual]').forEach(symbolEl => {
                symbolEl.textContent = '🍀';
            });

            // Small delay to ensure visual reset, then replace with actual emojis
            setTimeout(() => {
                document.querySelectorAll('.symbol[data-actual]').forEach(symbolEl => {
                    symbolEl.textContent = symbolEl.getAttribute('data-actual');
                });
            }, 50);

            // Add spinning class for CSS animation
            machine.classList.add('spinning');
            reels.forEach(reel => reel.classList.add('spinning'));

            // Stop reels with stagger
            reels.forEach((reel, index) => {
                setTimeout(() => {
                    // Remove spinning animation
                    reel.classList.remove('spinning');

                    // Position reel to show target symbol
                    const strip = reel.querySelector('.reel-strip');
                    strip.style.transform = `translateY(${targetPosition}px) translateZ(0)`;

                    // Last reel complete
                    if (index === 2) {
                        machine.classList.remove('spinning');

                        setTimeout(() => {
                            document.getElementById('slotScore').textContent = score;
                            document.getElementById('slotScore').style.color = color;
                            const extreme = score <= 20 || score >= 80;
                            if (extreme) {
                                document.getElementById('slotScore').classList.add('jackpot');
                                triggerWinEffect(color);
                            } else {
                                document.getElementById('slotScore').classList.remove('jackpot');
                            }

                            // Trigger raining emoji effect
                            triggerEmojiRain(symbol);

                            // Reset AFTER everything completes
                            isSpinning = false;
                            console.log('Spin complete, isSpinning =', isSpinning);
                        }, 200);
                    }
                }, 660 + (index * 330));
            });
        }

        // Raining emoji jackpot effect - OPTIMIZED
        function triggerEmojiRain(emoji) {
            const container = document.getElementById('slotMachine');
            const numEmojis = 20;
            const fragment = document.createDocumentFragment();
            const emojis = [];

            // Create all elements in memory first (no DOM reflows)
            for (let i = 0; i < numEmojis; i++) {
                const emojiEl = document.createElement('div');
                emojiEl.textContent = emoji;
                emojiEl.className = 'emoji-rain';
                emojiEl.style.left = Math.random() * 100 + '%';
                emojiEl.style.animationDelay = (i * 0.1) + 's';
                emojis.push(emojiEl);
                fragment.appendChild(emojiEl);
            }

            // Single DOM append (only 1 reflow instead of 20)
            requestAnimationFrame(() => {
                container.appendChild(fragment);

                // Single cleanup timer instead of 20
                setTimeout(() => {
                    emojis.forEach(el => el.remove());
                }, 2100);
            });
        }

        // Telegram alerts - handled via external link to t.me/fgichadbot

        // Simple cache to reduce API calls and avoid rate limiting
        const apiCache = {
            btcPrice: { data: null, timestamp: 0 },
            globalData: { data: null, timestamp: 0 } // Cache for dominance + market cap (same API)
        };
        const CACHE_DURATION = 60000; // 60 seconds

        function isCacheValid(cacheKey) {
            const cache = apiCache[cacheKey];
            return cache.data && (Date.now() - cache.timestamp) < CACHE_DURATION;
        }

        // Fetch global data (dominance + market cap) once and cache it
        async function fetchGlobalData() {
            if (isCacheValid('globalData')) {
                return apiCache.globalData.data;
            }

            try {
                const response = await fetch('https://api.coingecko.com/api/v3/global', {
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();

                // Cache the result
                apiCache.globalData = { data: data.data, timestamp: Date.now() };
                return data.data;
            } catch (error) {
                console.error('Error fetching global data:', error);
                return null;
            }
        }

        async function fetchBTCPrice(){
            // Check cache first
            if (isCacheValid('btcPrice')) {
                const cached = apiCache.btcPrice.data;
                const priceText = '$'+cached.price.toLocaleString('en-US',{maximumFractionDigits:0});
                const changeText = (cached.change>0?'+':'')+cached.change.toFixed(2)+'% (24h)';

                // Update desktop
                document.getElementById('btcPrice').textContent = priceText;
                const e=document.getElementById('btcChange');
                e.textContent = changeText;
                e.className='btc-change';  // Keep gray, no color change

                // Update mobile
                document.getElementById('btcPriceMobile').textContent = priceText;
                const eMobile=document.getElementById('btcChangeMobile');
                eMobile.textContent = changeText;
                eMobile.className='btc-change';  // Keep gray, no color change
                return;
            }

            try{
                const r=await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true', {
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                const d=await r.json();
                if (!d.bitcoin) throw new Error('Invalid data');
                const p=d.bitcoin.usd,c=d.bitcoin.usd_24h_change;

                // Cache the result
                apiCache.btcPrice = { data: { price: p, change: c }, timestamp: Date.now() };

                const priceText = '$'+p.toLocaleString('en-US',{maximumFractionDigits:0});
                const changeText = (c>0?'+':'')+c.toFixed(2)+'% (24h)';

                // Update desktop
                document.getElementById('btcPrice').textContent = priceText;
                const e=document.getElementById('btcChange');
                e.textContent = changeText;
                e.className='btc-change';  // Keep gray, no color change

                // Update mobile
                document.getElementById('btcPriceMobile').textContent = priceText;
                const eMobile=document.getElementById('btcChangeMobile');
                eMobile.textContent = changeText;
                eMobile.className='btc-change';  // Keep gray, no color change
            }catch(e){
                console.error('BTC price error:',e);
                // Retry with alternative API
                try {
                    const r2 = await fetch('https://api.coincap.io/v2/assets/bitcoin');
                    const d2 = await r2.json();
                    const p = parseFloat(d2.data.priceUsd);
                    const c = parseFloat(d2.data.changePercent24Hr);

                    // Cache the fallback result
                    apiCache.btcPrice = { data: { price: p, change: c }, timestamp: Date.now() };

                    const priceText = '$'+p.toLocaleString('en-US',{maximumFractionDigits:0});
                    const changeText = (c>0?'+':'')+c.toFixed(2)+'% (24h)';

                    // Update desktop
                    document.getElementById('btcPrice').textContent = priceText;
                    const e2=document.getElementById('btcChange');
                    e2.textContent = changeText;
                    e2.className='btc-change';  // Keep gray, no color change

                    // Update mobile
                    document.getElementById('btcPriceMobile').textContent = priceText;
                    const e2Mobile=document.getElementById('btcChangeMobile');
                    e2Mobile.textContent = changeText;
                    e2Mobile.className='btc-change';  // Keep gray, no color change
                } catch(e2) {
                    console.error('Fallback BTC price error:',e2);
                    document.getElementById('btcPrice').textContent='Price unavailable';
                    document.getElementById('btcChange').textContent='';
                    document.getElementById('btcPriceMobile').textContent='Price unavailable';
                    document.getElementById('btcChangeMobile').textContent='';
                }
            }
        }

        async function fetchBTCDominance() {
            const globalData = await fetchGlobalData();
            if (globalData && globalData.market_cap_percentage && globalData.market_cap_percentage.btc) {
                const dominance = globalData.market_cap_percentage.btc;
                const dominanceText = dominance.toFixed(2) + '%';
                document.getElementById('btcDominance').textContent = dominanceText;
                document.getElementById('btcDominanceMobile').textContent = dominanceText;
            } else {
                document.getElementById('btcDominance').textContent = 'N/A';
                document.getElementById('btcDominanceMobile').textContent = 'N/A';
            }
        }

        async function fetchBTCMarketCap() {
            const globalData = await fetchGlobalData();
            if (globalData && globalData.total_market_cap && globalData.total_market_cap.usd && globalData.market_cap_percentage && globalData.market_cap_percentage.btc) {
                const totalMarketCap = globalData.total_market_cap.usd;
                const btcDominance = globalData.market_cap_percentage.btc;

                // Calculate BTC market cap: Total Market Cap × (BTC Dominance / 100)
                const btcMarketCap = totalMarketCap * (btcDominance / 100);

                // Format market cap
                let formatted;
                if (btcMarketCap >= 1e12) {
                    formatted = '$' + (btcMarketCap / 1e12).toFixed(2) + 'T';
                } else if (btcMarketCap >= 1e9) {
                    formatted = '$' + (btcMarketCap / 1e9).toFixed(2) + 'B';
                } else {
                    formatted = '$' + (btcMarketCap / 1e6).toFixed(2) + 'M';
                }

                document.getElementById('btcMarketCap').textContent = formatted;
                document.getElementById('btcMarketCapMobile').textContent = formatted;
                console.log('BTC Market Cap updated:', formatted);
            } else {
                console.error('Invalid market cap data');
                document.getElementById('btcMarketCap').textContent = 'N/A';
                document.getElementById('btcMarketCapMobile').textContent = 'N/A';
            }
        }

        async function fetchHistoricalData(){
            try{
                // Fetch FGI data
                const fgiResponse=await fetch('https://api.alternative.me/fng/?limit=30&format=json');
                if (!fgiResponse.ok) throw new Error(`HTTP ${fgiResponse.status}`);
                const fgiData=await fgiResponse.json();

                // Fetch BTC price data
                const btcResponse=await fetch('https://min-api.cryptocompare.com/data/v2/histoday?fsym=BTC&tsym=USD&limit=30');
                if (!btcResponse.ok) throw new Error(`HTTP ${btcResponse.status}`);
                const btcData=await btcResponse.json();

                if(fgiData.data&&Array.isArray(fgiData.data)&&fgiData.data.length>0&&btcData.Data&&btcData.Data.Data){
                    const fgiHistory=fgiData.data.reverse();
                    const btcHistory=btcData.Data.Data;

                    // Merge FGI and BTC data by matching timestamps
                    const history=fgiHistory.map(item=>{
                        const btcItem=btcHistory.find(b=>b.time===parseInt(item.timestamp));
                        return {
                            date:new Date(item.timestamp*1000).toLocaleDateString('en-US',{month:'short',day:'numeric'}),
                            score:parseInt(item.value),
                            timestamp:item.timestamp,
                            btcPrice:btcItem?btcItem.close:null
                        };
                    });
                    renderChart(history);
                    renderDistributionChart(history);
                }else{
                    throw new Error('No historical data available');
                }
            }catch(e){
                console.error('History error:',e);
                document.getElementById('chartTitle').innerHTML='30-Day Sentiment History - <span style="color:#ff6666">Connection Error</span>';
            }
        }

        function renderDistributionChart(history){
            const el=document.getElementById('distributionChart');
            if(!el||typeof Chart==='undefined')return;

            // Calculate distribution
            const distribution={
                extremeFear:0,  // 0-24
                fear:0,         // 25-44
                neutral:0,      // 45-55
                greed:0,        // 56-75
                extremeGreed:0  // 76-100
            };

            history.forEach(item=>{
                const score=item.score;
                if(score<=24) distribution.extremeFear++;
                else if(score<=44) distribution.fear++;
                else if(score<=55) distribution.neutral++;
                else if(score<=75) distribution.greed++;
                else distribution.extremeGreed++;
            });

            const total=history.length;
            const data=[
                distribution.extremeFear,
                distribution.fear,
                distribution.neutral,
                distribution.greed,
                distribution.extremeGreed
            ];

            const percentages=data.map(val=>((val/total)*100).toFixed(1));

            if(window.distributionChartInstance){
                window.distributionChartInstance.destroy();
            }

            const ctx=el.getContext('2d');
            window.distributionChartInstance=new Chart(ctx,{
                type:'doughnut',
                data:{
                    labels:[
                        `Extreme Fear 💀 (${percentages[0]}%)`,
                        `Fear 😱 (${percentages[1]}%)`,
                        `Neutral 😐 (${percentages[2]}%)`,
                        `Greed 😏 (${percentages[3]}%)`,
                        `Extreme Greed 🤑 (${percentages[4]}%)`
                    ],
                    datasets:[{
                        data:data,
                        backgroundColor:[
                            '#c0392b',  // Extreme Fear - deep crimson
                            '#e67e22',  // Fear - muted amber
                            '#69B578',  // Neutral - soft green
                            '#27ae60',  // Greed - calm green
                            '#1a7a40'   // Extreme Greed - deep green
                        ],
                        borderColor:'#181D27',
                        borderWidth:2
                    }]
                },
                options:{
                    responsive:true,
                    maintainAspectRatio:true,
                    plugins:{
                        legend:{
                            position:'bottom',
                            labels:{
                                color:'#e6e8eb',
                                font:{
                                    size:12,
                                    family:'Inter'
                                },
                                padding:15,
                                usePointStyle:true,
                                pointStyle:'circle'
                            }
                        },
                        tooltip:{
                            backgroundColor:'rgba(10, 14, 20, 0.95)',
                            titleColor:'#69B578',
                            bodyColor:'#e6e8eb',
                            borderColor:'#3A7D44',
                            borderWidth:1,
                            padding:12,
                            displayColors:true,
                            callbacks:{
                                label:function(context){
                                    const days=context.parsed;
                                    const percentage=percentages[context.dataIndex];
                                    return ` ${days} days (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        function renderChart(h){
            const el=document.getElementById('historyChart');
            if(!el||typeof Chart==='undefined')return;
            const c=el.getContext('2d');
            if(window.chartInstance)window.chartInstance.destroy();
            const isMobile=window.innerWidth<=768;
            try{
                window.chartInstance=new Chart(c,{
                    type:'line',
                    data:{
                        labels:h.map(d=>d.date),
                        datasets:[
                            {
                                label:'Fear & Greed',
                                data:h.map(d=>d.score),
                                borderColor:'#00ff00',
                                backgroundColor:'rgba(0,255,0,0.1)',
                                borderWidth:3,
                                tension:0.4,
                                fill:true,
                                pointBackgroundColor:h.map(d=>getColorForScore(d.score)),
                                pointBorderColor:'#fff',
                                pointBorderWidth:2,
                                pointRadius:isMobile?3:5,
                                pointHoverRadius:isMobile?5:7,
                                yAxisID:'y'
                            },
                            {
                                label:'BTC Price',
                                data:h.map(d=>d.btcPrice),
                                borderColor:'#D0DB97',
                                backgroundColor:'rgba(255,215,0,0.1)',
                                borderWidth:2,
                                tension:0.4,
                                fill:false,
                                pointBackgroundColor:'#D0DB97',
                                pointBorderColor:'#fff',
                                pointBorderWidth:2,
                                pointRadius:isMobile?2:4,
                                pointHoverRadius:isMobile?4:6,
                                yAxisID:'y1'
                            }
                        ]
                    },
                    options:{
                        responsive:true,
                        maintainAspectRatio:true,
                        interaction:{
                            mode:'index',
                            intersect:false
                        },
                        plugins:{
                            legend:{labels:{color:'#00ff00',font:{family:'Courier New',size:isMobile?12:14}}},
                            tooltip:{
                                backgroundColor:'rgba(0,0,0,0.9)',
                                titleColor:'#00ff00',
                                bodyColor:'#fff',
                                borderColor:'#00ff00',
                                borderWidth:2,
                                padding:12,
                                displayColors:true,
                                titleFont:{family:'Courier New',size:14,weight:'bold'},
                                bodyFont:{family:'Courier New',size:13},
                                callbacks:{
                                    title:function(context){
                                        return context[0].label;
                                    },
                                    label:function(context){
                                        if(context.dataset.label==='Fear & Greed'){
                                            const score=context.parsed.y;
                                            const sentiment=getSentimentCategory(score);
                                            const emoji=getSymbolForScore(score);
                                            return emoji+' '+sentiment+': '+score+'/100';
                                        }else{
                                            return 'BTC: $'+context.parsed.y.toLocaleString('en-US',{maximumFractionDigits:0});
                                        }
                                    }
                                }
                            }
                        },
                        scales:{
                            y:{
                                type:'linear',
                                position:'left',
                                beginAtZero:true,
                                max:100,
                                grid:{color:'rgba(0,255,0,0.2)'},
                                ticks:{color:'#00ff00',font:{family:'Courier New',size:isMobile?9:11}},
                                title:{display:true,text:'FGI Score',color:'#00ff00',font:{family:'Courier New',size:isMobile?10:12}}
                            },
                            y1:{
                                type:'linear',
                                position:'right',
                                grid:{display:false},
                                ticks:{color:'#D0DB97',font:{family:'Courier New',size:isMobile?9:11},callback:function(value){return '$'+value.toLocaleString('en-US',{maximumFractionDigits:0});}},
                                title:{display:true,text:'BTC Price',color:'#D0DB97',font:{family:'Courier New',size:isMobile?10:12}}
                            },
                            x:{grid:{color:'rgba(0,255,0,0.1)'},ticks:{color:'#00ff00',font:{family:'Courier New',size:isMobile?8:11},maxRotation:45,minRotation:45,autoSkip:true,maxTicksLimit:isMobile?8:15}}
                        }
                    }
                });
            }catch(e){console.error('Chart error:',e);}
        }
        
        // Sentiment Streak Functions
        function getSentimentCategory(score) {
            if (score <= 25) return 'Extreme Fear';  // 0-25 (matches API)
            if (score <= 45) return 'Fear';          // 26-45
            if (score <= 54) return 'Neutral';       // 46-54
            if (score <= 74) return 'Greed';         // 55-74
            return 'Extreme Greed';                  // 75-100
        }

        async function fetchHistoricalStreakData() {
            try {
                const r = await fetch('https://api.alternative.me/fng/?limit=365&format=json');
                const d = await r.json();
                if (!d.data || !Array.isArray(d.data)) {
                    throw new Error('Invalid historical data');
                }
                return d.data; // Newest first (index 0 = today)
            } catch (e) {
                console.error('Historical streak data fetch error:', e);
                return null;
            }
        }

        function calculateCurrentStreak(historicalData, currentCategory) {
            let streak = 0;
            for (let i = 0; i < historicalData.length; i++) {
                const score = parseInt(historicalData[i].value);
                const category = getSentimentCategory(score);
                if (category === currentCategory) {
                    streak++;
                } else {
                    break; // Stop when category changes
                }
            }
            return streak;
        }

        function calculateHistoricalStats(historicalData) {
            const categories = ['Extreme Fear', 'Fear', 'Neutral', 'Greed', 'Extreme Greed'];
            const stats = {};

            categories.forEach(cat => {
                stats[cat] = { longestStreak: 0, totalDays: 0, streakCount: 0, recordDate: null };
            });

            // Track current streak as we iterate
            let currentCat = null;
            let currentStreakLen = 0;
            let streakStartIndex = 0;

            for (let i = historicalData.length - 1; i >= 0; i--) { // Go oldest to newest
                const score = parseInt(historicalData[i].value);
                const category = getSentimentCategory(score);

                if (category === currentCat) {
                    currentStreakLen++;
                } else {
                    // Save previous streak
                    if (currentCat && currentStreakLen > 0) {
                        if (currentStreakLen > stats[currentCat].longestStreak) {
                            stats[currentCat].longestStreak = currentStreakLen;
                            // Record the date when this streak ended (most recent day of the streak)
                            stats[currentCat].recordDate = historicalData[streakStartIndex].timestamp;
                        }
                        stats[currentCat].totalDays += currentStreakLen;
                        stats[currentCat].streakCount++;
                    }
                    // Start new streak
                    currentCat = category;
                    currentStreakLen = 1;
                    streakStartIndex = i;
                }
            }

            // Don't include the LAST streak because it's the CURRENT ONGOING streak
            // We only want COMPLETED historical streaks for comparison
            // (The last streak ends at index 0 which is today - still active!)

            // Calculate averages
            categories.forEach(cat => {
                if (stats[cat].streakCount > 0) {
                    stats[cat].average = Math.round((stats[cat].totalDays / stats[cat].streakCount) * 10) / 10;
                } else {
                    stats[cat].average = 0;
                }
            });

            return stats;
        }

        // Helper function to format timestamp to "Month Year"
        function formatRecordDate(timestamp) {
            if (!timestamp) return '';
            const date = new Date(parseInt(timestamp) * 1000);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${months[date.getMonth()]} ${date.getFullYear()}`;
        }

        async function updateStreakDisplay(currentScore) {
            try {
                const historicalData = await fetchHistoricalStreakData();
                if (!historicalData || historicalData.length === 0) {
                    document.getElementById('streakInfo').textContent = '';
                    return;
                }

                const currentCategory = getSentimentCategory(currentScore);
                const currentStreak = calculateCurrentStreak(historicalData, currentCategory);
                const stats = calculateHistoricalStats(historicalData);

                const catStats = stats[currentCategory];
                const record = catStats.longestStreak;
                const average = catStats.average;
                const recordDate = catStats.recordDate;

                const streakInfoEl = document.getElementById('streakInfo');

                // Update the streak inline display (inside slot machine AND mobile box) for ALL sentiments
                const streakLabelInlineEl = document.getElementById('streakLabelInline');
                const streakValueInlineEl = document.getElementById('streakValueInline');
                const streakDescInlineEl = document.getElementById('streakDescInline');
                const streakLabelInlineMobileEl = document.getElementById('streakLabelInlineMobile');
                const streakValueInlineMobileEl = document.getElementById('streakValueInlineMobile');
                const streakDescInlineMobileEl = document.getElementById('streakDescInlineMobile');

                const streakColor = getColorForScore(currentScore);

                // Generate label based on current sentiment
                const streakLabel = `${currentCategory.toUpperCase()} STREAK`;

                // Generate description text
                let descText;
                const categoryLower = currentCategory.toLowerCase();
                if (currentStreak === 0) {
                    descText = `No active ${categoryLower} streak`;
                } else if (currentStreak === 1) {
                    descText = `Day 1 of ${categoryLower}`;
                } else {
                    descText = `${currentStreak} consecutive days of ${categoryLower}`;
                }

                // Update desktop
                if (streakLabelInlineEl) {
                    streakLabelInlineEl.textContent = streakLabel;
                }
                if (streakValueInlineEl) {
                    streakValueInlineEl.textContent = currentStreak;
                    streakValueInlineEl.style.color = streakColor;
                }
                if (streakDescInlineEl) {
                    streakDescInlineEl.textContent = descText;
                }

                // Update mobile
                if (streakLabelInlineMobileEl) {
                    streakLabelInlineMobileEl.textContent = streakLabel;
                }
                if (streakValueInlineMobileEl) {
                    streakValueInlineMobileEl.textContent = currentStreak;
                    streakValueInlineMobileEl.style.color = streakColor;
                }
                if (streakDescInlineMobileEl) {
                    streakDescInlineMobileEl.textContent = descText;
                }

                // Format record date string
                const recordDateStr = recordDate ? ` in ${formatRecordDate(recordDate)}` : '';

                // Check if it's a new record
                if (currentStreak > record) {
                    // BREAKING RECORD - current streak is longer than previous record
                    streakInfoEl.innerHTML = `Day ${currentStreak} of ${currentCategory} 🔥 RECORD BROKEN!${record > 0 ? ` (Previous: ${record} days${recordDateStr})` : ''}`;
                    streakInfoEl.classList.add('record');
                } else if (currentStreak === 1) {
                    // Just started
                    streakInfoEl.innerHTML = `Day 1 of ${currentCategory} (Just started!)`;
                    streakInfoEl.classList.remove('record');
                } else if (currentStreak < record && currentStreak >= record - 1 && record > 0) {
                    // Near record (within 1 day of breaking it, but NOT equal or greater)
                    streakInfoEl.innerHTML = `Day ${currentStreak} of ${currentCategory} (Near record! Longest: ${record} days${recordDateStr})`;
                    streakInfoEl.classList.remove('record');
                } else if (average > 0 && currentStreak > average * 1.3) {
                    // Above average
                    streakInfoEl.innerHTML = `Day ${currentStreak} of ${currentCategory} (Above avg! Typical: ${average} days | Record: ${record} days${recordDateStr})`;
                    streakInfoEl.classList.remove('record');
                } else {
                    // Normal
                    streakInfoEl.innerHTML = `Day ${currentStreak} of ${currentCategory} (Avg: ${average} days | Record: ${record} days${recordDateStr})`;
                    streakInfoEl.classList.remove('record');
                }
            } catch (e) {
                console.error('Streak display error:', e);
                document.getElementById('streakInfo').textContent = '';
            }
        }

        async function fetchData(){
            try{
                const r=await fetch('https://api.alternative.me/fng/?limit=1&format=json');
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                const d=await r.json();
                if(!d.data||!d.data[0]){throw new Error('Invalid API response');}
                const fgiData=d.data[0];
                currentScore=parseInt(fgiData.value);
                const statusMap={'Extreme Fear':'EXTREME FEAR','Fear':'FEAR','Neutral':'NEUTRAL','Greed':'GREED','Extreme Greed':'EXTREME GREED'};
                const status=statusMap[fgiData.value_classification]||fgiData.value_classification.toUpperCase();
                const degenMap={'Extreme Fear':'💎 Accumulate','Fear':'🤔 Good Entry','Neutral':'😐 Wait & See','Greed':'🚨 Take Profits','Extreme Greed':'⚠️ Exit Now'};
                const degenStatus=degenMap[fgiData.value_classification]||'...';
                const color=getColorForScore(currentScore);
                updateSlotMachine(currentScore);
                document.getElementById('slotStatus').textContent=status;
                document.getElementById('slotStatus').style.color=color;
                document.getElementById('degenStatus').textContent=degenStatus;
                document.getElementById('degenStatus').style.color=color;
                document.getElementById('timestamp').textContent='> Last Updated: '+new Date(fgiData.timestamp*1000).toLocaleTimeString();
                updateSentimentQuote(currentScore, color);

                // Update streak display
                await updateStreakDisplay(currentScore);

                const extreme=currentScore<=20||currentScore>=80;
                if(extreme&&notificationsEnabled&&(lastNotificationScore===null||Math.abs(lastNotificationScore-currentScore)>10)){
                    new Notification(currentScore<=20?'🔥 JACKPOT - EXTREME FEAR!':'⚠️ JACKPOT - EXTREME GREED!',{body:'Score: '+currentScore});
                    lastNotificationScore=currentScore;
                }else if(!extreme){lastNotificationScore=null;}

                // Update portfolio advice if portfolio exists
                if(portfolioData){
                    updatePortfolioAdvice();
                }
            }catch(e){
                console.error('Data fetch error:',e);
                document.getElementById('slotStatus').textContent='CONNECTION ERROR';
                document.getElementById('slotStatus').style.color='#ff0000';
                document.getElementById('degenStatus').textContent='🔄 Pull lever to retry';
                document.getElementById('degenStatus').style.color='#ffaa00';
                document.getElementById('quoteText').textContent='Unable to fetch data. Please try again.';
            }
        }
        
        function shareToX(){
            const s=currentScore<20?'BLOOD IN THE STREETS':currentScore<40?'PAPER HANDS EVERYWHERE':currentScore<60?'CRAB MARKET':currentScore<80?'FOMO KICKING IN':'EUPHORIA - TOP IS IN';
            const e=currentScore<20?'🔥':currentScore<40?'💎':currentScore<60?'🦀':currentScore<80?'🚀':'⚠️';
            const symbol=getSymbolForScore(currentScore);
            const t=e+' '+symbol+' Crypto F&G: '+currentScore+'/100\n\nStatus: '+s+'\n\nCheck it live:';
            window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent(t)+'&url='+encodeURIComponent(window.location.href),'_blank','width=550,height=420');
        }
        
        function refreshAll(){
            fetchData();
            fetchBTCPrice();
            fetchBTCDominance();
            fetchBTCMarketCap();
            fetchHistoricalData();
        }

        // Initial load - fetch BTC data and chart, but NOT slot machine
        // Slot machine only spins when user clicks SPIN button
        fetchBTCPrice();
        fetchBTCDominance();
        fetchBTCMarketCap();
        fetchHistoricalData();

        // No auto-refresh - only update when user spins the slot

        // Portfolio Management
        let portfolioData = null;
        let allocationChartInstance = null;

        function loadPortfolio() {
            const saved = localStorage.getItem('portfolio');
            if (saved) {
                portfolioData = JSON.parse(saved);
                return portfolioData;
            }
            return null;
        }

        function savePortfolio() {
            const crypto = parseFloat(document.getElementById('cryptoInput').value) || 0;
            const stablecoins = parseFloat(document.getElementById('stablesInput').value) || 0;

            // Validate for negative values
            if (crypto < 0 || stablecoins < 0) {
                alert('Please enter positive values only. Negative amounts are not allowed.');
                return;
            }

            if (crypto === 0 && stablecoins === 0) {
                alert('Please enter at least one value');
                return;
            }

            portfolioData = { crypto, stablecoins };
            localStorage.setItem('portfolio', JSON.stringify(portfolioData));

            renderAllocationChart();
            updatePortfolioAdvice();
        }

        function calculateAllocation() {
            if (!portfolioData) return null;
            const total = portfolioData.crypto + portfolioData.stablecoins;
            if (total === 0) return null;

            return {
                cryptoRatio: portfolioData.crypto / total,
                stablesRatio: portfolioData.stablecoins / total,
                total: total
            };
        }

        function getPortfolioAdvice(fgiScore, cryptoRatio) {
            // Extreme Fear (0-25) + High Cash (cryptoRatio < 30%)
            if (fgiScore <= 25 && cryptoRatio < 0.3) {
                return {
                    text: "Deploy your cash - great entry point!",
                    color: "#44ff88",
                    borderColor: "#44ff88"
                };
            }

            // Extreme Greed (75-100) + High Crypto (cryptoRatio > 70%)
            if (fgiScore >= 75 && cryptoRatio > 0.7) {
                return {
                    text: "Take profits - you're overexposed!",
                    color: "#ff4444",
                    borderColor: "#ff4444"
                };
            }

            // Fear (26-45) + Low Crypto (opportunity)
            if (fgiScore <= 45 && cryptoRatio < 0.4) {
                return {
                    text: "Good time to increase crypto allocation",
                    color: "#88ff44",
                    borderColor: "#88ff44"
                };
            }

            // Greed (55-74) + High Crypto (warning)
            if (fgiScore >= 55 && cryptoRatio > 0.6) {
                return {
                    text: "Consider taking some profits",
                    color: "#ff8844",
                    borderColor: "#ff8844"
                };
            }

            // Balanced
            return {
                text: "Your allocation looks good",
                color: "#D0DB97",
                borderColor: "#D0DB97"
            };
        }

        function updatePortfolioAdvice() {
            const allocation = calculateAllocation();
            if (!allocation || currentScore === 0) return;

            const advice = getPortfolioAdvice(currentScore, allocation.cryptoRatio);
            const adviceElement = document.getElementById('portfolioAdvice');
            const adviceCardElement = document.getElementById('portfolioAdviceCard');
            const adviceText = document.getElementById('adviceText');

            adviceText.textContent = advice.text;
            adviceText.style.color = advice.color;

            // Show the card when there's portfolio advice
            if (adviceCardElement) adviceCardElement.style.display = 'block';
            if (adviceElement) adviceElement.style.display = 'block';
        }

        function renderAllocationChart() {
            if (!portfolioData) return;

            const allocation = calculateAllocation();
            if (!allocation) return;

            document.getElementById('portfolioChart').style.display = 'block';

            const ctx = document.getElementById('allocationChart').getContext('2d');

            if (allocationChartInstance) {
                allocationChartInstance.destroy();
            }

            allocationChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Crypto', 'Stablecoins'],
                    datasets: [{
                        data: [portfolioData.crypto, portfolioData.stablecoins],
                        backgroundColor: ['#69B578', '#3A7D44'],
                        borderColor: ['#fff', '#fff'],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#00ff00',
                                font: {
                                    family: 'Courier New',
                                    size: 12
                                },
                                padding: 15
                            }
                        }
                    }
                }
            });

            // Display allocation stats
            const statsHTML = `
                <div class="stat-item">
                    <span class="stat-label">Crypto:</span>
                    <span class="stat-value">$${portfolioData.crypto.toLocaleString()} (${(allocation.cryptoRatio * 100).toFixed(1)}%)</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Stablecoins:</span>
                    <span class="stat-value">$${portfolioData.stablecoins.toLocaleString()} (${(allocation.stablesRatio * 100).toFixed(1)}%)</span>
                </div>
                <div class="stat-item" style="margin-top:10px;border-top:2px solid rgba(0,255,0,0.5);padding-top:10px;">
                    <span class="stat-label">Total:</span>
                    <span class="stat-value">$${allocation.total.toLocaleString()}</span>
                </div>
            `;
            document.getElementById('allocationStats').innerHTML = statsHTML;
        }

        // Initialize modal handlers after DOM is ready
        function initPortfolioModal() {
            const modal = document.getElementById('portfolioModal');
            const portfolioBtn = document.getElementById('portfolioToggle');
            const closeBtn = document.getElementsByClassName('close')[0];
            const saveBtn = document.getElementById('savePortfolioBtn');

            if (!modal || !portfolioBtn || !closeBtn || !saveBtn) {
                console.error('Portfolio modal elements not found', {modal, portfolioBtn, closeBtn, saveBtn});
                return;
            }

            console.log('Portfolio modal initialized successfully');

            portfolioBtn.addEventListener('click', function() {
                console.log('Portfolio button clicked');
                modal.style.display = 'block';
                modal.setAttribute('aria-hidden', 'false');
                portfolioBtn.setAttribute('aria-pressed', 'true');
                const saved = loadPortfolio();
                if (saved) {
                    document.getElementById('cryptoInput').value = saved.crypto;
                    document.getElementById('stablesInput').value = saved.stablecoins;
                    renderAllocationChart();
                }
                // Focus first input for keyboard users
                document.getElementById('cryptoInput').focus();
            });

            const closeModal = function() {
                console.log('Modal closed');
                modal.style.display = 'none';
                modal.setAttribute('aria-hidden', 'true');
                portfolioBtn.setAttribute('aria-pressed', 'false');
                portfolioBtn.focus(); // Return focus to trigger button
            };

            closeBtn.addEventListener('click', closeModal);

            // Keyboard support for close button
            closeBtn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    closeModal();
                }
            });

            // ESC key to close modal
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && modal.style.display === 'block') {
                    closeModal();
                }
            });

            saveBtn.addEventListener('click', function() {
                console.log('Save button clicked');
                savePortfolio();
            });

            window.addEventListener('click', function(event) {
                if (event.target == modal) {
                    closeModal();
                }
            });
        }

        // Load portfolio on page load
        loadPortfolio();

        // Initialize modal immediately (modal is now defined before script)
        initPortfolioModal();

        // Initialize Backtester Modal
        function initBacktesterModal() {
            const modal = document.getElementById('backtesterModal');
            const backtesterBtn = document.getElementById('backtesterToggle');
            const closeBtn = modal?.querySelector('.close');

            if (!modal || !backtesterBtn || !closeBtn) {
                console.error('Backtester modal elements not found');
                return;
            }

            // Strategy data
            const strategyData = {
                greed: {
                    1: {roi: 1.38, samples: 92, winRate: 63.0, days: 100.0},
                    2: {roi: 1.95, samples: 61, winRate: 65.6, days: 103.2},
                    3: {roi: 2.44, samples: 41, winRate: 68.3, days: 104.4},
                    4: {roi: 5.52, samples: 31, winRate: 64.5, days: 110.5},
                    5: {roi: 5.06, samples: 26, winRate: 69.2, days: 110.3},
                    6: {roi: 9.46, samples: 23, winRate: 69.6, days: 100.2},
                    7: {roi: 5.55, samples: 19, winRate: 68.4, days: 113.2},
                    8: {roi: 7.95, samples: 15, winRate: 66.7, days: 117.3},
                    9: {roi: 8.12, samples: 13, winRate: 61.5, days: 112.9},
                    10: {roi: 8.22, samples: 12, winRate: 58.3, days: 115.8},
                    11: {roi: 5.65, samples: 12, winRate: 58.3, days: 114.8},
                    12: {roi: 13.02, samples: 10, winRate: 70.0, days: 102.8},
                    13: {roi: 12.76, samples: 9, winRate: 66.7, days: 112.4},
                    14: {roi: 15.25, samples: 9, winRate: 77.8, days: 111.4},
                    15: {roi: 20.27, samples: 8, winRate: 75.0, days: 103.4},
                    16: {roi: 16.43, samples: 7, winRate: 85.7, days: 107.9},
                    17: {roi: 15.76, samples: 6, winRate: 83.3, days: 105.2},
                    18: {roi: 19.14, samples: 6, winRate: 83.3, days: 104.2},
                    19: {roi: 21.31, samples: 5, winRate: 80.0, days: 121.6},
                    20: {roi: 22.58, samples: 4, winRate: 75.0, days: 126.8}
                },
                extremeGreed: {
                    1: {roi: 69.26, samples: 88, winRate: 100.0, days: 393.3},
                    2: {roi: 74.96, samples: 57, winRate: 100.0, days: 357.3},
                    3: {roi: 83.74, samples: 39, winRate: 100.0, days: 343.1},
                    4: {roi: 93.42, samples: 30, winRate: 100.0, days: 348.8},
                    5: {roi: 94.87, samples: 26, winRate: 100.0, days: 364.1},
                    6: {roi: 102.18, samples: 23, winRate: 100.0, days: 334.2},
                    7: {roi: 102.09, samples: 19, winRate: 100.0, days: 339.7},
                    8: {roi: 103.53, samples: 15, winRate: 100.0, days: 359.3},
                    9: {roi: 109.50, samples: 13, winRate: 100.0, days: 369.4},
                    10: {roi: 112.47, samples: 12, winRate: 100.0, days: 386.9},
                    11: {roi: 109.94, samples: 12, winRate: 100.0, days: 385.9},
                    12: {roi: 121.08, samples: 10, winRate: 100.0, days: 404.5},
                    13: {roi: 126.33, samples: 9, winRate: 100.0, days: 438.7},
                    14: {roi: 129.56, samples: 9, winRate: 100.0, days: 437.7},
                    15: {roi: 139.61, samples: 8, winRate: 100.0, days: 455.6},
                    16: {roi: 118.24, samples: 7, winRate: 100.0, days: 454.1},
                    17: {roi: 102.35, samples: 6, winRate: 100.0, days: 443.5},
                    18: {roi: 108.47, samples: 6, winRate: 100.0, days: 442.5},
                    19: {roi: 125.97, samples: 5, winRate: 100.0, days: 444.2},
                    20: {roi: 102.42, samples: 4, winRate: 100.0, days: 431.5}
                }
            };

            let selectedDay = 1;
            let investmentAmount = 1000;

            // Setup day slider
            const daySlider = modal.querySelector('#daySlider');
            const dayValue = modal.querySelector('#dayValue');
            if (daySlider && dayValue) {
                daySlider.addEventListener('input', (e) => {
                    selectedDay = parseInt(e.target.value);
                    dayValue.textContent = selectedDay;
                    updateDisplay();
                });
            }

            function updateDisplay() {
                const greed = strategyData.greed[selectedDay];
                const xgreed = strategyData.extremeGreed[selectedDay];

                modal.querySelector('#greed-samples').textContent = `${greed.samples} trades`;
                modal.querySelector('#greed-roi').textContent = `+${greed.roi.toFixed(2)}%`;
                modal.querySelector('#greed-winrate').textContent = `${greed.winRate.toFixed(1)}%`;
                modal.querySelector('#greed-days').textContent = `~${Math.round(greed.days)} days`;
                modal.querySelector('#greed-profit').textContent = `$${Math.round(investmentAmount * (1 + greed.roi / 100)).toLocaleString()}`;

                modal.querySelector('#xgreed-samples').textContent = `${xgreed.samples} trades`;
                modal.querySelector('#xgreed-roi').textContent = `+${xgreed.roi.toFixed(2)}%`;
                modal.querySelector('#xgreed-winrate').textContent = `${xgreed.winRate.toFixed(1)}%`;
                modal.querySelector('#xgreed-days').textContent = `~${Math.round(xgreed.days)} days`;
                modal.querySelector('#xgreed-profit').textContent = `$${Math.round(investmentAmount * (1 + xgreed.roi / 100)).toLocaleString()}`;

                modal.querySelector('#hodl-invest').textContent = `$${investmentAmount.toLocaleString()}`;
                modal.querySelector('#hodl-profit').textContent = `$${Math.round(investmentAmount * (1 - 0.0113)).toLocaleString()}`;
            }

            // Slider handler
            const slider = modal.querySelector('#investmentSlider');
            const valueDisplay = modal.querySelector('#investmentValue');

            slider.addEventListener('input', function() {
                investmentAmount = parseInt(this.value);
                valueDisplay.textContent = investmentAmount.toLocaleString();
                updateDisplay();
            });

            // Open modal
            backtesterBtn.addEventListener('click', function() {
                modal.style.display = 'block';
                modal.setAttribute('aria-hidden', 'false');
                backtesterBtn.setAttribute('aria-pressed', 'true');
                updateDisplay();
            });

            // Close modal
            const closeModal = function() {
                modal.style.display = 'none';
                modal.setAttribute('aria-hidden', 'true');
                backtesterBtn.setAttribute('aria-pressed', 'false');
                backtesterBtn.focus();
            };

            closeBtn.addEventListener('click', closeModal);

            closeBtn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    closeModal();
                }
            });

            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && modal.style.display === 'block') {
                    closeModal();
                }
            });

            window.addEventListener('click', function(event) {
                if (event.target == modal) {
                    closeModal();
                }
            });

            // Initialize display
            updateDisplay();
        }

        initBacktesterModal();

        // Hindsight Score Data and Functions
        const hindsightData = {
            "Extreme Fear": {
                "day7": { avgReturn: 1.11, winRate: 52.2, wins: 147, total: 275, best: 40.35, worst: -23.94 },
                "day14": { avgReturn: 1.44, winRate: 53.1, wins: 146, total: 275, best: 58.40, worst: -28.42 },
                "day30": { avgReturn: -0.85, winRate: 48.4, wins: 133, total: 275, best: 56.94, worst: -37.41 }
            },
            "Fear": {
                "day7": { avgReturn: 2.32, winRate: 57.0, wins: 251, total: 440, best: 32.74, worst: -16.67 },
                "day14": { avgReturn: 3.33, winRate: 56.8, wins: 250, total: 440, best: 50.68, worst: -22.65 },
                "day30": { avgReturn: 4.54, winRate: 56.8, wins: 250, total: 440, best: 74.11, worst: -30.99 }
            },
            "Neutral": {
                "day7": { avgReturn: 1.86, winRate: 53.1, wins: 230, total: 433, best: 27.03, worst: -15.05 },
                "day14": { avgReturn: 3.71, winRate: 56.4, wins: 244, total: 433, best: 42.62, worst: -22.50 },
                "day30": { avgReturn: 6.82, winRate: 59.6, wins: 258, total: 433, best: 79.08, worst: -26.30 }
            },
            "Greed": {
                "day7": { avgReturn: 0.67, winRate: 50.5, wins: 339, total: 671, best: 21.58, worst: -18.26 },
                "day14": { avgReturn: 2.04, winRate: 52.2, wins: 350, total: 671, best: 34.61, worst: -22.60 },
                "day30": { avgReturn: 3.97, winRate: 50.8, wins: 341, total: 671, best: 68.67, worst: -32.21 }
            },
            "Extreme Greed": {
                "day7": { avgReturn: 5.08, winRate: 63.6, wins: 96, total: 151, best: 32.74, worst: -17.12 },
                "day14": { avgReturn: 10.42, winRate: 69.5, wins: 105, total: 151, best: 57.89, worst: -20.28 },
                "day30": { avgReturn: 21.87, winRate: 74.8, wins: 113, total: 151, best: 120.47, worst: -28.90 }
            }
        };

        function getFGIRange(score) {
            if (score <= 24) return 'Extreme Fear';
            if (score <= 44) return 'Fear';
            if (score <= 59) return 'Neutral';
            if (score <= 79) return 'Greed';
            return 'Extreme Greed';
        }

        function getReturnColor(value) {
            if (value > 10) return '#44ff88';
            if (value > 5) return '#88ff44';
            if (value > 0) return '#D0DB97';
            if (value > -5) return '#ff8844';
            return '#ff4444';
        }

        function updateHindsightModal(score) {
            const range = getFGIRange(score);
            const data = hindsightData[range];

            // Update current range badge
            document.getElementById('currentRangeBadge').textContent = `Current Range: ${range} (${score})`;

            // Update time period cards
            const day7 = data.day7;
            const day14 = data.day14;
            const day30 = data.day30;

            document.getElementById('return7d').textContent = (day7.avgReturn > 0 ? '+' : '') + day7.avgReturn.toFixed(2) + '%';
            document.getElementById('return7d').style.color = getReturnColor(day7.avgReturn);
            document.getElementById('winrate7d').textContent = `Win Rate: ${day7.winRate.toFixed(1)}% (${day7.wins}/${day7.total})`;

            document.getElementById('return14d').textContent = (day14.avgReturn > 0 ? '+' : '') + day14.avgReturn.toFixed(2) + '%';
            document.getElementById('return14d').style.color = getReturnColor(day14.avgReturn);
            document.getElementById('winrate14d').textContent = `Win Rate: ${day14.winRate.toFixed(1)}% (${day14.wins}/${day14.total})`;

            document.getElementById('return30d').textContent = (day30.avgReturn > 0 ? '+' : '') + day30.avgReturn.toFixed(2) + '%';
            document.getElementById('return30d').style.color = getReturnColor(day30.avgReturn);
            document.getElementById('winrate30d').textContent = `Win Rate: ${day30.winRate.toFixed(1)}% (${day30.wins}/${day30.total})`;

            // Update historical stats
            document.getElementById('bestCase').textContent = '+' + day30.best.toFixed(2) + '%';
            document.getElementById('bestCase').style.color = '#44ff88';
            document.getElementById('worstCase').textContent = day30.worst.toFixed(2) + '%';
            document.getElementById('worstCase').style.color = '#ff4444';
            document.getElementById('sampleSize').textContent = day30.total + ' occurrences';

            // Update insight
            updateHindsightInsight(range, day30);

            // Update comparison table
            updateComparisonTable(range);
        }

        function updateHindsightInsight(range, data) {
            let insight = '';

            if (range === 'Extreme Fear') {
                insight = `Historically, Extreme Fear has shown mixed results with a slight negative bias (-0.85% avg over 30 days). While contrarian wisdom suggests buying during fear, the data shows this range often precedes further declines. Best case: +${data.best.toFixed(0)}%, Worst case: ${data.worst.toFixed(0)}%.`;
            } else if (range === 'Fear') {
                insight = `Fear levels have historically been solid entry points, averaging +4.54% over 30 days with a 56.8% win rate. This range offers good risk/reward with less downside than Extreme Fear. Consider gradual accumulation.`;
            } else if (range === 'Neutral') {
                insight = `Neutral sentiment has performed surprisingly well, averaging +6.82% over 30 days (59.6% win rate). This contradicts the "buy fear" narrative - stable sentiment often leads to steady gains. Second-best performer overall.`;
            } else if (range === 'Greed') {
                insight = `Greed has shown moderate returns (+3.97% avg, 50.8% win rate). While not as strong as Neutral or Extreme Greed, it's still positive. The momentum strategy appears to work better than contrarian approaches.`;
            } else if (range === 'Extreme Greed') {
                insight = `🚀 Extreme Greed is the TOP PERFORMER with +21.87% average returns and 74.8% win rate! This defies conventional wisdom - when everyone's greedy, BTC tends to go MUCH higher. Momentum > Contrarian. Best case: +${data.best.toFixed(0)}%!`;
            }

            document.getElementById('insightText').textContent = insight;
        }

        function updateComparisonTable(currentRange) {
            const tbody = document.getElementById('comparisonTableBody');
            tbody.innerHTML = '';

            const ranges = ['Extreme Fear', 'Fear', 'Neutral', 'Greed', 'Extreme Greed'];

            ranges.forEach(range => {
                const data = hindsightData[range];
                const row = document.createElement('tr');
                if (range === currentRange) {
                    row.classList.add('current-row');
                }

                row.innerHTML = `
                    <td>${range}</td>
                    <td style="color: ${getReturnColor(data.day7.avgReturn)}">${(data.day7.avgReturn > 0 ? '+' : '') + data.day7.avgReturn.toFixed(2)}%</td>
                    <td style="color: ${getReturnColor(data.day14.avgReturn)}">${(data.day14.avgReturn > 0 ? '+' : '') + data.day14.avgReturn.toFixed(2)}%</td>
                    <td style="color: ${getReturnColor(data.day30.avgReturn)}">${(data.day30.avgReturn > 0 ? '+' : '') + data.day30.avgReturn.toFixed(2)}%</td>
                    <td>${data.day30.winRate.toFixed(1)}%</td>
                    <td>${data.day30.total}</td>
                `;
                tbody.appendChild(row);
            });
        }

        // Hindsight Modal Handlers
        function initHindsightModal() {
            const modal = document.getElementById('hindsightModal');
            const hindsightBtn = document.getElementById('hindsightToggle');
            const closeBtn = document.querySelector('.hindsight-close');
            const comparisonToggle = document.getElementById('comparisonToggle');
            const comparisonTable = document.getElementById('comparisonTableContainer');

            if (!modal || !hindsightBtn || !closeBtn) {
                console.error('Hindsight modal elements not found');
                return;
            }

            hindsightBtn.addEventListener('click', function() {
                modal.style.display = 'block';
                modal.setAttribute('aria-hidden', 'false');
                hindsightBtn.setAttribute('aria-pressed', 'true');

                // Update with current score (fall back to Neutral range if not yet loaded)
                updateHindsightModal(currentScore > 0 ? currentScore : 50);
            });

            const closeModal = function() {
                modal.style.display = 'none';
                modal.setAttribute('aria-hidden', 'true');
                hindsightBtn.setAttribute('aria-pressed', 'false');
                hindsightBtn.focus();
            };

            closeBtn.addEventListener('click', closeModal);

            closeBtn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    closeModal();
                }
            });

            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && modal.style.display === 'block') {
                    closeModal();
                }
            });

            comparisonToggle.addEventListener('click', function() {
                comparisonTable.classList.toggle('visible');
                comparisonToggle.textContent = comparisonTable.classList.contains('visible')
                    ? 'Hide Comparison Table'
                    : 'Compare All FGI Ranges';
            });

            window.addEventListener('click', function(event) {
                if (event.target == modal) {
                    closeModal();
                }
            });
        }

        // Initialize hindsight modal
        initHindsightModal();

        // Add pulse animation to SPIN button on page load
        const spinBtn = document.getElementById('spinBtn');
        spinBtn.classList.add('pulse');

        // Add event listeners for all interactive elements (CSP-friendly)
        document.getElementById('spinBtn').addEventListener('click', function() {
            // Remove pulse animation after first click
            spinBtn.classList.remove('pulse');
            spinSlots();
        });

        // Keyboard support for spin button
        document.getElementById('spinBtn').addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Remove pulse animation after first interaction
                spinBtn.classList.remove('pulse');
                spinSlots();
            }
        });

        document.getElementById('shareBtn').addEventListener('click', shareToX);

        // Keyboard support for share button
        document.getElementById('shareBtn').addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                shareToX();
            }
        });

        document.getElementById('refreshBtn').addEventListener('click', refreshAll);

        // Keyboard support for refresh button
        document.getElementById('refreshBtn').addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                refreshAll();
            }
        });

        // ── Viral Moment Generator ────────────────────────────────────────────────
        (function() {
            const BACKTEST_URL = '/data/backtest-results-5.5years.json';
            const LOW_SAMPLE_THRESHOLD = 10;
            let backtestData = null;

            // State
            let vgRange = 'Extreme Greed';
            let vgAmount = 1000;
            let vgPeriod = 30;

            // Elements
            const amountSlider  = document.getElementById('vgAmountSlider');
            const amountDisplay = document.getElementById('vgAmountDisplay');
            const callout       = document.getElementById('vgCallout');
            const lowSample     = document.getElementById('vgLowSample');
            const resultCard    = document.getElementById('vgResultCard');
            const resultLabel   = document.getElementById('vgResultLabel');
            const resultMain    = document.getElementById('vgResultMain');
            const returnVal     = document.getElementById('vgReturnVal');
            const winRateVal    = document.getElementById('vgWinRateVal');
            const sampleVal     = document.getElementById('vgSampleVal');
            const periodVal     = document.getElementById('vgPeriodVal');
            const sampleNote    = document.getElementById('vgSampleNote');
            const shareBtn      = document.getElementById('vgShareBtn');
            const toast         = document.getElementById('vgToast');
            const backtesterLink = document.getElementById('vgBacktesterLink');

            // Fetch data once
            fetch(BACKTEST_URL)
                .then(function(r) { return r.json(); })
                .then(function(data) {
                    backtestData = data.results;
                    updateResult();
                })
                .catch(function() {
                    resultCard.innerHTML = '<div class="vg-error">Data unavailable — try refreshing the page.</div>';
                    shareBtn.disabled = true;
                    shareBtn.style.opacity = '0.4';
                });

            function computeStats(range, period) {
                if (!backtestData) return null;
                var key = 'day' + period;
                var bucket = backtestData[range] && backtestData[range][key];
                if (!bucket || !bucket.returns || bucket.returns.length === 0) return null;
                var rets = bucket.returns;
                var n = rets.length;
                var avg = rets.reduce(function(s, v) { return s + v; }, 0) / n;
                var wins = rets.filter(function(v) { return v > 0; }).length;
                var winRate = (wins / n) * 100;
                return { n: n, avg: avg, winRate: winRate };
            }

            function formatDollar(val) {
                return '$' + Math.round(val).toLocaleString();
            }

            function updateResult() {
                if (!backtestData) return;
                var stats = computeStats(vgRange, vgPeriod);
                if (!stats) {
                    resultCard.innerHTML = '<div class="vg-error">No data for this combination.</div>';
                    return;
                }

                var result = vgAmount * (1 + stats.avg / 100);
                var positive = stats.avg >= 0;
                var returnStr = (positive ? '+' : '') + stats.avg.toFixed(1) + '%';
                var winRateStr = Math.round(stats.winRate) + '%';
                var resultStr = formatDollar(vgAmount) + ' → ' + formatDollar(result);

                // Label
                resultLabel.textContent = 'If you bought every time FGI hit ' + vgRange + ' and held ' + vgPeriod + ' days...';

                // Main result
                resultMain.textContent = resultStr;
                resultMain.className = 'vg-result-main ' + (positive ? 'positive' : 'negative');

                // Stats
                returnVal.textContent = returnStr;
                winRateVal.textContent = winRateStr;
                sampleVal.textContent = stats.n;
                periodVal.textContent = vgPeriod + ' days';
                sampleNote.textContent = 'Based on ' + stats.n + ' occurrences · May 2020–Nov 2025';

                // Card border
                resultCard.className = 'vg-result-card ' + (positive ? 'positive' : 'negative');

                // Extreme Greed callout
                callout.className = 'vg-callout' + (vgRange === 'Extreme Greed' ? '' : ' hidden');

                // Low sample warning
                if (stats.n < LOW_SAMPLE_THRESHOLD) {
                    lowSample.textContent = '⚠️ Low sample size (n=' + stats.n + ') — treat with caution';
                    lowSample.className = 'vg-low-sample';
                } else {
                    lowSample.className = 'vg-low-sample hidden';
                }
            }

            // Range buttons
            document.querySelectorAll('.vg-range-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.vg-range-btn').forEach(function(b) { b.classList.remove('active'); });
                    btn.classList.add('active');
                    vgRange = btn.dataset.range;
                    updateResult();
                });
            });

            // Period buttons
            document.querySelectorAll('.vg-period-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.vg-period-btn').forEach(function(b) { b.classList.remove('active'); });
                    btn.classList.add('active');
                    vgPeriod = parseInt(btn.dataset.period);
                    updateResult();
                });
            });

            // Amount slider
            amountSlider.addEventListener('input', function() {
                vgAmount = parseInt(amountSlider.value);
                amountDisplay.textContent = vgAmount.toLocaleString();
                updateResult();
            });

            // Backtester link
            if (backtesterLink) {
                backtesterLink.addEventListener('click', function() {
                    var btn = document.getElementById('backtesterToggle');
                    if (btn) btn.click();
                });
            }

            // Share
            function showToast(msg) {
                toast.textContent = msg;
                toast.classList.add('show');
                setTimeout(function() { toast.classList.remove('show'); }, 3000);
            }

            function buildCanvasCard(stats, callback) {
                var W = 600, H = 340;
                var canvas = document.createElement('canvas');
                canvas.width = W;
                canvas.height = H;
                var ctx = canvas.getContext('2d');
                var positive = stats.avg >= 0;
                var accentColor = positive ? '#39ff14' : '#ff4444';
                var result = vgAmount * (1 + stats.avg / 100);

                function draw() {
                    // Background
                    ctx.fillStyle = '#0a0e14';
                    ctx.fillRect(0, 0, W, H);

                    // Border
                    ctx.strokeStyle = accentColor;
                    ctx.lineWidth = 2;
                    ctx.strokeRect(2, 2, W - 4, H - 4);

                    // Header: FGI CHAD
                    ctx.fillStyle = '#39ff14';
                    ctx.font = "bold 18px 'Inter', system-ui, sans-serif";
                    ctx.textAlign = 'center';
                    ctx.fillText('FGI CHAD', W / 2, 38);

                    // Separator
                    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(60, 52);
                    ctx.lineTo(W - 60, 52);
                    ctx.stroke();

                    // Label
                    ctx.fillStyle = '#888888';
                    ctx.font = "14px 'Inter', system-ui, sans-serif";
                    ctx.fillText('If you bought every time FGI hit ' + vgRange + ' and held ' + vgPeriod + ' days...', W / 2, 78);

                    // Main result
                    ctx.fillStyle = accentColor;
                    ctx.font = "bold 42px 'Inter', system-ui, sans-serif";
                    ctx.fillText(formatDollar(vgAmount) + ' \u2192 ' + formatDollar(result), W / 2, 140);

                    // Stats row
                    var cols = [W * 0.2, W * 0.5, W * 0.8];
                    var labels = ['Avg Return', 'Win Rate', 'Occurrences'];
                    var values = [
                        (stats.avg >= 0 ? '+' : '') + stats.avg.toFixed(1) + '%',
                        Math.round(stats.winRate) + '%',
                        stats.n.toString()
                    ];
                    cols.forEach(function(x, i) {
                        ctx.fillStyle = '#e0e0e0';
                        ctx.font = "bold 20px 'Inter', system-ui, sans-serif";
                        ctx.textAlign = 'center';
                        ctx.fillText(values[i], x, 190);
                        ctx.fillStyle = '#666666';
                        ctx.font = "12px 'Inter', system-ui, sans-serif";
                        ctx.fillText(labels[i], x, 210);
                    });
                    ctx.textAlign = 'center';

                    // Separator
                    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
                    ctx.beginPath();
                    ctx.moveTo(60, 228);
                    ctx.lineTo(W - 60, 228);
                    ctx.stroke();

                    // Sample note
                    ctx.fillStyle = '#555555';
                    ctx.font = "12px 'Inter', system-ui, sans-serif";
                    ctx.fillText('Based on ' + stats.n + ' occurrences \u00b7 5.5 years of data \u00b7 fgichad.xyz', W / 2, 252);

                    // Disclaimer
                    ctx.fillStyle = '#444444';
                    ctx.font = "11px 'Inter', system-ui, sans-serif";
                    ctx.fillText('Past performance does not guarantee future results. Not financial advice.', W / 2, 275);

                    // Extreme Greed callout
                    if (vgRange === 'Extreme Greed') {
                        ctx.fillStyle = 'rgba(57,255,20,0.1)';
                        ctx.fillRect(60, 290, W - 120, 30);
                        ctx.strokeStyle = 'rgba(57,255,20,0.3)';
                        ctx.strokeRect(60, 290, W - 120, 30);
                        ctx.fillStyle = '#39ff14';
                        ctx.font = "12px 'Inter', system-ui, sans-serif";
                        ctx.fillText('\u26a1 Extreme Greed beats Extreme Fear by 22.7% \u2014 not what most people expect', W / 2, 310);
                    }

                    canvas.toBlob(function(blob) { callback(blob, canvas); }, 'image/png');
                }

                // Pre-load font
                document.fonts.load("bold 42px 'Inter'").then(draw).catch(draw);
            }

            shareBtn.addEventListener('click', function() {
                if (!backtestData) return;
                var stats = computeStats(vgRange, vgPeriod);
                if (!stats) return;

                shareBtn.disabled = true;
                shareBtn.textContent = '⏳ Generating...';

                buildCanvasCard(stats, function(blob, canvas) {
                    shareBtn.disabled = false;
                    shareBtn.innerHTML = '📤 Share This Result';

                    var result = vgAmount * (1 + stats.avg / 100);
                    var shareText = 'If you bought every time the Crypto Fear & Greed Index hit ' + vgRange +
                        ' and held ' + vgPeriod + ' days...\n' +
                        formatDollar(vgAmount) + ' → ' + formatDollar(result) +
                        ' (' + (stats.avg >= 0 ? '+' : '') + stats.avg.toFixed(1) + '% avg, ' +
                        Math.round(stats.winRate) + '% win rate)\n\n' +
                        '5.5 years of data · fgichad.xyz';

                    var file = new File([blob], 'fgichad-result.png', { type: 'image/png' });

                    // Tier 1: native file share (iOS Safari, Chrome Android)
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        navigator.share({ files: [file], title: 'FGI CHAD Result', text: shareText })
                            .catch(function() { /* user cancelled */ });
                        return;
                    }

                    // Tier 2: native share without file (broader mobile)
                    if (navigator.share) {
                        navigator.share({ title: 'FGI CHAD Result', text: shareText, url: 'https://fgichad.xyz' })
                            .catch(function() { /* user cancelled */ });
                        return;
                    }

                    // Tier 3: clipboard image (desktop Chrome/Edge)
                    if (navigator.clipboard && window.ClipboardItem) {
                        navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
                            .then(function() { showToast('📋 Image copied to clipboard!'); })
                            .catch(function() { downloadPng(blob); });
                        return;
                    }

                    // Tier 4: download
                    downloadPng(blob);
                });
            });

            function downloadPng(blob) {
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = 'fgichad-result.png';
                document.body.appendChild(a);
                a.click();
                setTimeout(function() {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
                showToast('📥 Image downloaded!');
            }
        })();
        // ── End Viral Moment Generator ─────────────────────────────────────────────


        // Mobile footer hide on scroll (like X/Twitter)
            let lastScrollTop = 0;
            const mobileFooter = document.getElementById('controlsMobile');

            if (mobileFooter) {
                // Set up click handlers for mobile footer buttons
                const mobileHindsightBtn = mobileFooter.querySelector('.hindsight-btn');
                const mobileButtons = mobileFooter.querySelectorAll('button.control-btn');
                const mobileBacktesterBtn = mobileButtons[0]; // ♟️ Backtester button (first)
                const mobilePortfolioBtn = mobileButtons[1]; // 💼 Portfolio button (second)

                // Hindsight button - open hindsight modal directly
                if (mobileHindsightBtn) {
                    mobileHindsightBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        const modal = document.getElementById('hindsightModal');
                        const desktopBtn = document.getElementById('hindsightToggle');
                        if (modal && desktopBtn) {
                            modal.style.display = 'block';
                            modal.setAttribute('aria-hidden', 'false');
                            desktopBtn.setAttribute('aria-pressed', 'true');
                            updateHindsightModal(currentScore > 0 ? currentScore : 50);
                        }
                    });
                }

                // Backtester button - open backtester modal directly
                if (mobileBacktesterBtn) {
                    mobileBacktesterBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        const modal = document.getElementById('backtesterModal');
                        const desktopBtn = document.getElementById('backtesterToggle');
                        if (modal && desktopBtn) {
                            modal.style.display = 'block';
                            modal.setAttribute('aria-hidden', 'false');
                            desktopBtn.setAttribute('aria-pressed', 'true');
                        }
                    });
                }

                // Portfolio button - open portfolio modal directly
                if (mobilePortfolioBtn) {
                    mobilePortfolioBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        const modal = document.getElementById('portfolioModal');
                        const desktopBtn = document.getElementById('portfolioToggle');
                        if (modal && desktopBtn) {
                            modal.style.display = 'block';
                            modal.setAttribute('aria-hidden', 'false');
                            desktopBtn.setAttribute('aria-pressed', 'true');
                            const saved = loadPortfolio();
                            if (saved) {
                                document.getElementById('cryptoInput').value = saved.crypto;
                                document.getElementById('stablesInput').value = saved.stablecoins;
                                renderAllocationChart();
                            }
                        }
                    });
                }

                // Matrix toggle button
                const mobileMatrixBtn = document.getElementById('matrixToggleBtnMobile');
                if (mobileMatrixBtn) {
                    mobileMatrixBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        const desktopBtn = document.getElementById('matrixToggleBtn');
                        if (desktopBtn) desktopBtn.click();
                        mobileMatrixBtn.classList.toggle('active', matrixEnabled);
                        mobileMatrixBtn.setAttribute('aria-pressed', matrixEnabled ? 'true' : 'false');
                    });
                }

                // Scroll hide/show behavior
                if (window.innerWidth <= 800) {
                    window.addEventListener('scroll', function() {
                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

                        if (scrollTop > lastScrollTop && scrollTop > 100) {
                            // Scrolling down & past threshold - hide footer
                            mobileFooter.classList.add('hidden-scroll');
                        } else if (scrollTop < lastScrollTop) {
                            // Scrolling up - show footer
                            mobileFooter.classList.remove('hidden-scroll');
                        }

                        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
                    }, false);
                }
            }
