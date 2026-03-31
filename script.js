const input = document.getElementById('numInput');
const readout = document.getElementById('readout');
const resultEl = document.getElementById('result');
const tag = document.getElementById('tag');
const voice = document.getElementById('kuromi');
const historyEl = document.getElementById('history');
const themeSwitch = document.getElementById('themeSwitch');
const switchEl = document.getElementById('switch');
const copyBtn = document.getElementById('copyBtn');
const roundBtn = document.getElementById('roundBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

const appTitle = document.getElementById('appTitle');
const appTagline = document.getElementById('appTagline');
const themeLabel = document.getElementById('themeLabel');
const inputLabel = document.getElementById('inputLabel');
const historyTitle = document.getElementById('historyTitle');

let isMelody = false; // false = Kuromi, true = Melody
let rounded = false;
let lastResult = null;

const quips = {
  kuromi: {
    ok: [
      "Math magic unlocked ✨",
      "Cute number!", 
      "Boss move.",
      "Numbers behave when I say so 💅"
    ],
    big: [
      "That number’s as extra as my eyeliner.",
      "Serving jumbo vibes.",
      "Mega math moment!"
    ],
    tiny: [
      "Smol, but mighty.",
      "Pocket-sized chaos.",
      "Blink and you’ll miss it."
    ],
    invalid: [
      "Enter a legit number, bestie.",
      "I roast fake friends *and* invalid inputs.",
      "Try again — with feeling."
    ],
    sqrtNeg: [
      "Real roots? Not for negative vibes.",
      "No real root. Complex like my personality.",
      "We'd need imaginary friends for that one."
    ]
  },
  melody: {
    ok: [
      "Yay, perfect math vibes! 🌸",
      "So cute and correct!",
      "Numbers behaving sweetly 💖"
    ],
    big: [
      "Wow, that’s super big!",
      "Mega cute calculation!",
      "Adorable overload!"
    ],
    tiny: [
      "Awww, tiny but precious!",
      "Little number, big heart 💕",
      "Smol math magic ✨"
    ],
    invalid: [
      "Oopsie, try again cutie~",
      "That doesn’t look like math…",
      "Nuh-uh, give me real numbers 🌸"
    ],
    sqrtNeg: [
      "Oh no, negatives can’t be cute roots 💔",
      "No real root… but you’re still sweet!",
      "Only imaginary… like fairy-tale friends ✨"
    ]
  }
};

const famousKuromi = "Kuromi’s not a bad girl… just a little mischievous.";
const famousMelody = "Let’s make math cute and sweet! 🌸";

function pick(arr){ return arr[Math.floor(Math.random()*arr.length)] }

function format(n){
  if(n === null || Number.isNaN(n)) return '—';
  if(!isFinite(n)) return n>0? '∞' : '-∞';
  return rounded ? Number(n.toFixed(0)).toString() : n.toString();
}

function vibeFor(n){
  if(n === null || !isFinite(n)) return '–';
  const mag = Math.abs(n);
  if(mag === 0) return 'zero';
  if(mag < 0.01) return 'tiny';
  if(mag > 1e6) return 'big';
  return 'ok';
}

function speak(type){
  const pack = isMelody ? quips.melody : quips.kuromi;
  const text = pick(pack[type] || pack.ok);
  voice.innerHTML = isMelody 
    ? `“<em>${text}</em>” ` 
    : `“<em>${text}</em>” 😈`;
}

function pushHistory(op, inputVal, outputVal){
  const chip = document.createElement('div');
  chip.className = 'chip';
  chip.innerHTML = `<span>${op}(${inputVal})</span><strong>${outputVal}</strong>`;
  historyEl.prepend(chip);
  while(historyEl.children.length > 12){ historyEl.lastChild.remove(); }
}

function calc(op){
  const val = parseFloat(input.value);
  if(Number.isNaN(val)){
    resultEl.textContent = '—';
    tag.textContent = 'invalid';
    speak('invalid');
    input.classList.add('shake');
    setTimeout(()=>input.classList.remove('shake'), 240);
    return;
  }
  let res = null; let label = '';
  switch(op){
    case 'square': res = val*val; label='square'; break;
    case 'cube': res = val*val*val; label='cube'; break;
    case 'sqrt':
      if(val < 0){
        res = NaN;
        resultEl.textContent = 'No real root';
        tag.textContent = 'neg';
        speak('sqrtNeg');
        pushHistory('√', val, 'No real root');
        return;
      } else { res = Math.sqrt(val); label='root'; }
      break;
    case 'clear':
      input.value = '';
      lastResult = null;
      resultEl.textContent = '—';
      tag.textContent = '–';
      voice.textContent = isMelody ? famousMelody : famousKuromi;
      return;
    case 'rnd':
      const r = (Math.random()*200 - 100).toFixed(3);
      input.value = r;
      return;
  }
  lastResult = res;
  resultEl.textContent = format(res);
  const vibe = vibeFor(res);
  tag.textContent = vibe;
  speak(vibe);
  pushHistory(label==='root' ? '√' : (label==='square'?'x²':'x³'), val, format(res));
}

// Event bindings
document.querySelectorAll('button[data-op]').forEach(btn=>{
  btn.addEventListener('click', ()=> calc(btn.dataset.op));
});

// Keyboard shortcuts
window.addEventListener('keydown', (e)=>{
  if(e.key.toLowerCase() === 's') calc('square');
  if(e.key.toLowerCase() === 'c') calc('cube');
  if(e.key.toLowerCase() === 'r') calc('sqrt');
  if(e.key === 'Escape') calc('clear');
});

// Copy result
copyBtn.addEventListener('click', async ()=>{
  if(lastResult === null){ return; }
  try{
    await navigator.clipboard.writeText(format(lastResult));
    voice.innerHTML = isMelody
      ? '“<em>Copied with sweetness!</em>” 🌸'
      : '“<em>Copied. Use it wisely.</em>” 😈';
  }catch{
    voice.innerHTML = isMelody
      ? '“<em>Clipboard didn’t like us…</em>” 🌸'
      : '“<em>Clipboard said no. Rude.</em>” 😈';
  }
});

// Toggle rounding
roundBtn.addEventListener('click', ()=>{
  rounded = !rounded;   
  roundBtn.textContent = rounded ? 'Full' : 'Round';
  if(lastResult !== null){ resultEl.textContent = format(lastResult); }
});

// Theme switch Kuromi ↔ Melody
themeSwitch.addEventListener('click', ()=>{
  isMelody = !isMelody;
  switchEl.classList.toggle('active', isMelody);
  document.body.classList.toggle('melody-theme', isMelody);
  document.body.classList.toggle('kuromi-theme', !isMelody);

  if(isMelody){
    themeLabel.textContent = "Melody";
    appTitle.textContent = "Melody’s Sweet Calculator";
    appTagline.textContent = "Squares, cubes & roots — but make it cute.";
    inputLabel.textContent = "Sweet Math";
    historyTitle.textContent = "Sweet Moments 🎀";
    voice.textContent = famousMelody;
  } else {
    themeLabel.textContent = "Kuromi";
    appTitle.textContent = "Kuromi’s Chaos Calculator";
    appTagline.textContent = "Squares, cubes & roots — served with sarcasm.";
    inputLabel.textContent = "Math Chaos";
    historyTitle.textContent = "My Mischief List 💀";
    voice.textContent = famousKuromi;
  }
});

// Clear history
clearHistoryBtn.addEventListener('click', () => {
  historyEl.innerHTML = '';
  voice.innerHTML = isMelody
    ? '“<em>All clean and sparkly now!</em>”'
    : '“<em>Receipts? What receipts?</em>” 😈';
});

// Focus input on load
setTimeout(()=> input.focus(), 200);

// Prevent scroll on number input
input.addEventListener('wheel', e => e.target.blur());