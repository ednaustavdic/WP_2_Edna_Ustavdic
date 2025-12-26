
const modal = document.getElementById("taskModal");
const taskInput = document.getElementById("taskInput");
const savePdfBtn = document.getElementById("savePdfBtn");
const sendEmailBtn = document.getElementById("sendEmailBtn");
const emailModal = document.getElementById("emailModal");
const emailInput = document.getElementById("emailInput");
const emailSendBtn = document.getElementById("emailSendBtn");
const emailCancelBtn = document.getElementById("emailCancelBtn");

document.getElementById("addTaskBtn").addEventListener("click", () => {
    modal.style.display = "flex";
    taskInput.value = "";
    taskInput.focus();
});


document.getElementById("modalAdd").addEventListener("click", () => {
    let text = taskInput.value.trim();
    if (text === "") return;

    const task = createTask(text);
    document.querySelector('[data-status="todo"] .taskList').appendChild(task);

    modal.style.display = "none";
});

document.getElementById("modalCancel").addEventListener("click", () => {
    modal.style.display = "none";
});



function createTask(text) {
    const task = document.createElement("div");
    task.classList.add("task");
    task.textContent = text;

    task.draggable = true;

    task.addEventListener("dragstart", () => {
        task.classList.add("dragging");
    });

    task.addEventListener("dragend", () => {
        task.classList.remove("dragging");
    });

    return task;
}


document.querySelectorAll(".taskList").forEach(list => {
    list.addEventListener("dragover", e => {
        e.preventDefault();
        const dragging = document.querySelector(".dragging");
        list.appendChild(dragging);
    });
});


const clearModal = document.getElementById("clearModal");

document.getElementById("clearBoardBtn").addEventListener("click", () => {
    clearModal.style.display = "flex";
});


document.getElementById("clearYes").addEventListener("click", () => {
    document.querySelectorAll(".taskList").forEach(list => list.innerHTML = "");
    clearModal.style.display = "none";
});


document.getElementById("clearNo").addEventListener("click", () => {
    clearModal.style.display = "none";
});


window.addEventListener("click", e => {
    if (e.target === clearModal) {
        clearModal.style.display = "none";
    }
});

document.getElementById("saveBoardBtn").addEventListener("click", () => {
    html2canvas(document.body).then(canvas => {
        const link = document.createElement("a");
        link.download = "kanban_board.png";
        link.href = canvas.toDataURL();
        link.click();
    });
});

window.addEventListener("click", e => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});


savePdfBtn.addEventListener('click', ()=>{
    html2canvas(document.querySelector('.board'), { scale: 2, allowTaint: true, useCORS: true }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const element = document.createElement('div');
        element.innerHTML = '<img src="' + imgData + '" style="width:100%;">';
        const opt = { margin: 10, filename: 'kanban_board.pdf', image: { type: 'png', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }};
        html2pdf().set(opt).from(element).save();
    });
});


sendEmailBtn.addEventListener('click', ()=>{
    emailModal.style.display = 'flex';
    emailInput.value = '';
    emailInput.focus();
});

emailCancelBtn.addEventListener('click', ()=>{
    emailModal.style.display = 'none';
});


emailSendBtn.addEventListener('click', ()=>{
    const email = emailInput.value.trim();
    if(!email || !email.includes('@')) { alert('Unesite važeću email adresu'); return; }
    

    html2canvas(document.querySelector('.board'), { scale: 2, allowTaint: true, useCORS: true }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imgData;
        link.download = 'kanban_board.png';
        link.click();
        
       
        const subject = encodeURIComponent('Moja Kanban Ploča');
        const body = encodeURIComponent('Pogledajte moju kanban ploču! Slika je preuzeta odvojeno.');
        window.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + body;
        emailModal.style.display = 'none';
    });
});

window.addEventListener('click', (e)=>{ if(e.target === emailModal) emailModal.style.display = 'none'; });
