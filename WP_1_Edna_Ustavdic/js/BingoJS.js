
(function(){
  function generateUniqueNumbers(count, min=1, max=75){
    const set = new Set();
    while(set.size < count){
      const n = Math.floor(Math.random() * (max - min + 1)) + min;
      set.add(n);
    }
    return Array.from(set);
  }

  const TABLE = document.getElementById('bingoTable');
  const randomizeBtn = document.getElementById('randomizeBtn');
  const resetMarksBtn = document.getElementById('resetMarksBtn');
  const checkBtn = document.getElementById('checkBtn');
  const winsCountEl = document.getElementById('winsCount');
  const winnerModal = document.getElementById('winnerModal');
  const closeModal = document.getElementById('closeModal');
  const newRound = document.getElementById('newRound');

  if(!TABLE){
    console.warn('BingoJS: bingoTable not found - aborting.');
    return;
  }

  let hasWon = false;
  let autoCloseTimer = null;

  function createGrid(){
    TABLE.innerHTML = '';
    const numbers = generateUniqueNumbers(25,1,99);
    let idx = 0;
    for(let r=0;r<5;r++){
      const tr = document.createElement('tr');
      for(let c=0;c<5;c++){
        const td = document.createElement('td');
        td.textContent = numbers[idx++];
        td.dataset.r = r;
        td.dataset.c = c;
        td.className = 'bingo-cell';
        td.addEventListener('click', ()=>{
          td.classList.toggle('marked');
          if(!hasWon) checkBingo();
        });
        tr.appendChild(td);
      }
      TABLE.appendChild(tr);
    }
    hasWon = false;
  }

  function resetMarks(){
    TABLE.querySelectorAll('td.marked').forEach(td=>td.classList.remove('marked'));
    hasWon = false;
  }

  function checkBingo(){
    const cells = TABLE.querySelectorAll('td');
    const grid = Array.from({length:5},()=>Array(5).fill(false));
    cells.forEach(td=>{
      const r = parseInt(td.dataset.r,10), c = parseInt(td.dataset.c,10);
      grid[r][c] = td.classList.contains('marked');
    });

    function rowWin(r){ return grid[r].every(Boolean); }
    function colWin(c){ return grid.every(row=>row[c]); }
    function diagWin(){
      const d1 = [0,1,2,3,4].every(i=>grid[i][i]);
      const d2 = [0,1,2,3,4].every(i=>grid[i][4-i]);
      return d1 || d2;
    }

    let win = false;
    for(let i=0;i<5;i++){
      if(rowWin(i) || colWin(i)){ win=true; break; }
    }
    if(!win) win = diagWin();

    if(win && !hasWon){
      
      hasWon = true;
      const currentWins = Number(localStorage.getItem('bingoWins') || 0) + 1;
      localStorage.setItem('bingoWins', currentWins);
      if(winsCountEl) winsCountEl.textContent = currentWins;
      if(winnerModal){
        winnerModal.style.display = 'flex';
        winnerModal.classList.add('active');
      }
     
      if(autoCloseTimer) clearTimeout(autoCloseTimer);
      autoCloseTimer = setTimeout(()=>{
        if(winnerModal){ winnerModal.style.display='none'; winnerModal.classList.remove('active'); }
        createGrid(); resetMarks(); hasWon = false; autoCloseTimer = null;
      }, 3000);
    }
    
    console.log('Bingo: checkBingo -> grid:', grid, 'win:', win, 'hasWon:', hasWon);
    return win;
  }

  function loadWins(){ if(winsCountEl) winsCountEl.textContent = localStorage.getItem('bingoWins') || 0; }

  if(randomizeBtn) randomizeBtn.addEventListener('click', ()=>{ createGrid(); resetMarks(); });
  if(resetMarksBtn) resetMarksBtn.addEventListener('click', resetMarks);
  if(checkBtn) checkBtn.addEventListener('click', ()=>{ checkBingo(); });
  if(closeModal) closeModal.addEventListener('click', ()=>{ 
    if(winnerModal){ 
      winnerModal.style.display='none'; 
      winnerModal.classList.remove('active');
    }

    if(autoCloseTimer){ clearTimeout(autoCloseTimer); autoCloseTimer = null; }
    
    createGrid(); resetMarks(); hasWon = false;
  });
  if(newRound) newRound.addEventListener('click', ()=>{ createGrid(); resetMarks(); if(winnerModal){ winnerModal.style.display='none'; winnerModal.classList.remove('active'); } hasWon=false; });

  createGrid();
  loadWins();
})();
