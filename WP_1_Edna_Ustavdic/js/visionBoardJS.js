


const board = document.getElementById("board");
const addNoteBtn = document.getElementById("addNoteBtn");
const addImageBtn = document.getElementById("addImageBtn");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");
const savePdfBtn = document.getElementById("savePdfBtn");
const sendEmailBtn = document.getElementById("sendEmailBtn");
const emailModal = document.getElementById("emailModal");
const emailInput = document.getElementById("emailInput");
const emailSendBtn = document.getElementById("emailSendBtn");
const emailCancelBtn = document.getElementById("emailCancelBtn");


const colors = ["color1", "color2", "color3", "color4", "color5", "color6"];


const sampleImages = [
  "../slike/slika1.png",
  "../slike/slika2.png",
  "../slike/slika3.png",
  "../slike/slika4.png"
];

const sampleQuotes = [
  "Svaka dovoljno napredna tehnologija jednaka je magiji. - “Arthur C. Clarke ",
  "Tehnologija je riječ koja opisuje nešto što još ne funkcionira. - Douglas Adams",
  "Ne osnivate zajednice. Zajednice već postoje. Pitanje koje treba postaviti je kako im možete pomoći da budu bolje. - “ Mark Zuckerberg"
];


function makeDraggable(el) {
  let offsetX, offsetY;


  const delBtn = document.createElement("button");
  delBtn.textContent = "X";
  delBtn.className = "delete-btn";
  el.appendChild(delBtn);


  delBtn.addEventListener("click", (e) => {
    e.stopPropagation(); 
    el.remove();
  });


  el.addEventListener("mousedown", dragStart);

  function dragStart(e) {
    if (e.target === delBtn) return; 
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", dragEnd);
  }

  function drag(e) {
    e.preventDefault();
    el.style.left = e.clientX - offsetX + "px";
    el.style.top = e.clientY - offsetY + "px";
  }

  function dragEnd() {
    document.removeEventListener("mousemove", drag);
    document.removeEventListener("mouseup", dragEnd);
  }
}


addNoteBtn.addEventListener("click", () => {
  const note = document.createElement("div");
  note.className = "note " + colors[Math.floor(Math.random() * colors.length)];
  note.contentEditable = "true";
  note.style.left = Math.random() * 500 + "px";
  note.style.top = Math.random() * 300 + "px";
  note.textContent = "Napiši nešto..";
  makeDraggable(note);
  board.appendChild(note);
});


addImageBtn.addEventListener("click", () => {
  const div = document.createElement("div");
  div.className = "pinned-img";
  div.style.left = Math.random() * 400 + "px";
  div.style.top = Math.random() * 250 + "px";
  const img = document.createElement("img");
  const imagePath = sampleImages[Math.floor(Math.random() * sampleImages.length)];
  img.src = imagePath;
  img.onerror = () => {
    console.error("Failed to load image:", imagePath);
    div.textContent = "Slika nije pronađena: " + imagePath;
  };
  div.appendChild(img);
  makeDraggable(div);
  board.appendChild(div);
});


addQuoteBtn.addEventListener("click", () => {
  const q = document.createElement("div");
  q.className = "quote";
  q.textContent = sampleQuotes[Math.floor(Math.random() * sampleQuotes.length)];
  q.style.left = Math.random() * 400 + "px";
  q.style.top = Math.random() * 250 + "px";
  q.contentEditable = "true";
  makeDraggable(q);
  board.appendChild(q);
});


saveBtn.addEventListener("click", saveBoard);

function saveBoard() {
  const items = [];
  document.querySelectorAll("#board > div").forEach((el) => {
    const data = {
      type: el.classList.contains("note")
        ? "note"
        : el.classList.contains("quote")
        ? "quote"
        : "image",
      className: el.className,
      html: el.innerHTML,
      left: el.style.left,
      top: el.style.top,
    };
    items.push(data);
  });
  localStorage.setItem("visionBoardItems", JSON.stringify(items));
  alert("Board saved!");
}


function loadBoard() {
  const data = localStorage.getItem("visionBoardItems");
  if (!data) return;
  const items = JSON.parse(data);
  items.forEach((item) => {
    const div = document.createElement("div");
    div.className = item.className;
    div.style.left = item.left;
    div.style.top = item.top;
    div.innerHTML = item.html;
    if (item.type !== "image") div.contentEditable = "true";
    makeDraggable(div);
    board.appendChild(div);
  });
}
loadBoard();


clearBtn.addEventListener("click", () => {
  if (confirm("Clear the board?")) {
    board.innerHTML = "";
    localStorage.removeItem("visionBoardItems");
  }
});


savePdfBtn.addEventListener('click', ()=>{
    html2canvas(document.getElementById('board'), { scale: 2, allowTaint: true, useCORS: true }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const element = document.createElement('div');
        element.innerHTML = '<img src="' + imgData + '" style="width:100%;">';
        const opt = { margin: 10, filename: 'vision_board.pdf', image: { type: 'png', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }};
        html2pdf().set(opt).from(element).save();
    });
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
    

    html2canvas(document.getElementById('board'), { scale: 2, allowTaint: true, useCORS: true }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imgData;
        link.download = 'vision_board.png';
        link.click();
        
        const subject = encodeURIComponent('Vision Board');
        const body = encodeURIComponent('Vision board (Slika je preuzeta odvojeno).');
        window.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + body;
        emailModal.style.display = 'none';
    });
});


window.addEventListener('click', (e)=>{ if(e.target === emailModal) emailModal.style.display = 'none'; });