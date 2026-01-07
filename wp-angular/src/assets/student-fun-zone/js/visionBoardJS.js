

document.addEventListener('DOMContentLoaded', ()=>{
  const board = document.getElementById("board");
  const addNoteBtn = document.getElementById("addNoteBtn");
  const addImageBtn = document.getElementById("addImageBtn");
  const addQuoteBtn = document.getElementById("addQuoteBtn");
  const saveBtn = document.getElementById("saveBtn");
  const clearBtn = document.getElementById("clearBtn");
  const savePdfBtn = document.getElementById("savePdfBtn");

  if(!board){ console.warn('visionBoardJS: board element not found'); return; }


const colors = ["color1", "color2", "color3", "color4", "color5", "color6"];


const sampleImages = [
  "/assets/student-fun-zone/slike/slika1.png",
  "/assets/student-fun-zone/slike/slika2.png",
  "/assets/student-fun-zone/slike/slika3.png",
  "/assets/student-fun-zone/slike/slika4.png"
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


});
