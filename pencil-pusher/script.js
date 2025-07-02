(function() {
  // DOM refs
  const pulpCountEl   = document.getElementById('pulpCount');
  const pencilCountEl = document.getElementById('pencilCount');
  const moneyCountEl  = document.getElementById('moneyCount');
  const priceDown     = document.getElementById('priceDown');
  const priceUp       = document.getElementById('priceUp');
  const priceDisplay  = document.getElementById('priceDisplay');
  const demandCountEl = document.getElementById('demandCount');

  const chopBtn       = document.getElementById('chopBtn');
  const pushBtn       = document.getElementById('pushBtn');

  const millCostEl    = document.getElementById('millCost');
  const millCountEl   = document.getElementById('millCount');
  const buyMillBtn    = document.getElementById('buyMillBtn');

  const pressCostEl   = document.getElementById('pressCost');
  const pressCountEl  = document.getElementById('pressCount');
  const buyPressBtn   = document.getElementById('buyPressBtn');

  // Advertising refs
  const adCostEl      = document.getElementById('adCost');
  const adCountEl     = document.getElementById('adCount');
  const buyAdBtn      = document.getElementById('buyAdBtn');

  // Constants
  const MIN_PRICE  = 0.01;
  const MAX_PRICE  = 10.00;
  const DEMAND_D0  = 33.3333;  // tuned so at $1 demand≈30%
  const MIN_SELL_MS= 500;
  const MAX_SELL_MS= 1000;
  const DEMAND_EXPONENT = 0.3;

  // State
  let pulp       = 0;
  let pencils    = 0;
  let money      = 0;
  let mills      = 0;
  let millCost   = 50;
  let presses    = 0;
  let pressCost  = 100;
  let ads        = 0;
  let adCost     = 200;
  let price      = 1.00;
  let demandPct  = 0.0;

  // Hybrid demand: boost raw by ads*10%
  function updateDemand() {
    const raw = (DEMAND_D0 / Math.pow(price, DEMAND_EXPONENT))
              * (1 - price / MAX_PRICE);
    demandPct = raw * (1 + ads * 0.10);
    demandPct = Math.max(0, Math.min(100, demandPct));
  }

  function render() {
    pulpCountEl.textContent   = pulp;
    pencilCountEl.textContent = pencils;
    moneyCountEl.textContent  = money.toFixed(2);
    millCountEl.textContent   = mills;
    millCostEl.textContent    = millCost;
    pressCountEl.textContent  = presses;
    pressCostEl.textContent   = pressCost;
    adCountEl.textContent     = ads;
    adCostEl.textContent      = adCost;
    priceDisplay.textContent  = price.toFixed(2);
    demandCountEl.textContent = demandPct.toFixed(1) + '%';
  }

  // Price ▲/▼ by $0.10
  priceDown.addEventListener('click', () => {
    price = Math.max(MIN_PRICE, +(price - 0.01).toFixed(2));
    updateDemand(); render();
  });
  priceUp.addEventListener('click', () => {
    price = Math.min(MAX_PRICE, +(price + 0.01).toFixed(2));
    updateDemand(); render();
  });

  // Chop wood → +1 pulp
  chopBtn.addEventListener('click', () => {
    pulp++; render();
  });

  // Pulp Mills: generate pulp every 1 second
  setInterval(() => {
    pulp += mills;
    render();
  }, 1000);

  // Make Pencil: consumes 1 pulp → +1 pencil
  pushBtn.addEventListener('click', () => {
    if (pulp > 0) {
      pulp--; pencils++; render();
    }
  });

  // Buy a pulp mill
  buyMillBtn.addEventListener('click', () => {
    if (money >= millCost) {
      money   -= millCost;
      mills   ++;
      millCost = Math.floor(millCost * 1.15);
      render();
    }
  });

  // Buy a pencil press
  buyPressBtn.addEventListener('click', () => {
    if (money >= pressCost) {
      money     -= pressCost;
      presses   ++;
      pressCost  = Math.floor(pressCost * 1.15);
      render();
    }
  });

  // Buy Advertising
  buyAdBtn.addEventListener('click', () => {
    if (money >= adCost) {
      money  -= adCost;
      ads    ++;
      adCost  = Math.floor(adCost * 1.15);
      updateDemand();
      render();
    }
  });

  // Auto-generate from presses every 1 second (consumes pulp)
   setInterval(() => {
    const produce = Math.min(pulp, presses);
    pulp    -= produce;
    pencils += produce;
    render();
  }, 1100);

  // Auto-sell at dynamic interval based on demand%
  function scheduleSell() {
    updateDemand();

    // interval scales from MAX_SELL_MS (low demand) → MIN_SELL_MS (high)
    const interval = MIN_SELL_MS +
      (1 - demandPct/100) * (MAX_SELL_MS - MIN_SELL_MS);

    if (pencils > 0 && demandPct > 0) {
      pencils--;
      money += price;
      render();
    }
    setTimeout(scheduleSell, interval);
  }
  scheduleSell();

  // init
  updateDemand();
  render();
})();