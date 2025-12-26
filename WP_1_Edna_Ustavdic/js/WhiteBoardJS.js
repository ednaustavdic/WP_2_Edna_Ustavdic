
const board = document.getElementById('board');
const fg = board.getContext('2d');
const imageLayer = document.getElementById('imageLayer');
const imgCtx = imageLayer.getContext('2d');
const bgColorCanvas = document.getElementById('bgColor');
const bgCtx = bgColorCanvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');
const toolSelect = document.getElementById('toolSelect');
const imageSelect = document.getElementById('imageSelect');
const imageUpload = document.getElementById('imageUpload');
const undoBtn = document.getElementById('undoBtn');
const savePdfBtn = document.getElementById('savePdfBtn');
const sendEmailBtn = document.getElementById('sendEmailBtn');
const emailModal = document.getElementById('emailModal');
const emailInput = document.getElementById('emailInput');
const emailSendBtn = document.getElementById('emailSendBtn');
const emailCancelBtn = document.getElementById('emailCancelBtn');

let drawing = false;
let currentColor = colorPicker.value;
let currentTool = 'pencil';
let isErasing = false;
let lastPos = {x:0,y:0};
let undoStack = [];
const MAX_UNDO = 10;

function customCursor(){
    const canvas = board;

    canvas.classList.remove(
        "cursor-pencil",    
        "cursor-eraser",
        "cursor-marker",
        "cursor-spray",
        "cursor-bucket"

    );
    canvas.classList.add("cursor-" + currentTool);
};




function resizeCanvases(w=900,h=500){
    [board, imageLayer, bgColorCanvas].forEach(c=>{
        c.width = w; c.height = h;
        c.style.width = '100%';
    });
}
resizeCanvases();

function pushUndo(){
    try{
        if(undoStack.length>=MAX_UNDO) undoStack.shift();
        undoStack.push(board.toDataURL());
    }catch(e){}
}


function getPos(e, canvas){
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY};
}

const audioCtx = window.AudioContext ? new AudioContext() : (window.webkitAudioContext ? new webkitAudioContext() : null);
function playPencilSound(){
    if(!audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine'; o.frequency.value = 1200;
    g.gain.value = 0.02;
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + 0.05);
}
function playSpongeSound(){
    if(!audioCtx) return;
    const bufferSize = 2 * audioCtx.sampleRate;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<bufferSize;i++) data[i] = (Math.random()*2-1) * Math.exp(-i/2000);
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer; noise.connect(audioCtx.destination); noise.start();
}


toolSelect.addEventListener('change', (e)=>{
     currentTool = e.target.value;
     customCursor();
    });
     





function startDrawing(e){
    drawing = true;
    lastPos = getPos(e, board);
    pushUndo();
    if(currentTool === 'pencil') playPencilSound();
    if(currentTool === 'eraser') playSpongeSound();
}

function endDraw(){
    drawing = false;
    fg.beginPath();
}

function draw(e){
    if(!drawing) return;
    const p = getPos(e, board);
    const size = parseInt(brushSize.value,10) || 4;
    fg.lineJoin = fg.lineCap = 'round';

    if(currentTool === 'spray'){
        for(let i=0;i<25;i++){
            const angle = Math.random()*Math.PI*2;
            const r = Math.random()*size;
            const x = p.x + Math.cos(angle)*r;
            const y = p.y + Math.sin(angle)*r;
            fg.fillStyle = currentColor;
            fg.globalAlpha = 0.3;
            fg.fillRect(x,y,1,1);
        }
        fg.globalAlpha = 1;
        return;
    }

    if(currentTool === 'eraser'){
        fg.globalCompositeOperation = 'destination-out';
        fg.strokeStyle = 'rgba(0,0,0,1)';
        fg.lineWidth = size*2;
    } else if(currentTool === 'marker'){
        fg.globalCompositeOperation = 'source-over';
        fg.strokeStyle = currentColor;
        fg.globalAlpha = 0.6;
        fg.lineWidth = size*1.5;
    } else { 
        fg.globalCompositeOperation = 'source-over';
        fg.strokeStyle = currentColor;
        fg.globalAlpha = 1;
        fg.lineWidth = size;
    }

    fg.beginPath();
    fg.moveTo(lastPos.x, lastPos.y);
    fg.lineTo(p.x, p.y);
    fg.stroke();
    fg.closePath();
    lastPos = p;
}


board.addEventListener('mousedown', (e)=>{
    if(currentTool === 'bucket'){
        const color = colorPicker.value;
        bgCtx.fillStyle = color;
        bgCtx.fillRect(0,0,bgColorCanvas.width,bgColorCanvas.height);
        return;
    }
    startDrawing(e);
});
board.addEventListener('mouseup', endDraw);
board.addEventListener('mouseout', endDraw);
board.addEventListener('mousemove', draw);
board.addEventListener('touchstart', (e)=>{ board.dispatchEvent(new MouseEvent('mousedown', {clientX: e.touches[0].clientX, clientY: e.touches[0].clientY})); e.preventDefault(); });
board.addEventListener('touchmove', (e)=>{ board.dispatchEvent(new MouseEvent('mousemove', {clientX: e.touches[0].clientX, clientY: e.touches[0].clientY})); e.preventDefault(); });
board.addEventListener('touchend', (e)=>{ board.dispatchEvent(new MouseEvent('mouseup')); e.preventDefault(); });


colorPicker.addEventListener('input', ()=>{ currentColor = colorPicker.value; });
brushSize.addEventListener('input', ()=>{});
clearBtn.addEventListener('click', ()=>{
    bgCtx.fillStyle = '#ffffff';
    bgCtx.fillRect(0,0,bgColorCanvas.width,bgColorCanvas.height);
    imgCtx.clearRect(0,0,imageLayer.width,imageLayer.height);
    fg.clearRect(0,0,board.width,board.height);
    undoStack = [];
});

undoBtn.addEventListener('click', ()=>{
    if(undoStack.length===0) return;
    const data = undoStack.pop();
    const img = new Image(); img.onload = ()=>{ fg.clearRect(0,0,board.width,board.height); fg.drawImage(img,0,0); };
    img.src = data;
});

function loadImageToLayer(src){
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = ()=>{
        console.log('WhiteBoard: image loaded ->', src);
        imgCtx.clearRect(0,0,imageLayer.width,imageLayer.height);
        const ratio = Math.min(imageLayer.width/img.width, imageLayer.height/img.height);
        const w = img.width * ratio; const h = img.height * ratio;
        const x = (imageLayer.width - w)/2; const y = (imageLayer.height - h)/2;
        imgCtx.drawImage(img, x, y, w, h);
        try{ if(src && src.startsWith && src.startsWith('blob:')) URL.revokeObjectURL(src); }catch(e){}
    };
    img.onerror = (err)=>{
        console.warn('WhiteBoard: image failed to load with crossOrigin, retrying without CORS ->', src, err);
        const img2 = new Image();
        img2.onload = ()=>{
            console.log('WhiteBoard: image loaded (fallback) ->', src);
            imgCtx.clearRect(0,0,imageLayer.width,imageLayer.height);
            const ratio = Math.min(imageLayer.width/img2.width, imageLayer.height/img2.height);
            const w = img2.width * ratio; const h = img2.height * ratio;
            const x = (imageLayer.width - w)/2; const y = (imageLayer.height - h)/2;
            imgCtx.drawImage(img2, x, y, w, h);
            try{ if(src && src.startsWith && src.startsWith('blob:')) URL.revokeObjectURL(src); }catch(e){}
        };
        img2.onerror = (e2)=>{ console.error('WhiteBoard: image failed to load (fallback) ->', src, e2); };
        img2.src = src;
    };
    img.src = src;
}

imageSelect.addEventListener('change',(e)=>{ const v=e.target.value; if(v) loadImageToLayer(v); });
imageUpload.addEventListener('change',(e)=>{
    const f = e.target.files && e.target.files[0]; if(!f) return;
    const url = URL.createObjectURL(f);
    loadImageToLayer(url);
});

saveBtn.addEventListener('click', ()=>{
    const merge = document.createElement('canvas');
    merge.width = board.width; merge.height = board.height;
    const mctx = merge.getContext('2d');
    mctx.drawImage(bgColorCanvas,0,0);
    mctx.drawImage(imageLayer,0,0);
    mctx.drawImage(board,0,0);
    const data = merge.toDataURL('image/png');
    const link = document.createElement('a'); link.href = data; link.download = 'whiteboard.png'; link.click();
});

bgCtx.fillStyle = '#ffffff'; bgCtx.fillRect(0,0,bgColorCanvas.width,bgColorCanvas.height);

savePdfBtn.addEventListener('click', ()=>{
    const merge = document.createElement('canvas');
    merge.width = board.width; merge.height = board.height;
    const mctx = merge.getContext('2d');
    mctx.drawImage(bgColorCanvas,0,0);
    mctx.drawImage(imageLayer,0,0);
    mctx.drawImage(board,0,0);
    
    const imgData = merge.toDataURL('image/png');
    const element = document.createElement('div');
    element.innerHTML = '<img src="' + imgData + '" style="width:100%; max-width:900px;">';
    
    const opt = { margin: 10, filename: 'whiteboard.pdf', image: { type: 'png', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }};
    html2pdf().set(opt).from(element).save();
});

sendEmailBtn.addEventListener('click', ()=>{
    emailModal.style.display = 'block';
    emailInput.value = '';
    emailInput.focus();
});

emailCancelBtn.addEventListener('click', ()=>{
    emailModal.style.display = 'none';
});

emailSendBtn.addEventListener('click', ()=>{
    const email = emailInput.value.trim();
    if(!email || !email.includes('@')) { alert('Unesite važeću email adresu'); return; }
    
    const merge = document.createElement('canvas');
    merge.width = board.width; merge.height = board.height;
    const mctx = merge.getContext('2d');
    mctx.drawImage(bgColorCanvas,0,0);
    mctx.drawImage(imageLayer,0,0);
    mctx.drawImage(board,0,0);
    const imgData = merge.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imgData;
    link.download = 'whiteboard.png';
    link.click();
    
    const subject = encodeURIComponent('Moj Whiteboard');
    const body = encodeURIComponent('Pogledajte moj whiteboard crtež! Slika je preuzeta odvojeno.');
    window.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + body;
    emailModal.style.display = 'none';
});

window.addEventListener('click', (e)=>{ if(e.target === emailModal) emailModal.style.display = 'none'; });