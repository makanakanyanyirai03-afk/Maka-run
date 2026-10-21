const emojis = ['🚀','🎮','🔥','💎','🌈','⚡','🎯','🍕','🎧','🦄','👾','🤖','🍦','🌟','💡','🎲'];
let cards=[], flipped=[], matched=0, moves=0, timer=0, timerInterval=null, resolutionTimeout=null, started=false, resolving=false;
const board=document.getElementById('board'), movesEl=document.getElementById('moves'), timerEl=document.getElementById('timer'), bestEl=document.getElementById('best'), winModal=document.getElementById('win-modal');
const difficultyEl=document.getElementById('difficulty');
function bestKey(){return `memory-flip-best-${difficultyEl.value}`;}
function renderBest(){
  const best=localStorage.getItem(bestKey());
  bestEl.textContent=best ? `${best.split(',')[0]} moves · ${best.split(',')[1]}` : '--';
}
function initGame(){
  const diff=difficultyEl.value;
  let pairCount=8; let cls='board medium';
  if(diff==='easy'){pairCount=6; cls='board easy';}
  if(diff==='hard'){pairCount=12; cls='board hard';}
  board.className=cls;
  const selected=emojis.slice(0,pairCount);
  cards=[...selected,...selected].sort(()=>Math.random()-0.5);
  board.innerHTML=''; flipped=[]; matched=0; moves=0; timer=0; started=false; resolving=false;
  clearInterval(timerInterval); clearTimeout(resolutionTimeout);
  movesEl.textContent='0'; timerEl.textContent='00:00'; winModal.classList.add('hidden');
  renderBest();
  cards.forEach((emoji)=>{
    const card=document.createElement('div'); card.className='card'; card.dataset.value=emoji;
    card.innerHTML=`<span>${emoji}</span><div class="back">?</div>`;
    card.addEventListener('click',()=>flipCard(card)); board.appendChild(card);
  });
}
function flipCard (card){
  if(resolving||flipped.length>=2||card.classList.contains('flipped')||card.classList.contains('matched'))return;
  if(!started){started=true; timerInterval=setInterval(()=>{timer++; const m=String(Math.floor(timer/60)).padStart(2,'0'); const s=String(timer%60).padStart(2,'0'); timerEl.textContent=`${m}:${s}`;},1000);}
  card.classList.add('flipped'); flipped.push(card);
  if(flipped.length===2){moves++; movesEl.textContent=moves; checkMatch();}
}
function checkMatch(){
  resolving=true;
  const [a,b]=flipped;
  if(a.dataset.value===b.dataset.value){resolutionTimeout=setTimeout(()=>{a.classList.add('matched'); b.classList.add('matched'); matched+=2; flipped=[]; resolving=false; if(matched===cards.length)winGame();},400);}
  else{resolutionTimeout=setTimeout(()=>{a.classList.remove('flipped'); b.classList.remove('flipped'); flipped=[]; resolving=false;},800);}
}
function winGame(){
  clearInterval(timerInterval);
  const previous=localStorage.getItem(bestKey());
  const [previousMoves,previousTime]=previous ? previous.split(',') : [];
  if(!previousMoves||moves<Number(previousMoves)||(moves===Number(previousMoves)&&timer<timeToSeconds(previousTime))){
    localStorage.setItem(bestKey(),`${moves},${timerEl.textContent}`);
    renderBest();
  }
  document.getElementById('final-moves').textContent=moves;
  document.getElementById('final-time').textContent=timerEl.textContent;
  winModal.classList.remove('hidden');
}
function timeToSeconds(value){const [minutes,seconds]=value.split(':').map(Number);return minutes*60+seconds;}
document.getElementById('restart-btn').addEventListener('click',initGame);
document.getElementById('play-again').addEventListener('click',initGame);
difficultyEl.addEventListener('change',initGame);
initGame();