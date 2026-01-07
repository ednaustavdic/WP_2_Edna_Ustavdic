(function(){
    const startBtn = document.getElementById('startBtn');
    const numQuestions = document.getElementById('numQuestions');
    const quizContainer = document.getElementById('quizContainer');
    const quizFooter = document.getElementById('quizFooter');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const quizResult = document.getElementById('quizResult');

    let questions = [];
    let answers = {};
    let current = 0;

    const localQuestions = [
        { id: 'q1', question: 'HTML stands for?', options: ['HyperText Markup Language','Home Tool Markup','Hyperlink Markup Language','HighText Markup Language'], correct: ['a'] },
        { id: 'q2', question: 'CSS is used for?', options: ['Styling','Structure','Database','Scripting'], correct: ['a'] },
        { id: 'q3', question: 'Which tag is for a paragraph?', options: ['<p>','<div>','<span>','<para>'], correct: ['a'] }
    ];

    function fetchQuestions(n){
        return fetch(`/assets/student-fun-zone/api/get_questions.php?count=${n}`)
            .then(r=>{ if(!r.ok) throw new Error('Network error'); return r.json(); })
            .then(data=>{ if(data && data.questions) return data.questions; throw new Error('Invalid response'); })
            .catch(err=>{
                console.warn('KvizJS: API failed, falling back to local questions', err);
                return Promise.resolve(localQuestions.slice(0, n));
            });
    }

    function renderQuestion(i){
        const q = questions[i];
        if(!q) return;
        quizContainer.innerHTML = '';
        const card = document.createElement('div'); card.className = 'kviz-card';
        const h = document.createElement('h3'); h.textContent = `${i+1}. ${q.question}`;
        card.appendChild(h);

        const opts = document.createElement('div'); opts.className = 'kviz-options';
        
        const multi = (q.correct && q.correct.length > 1);
        q.options.forEach((opt, idx)=>{
            const id = `q_${q.id}_opt_${idx}`;
            const wrapper = document.createElement('label'); wrapper.className = 'kviz-option';
            const input = document.createElement('input');
            input.type = multi ? 'checkbox' : 'radio';
            input.name = `q_${q.id}`;
            input.value = String.fromCharCode(97 + idx);
            input.id = id;
           
            if(answers[q.id]){
                if(Array.isArray(answers[q.id]) && answers[q.id].includes(input.value)) input.checked = true;
                else if(answers[q.id] === input.value) input.checked = true;
            }
            wrapper.appendChild(input);
            const span = document.createElement('span'); span.textContent = ' ' + opt;
            wrapper.appendChild(span);
            opts.appendChild(wrapper);
        });

        card.appendChild(opts);
        quizContainer.appendChild(card);
        quizFooter.style.display = 'flex';
        quizResult.style.display = 'none';
    }

    function saveCurrentAnswer(){
        const q = questions[current]; if(!q) return;
        const inputs = document.querySelectorAll(`[name="q_${q.id}"]`);
        const selected = Array.from(inputs).filter(i=>i.checked).map(i=>i.value);
        if(selected.length === 0){ delete answers[q.id]; }
        else answers[q.id] = selected.length===1?selected[0]:selected;
    }

    function showResult(){
        let score = 0;
        questions.forEach(q=>{
            const correct = (q.correct || []).map(s=>s.trim());
            const user = answers[q.id] ? (Array.isArray(answers[q.id])?answers[q.id]:[answers[q.id]]) : [];
            user.sort(); correct.sort();
            if(user.length === correct.length && user.every((v,i)=>v===correct[i])) score++;
        });
        quizResult.style.display = 'block';
        quizResult.innerHTML = `<strong>Rezultat:</strong> ${score} / ${questions.length}`;
        quizFooter.style.display = 'none';
        const again = document.createElement('button'); again.textContent = 'Ponovo'; again.className = 'start-btn';
        again.addEventListener('click', ()=>{ location.reload(); });
        quizResult.appendChild(document.createElement('div')).appendChild(again);
    }

    startBtn.addEventListener('click', ()=>{
        const n = parseInt(numQuestions.value,10) || 10;
        startBtn.disabled = true; startBtn.textContent = 'Učitavanje...';
        fetchQuestions(n).then(list=>{
            if(list.length === 0){ quizContainer.innerHTML = '<p>API nije dostupan. Molim uvezite SQL u bazu i podesite `api/db.php`.</p>'; startBtn.disabled=false; startBtn.textContent='Pokreni kviz'; return; }
            questions = list; current = 0; answers = {};
            renderQuestion(0);
            startBtn.style.display = 'none';
        });
    });

    prevBtn.addEventListener('click', ()=>{ saveCurrentAnswer(); if(current>0){ current--; renderQuestion(current); } });
    nextBtn.addEventListener('click', ()=>{ saveCurrentAnswer(); if(current<questions.length-1){ current++; renderQuestion(current); } });
    submitBtn.addEventListener('click', ()=>{ saveCurrentAnswer(); showResult(); });

})();
