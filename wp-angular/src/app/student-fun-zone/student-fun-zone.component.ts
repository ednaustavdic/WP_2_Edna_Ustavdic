import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-fun-zone',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sfz-container" style="padding:20px; text-align:center;">
      <div class="sfz-menu" style="display:flex;gap:24px;justify-content:center;align-items:center;flex-wrap:wrap;margin:8px 0 22px 0;">
        <div *ngFor="let g of games" style="width:140px;text-align:center;">
          <button type="button" (click)="openGame(g.path)" style="border:none;background:transparent;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center;width:120px;height:120px;border-radius:12px;background:#0f172a;color:#fff;font-weight:700;box-shadow:0 8px 20px rgba(0,0,0,0.12);">
            <span style="text-align:center;">{{g.label}}</span>
          </button>
        </div>
      </div>

      <div id="gameWrapper" style="width:100%;max-width:1200px;margin:0 auto;">
        <div id="frameContainer" style="display:none;margin-top:12px;border:2px solid #667eea;border-radius:8px;padding:12px;">
          <button (click)="closeGame()" style="background:#764ba2;color:white;border:none;padding:8px 12px;border-radius:6px;">Zatvori igru</button>
          <iframe id="gameFrame" style="width:100%;height:720px;border:none;border-radius:8px;margin-top:8px"></iframe>
        </div>
      </div>
    </div>
  `
})
export class StudentFunZoneComponent {
  games = [
    { label: 'Bingo', path: '/assets/student-fun-zone/indexBingo.html' },
    { label: 'Kviz', path: '/assets/student-fun-zone/indexKviz.html' },
    { label: 'Whiteboard', path: '/assets/student-fun-zone/indexInteractiveWhiteboard.html' },
    { label: 'Vision Board', path: '/assets/student-fun-zone/indexVisionBoard.html' },
    { label: 'Kanban', path: '/assets/student-fun-zone/indexKanban.html' }
  ];
  openGame(path: string){
    const frame = document.getElementById('gameFrame') as HTMLIFrameElement | null;
    const container = document.getElementById('frameContainer');
    const url = path.startsWith('/') ? path : '/' + path;
    const finalUrl = url + ((location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? ((url.includes('?')? '&v=' : '?v=') + Date.now()) : '');
    console.log('StudentFunZone: opening', finalUrl);
    if(frame && container){
      container.style.display = 'block';
      frame.onload = () => { console.log('StudentFunZone: iframe loaded', finalUrl); };
      frame.onerror = () => { console.error('StudentFunZone: iframe failed to load', finalUrl); frame.src = ''; alert('Ne mogu učitati igru — provjerite mrežu i dostupnost datoteka.'); };
      frame.src = finalUrl;
      try{ container.scrollIntoView({behavior:'smooth', block:'start'} as any); }catch(e){}
    } else {
      window.open(finalUrl, '_blank');
    }
  }
  closeGame(){
    const frame = document.getElementById('gameFrame') as HTMLIFrameElement | null;
    const container = document.getElementById('frameContainer');
    if(frame){ frame.src = ''; }
    if(container) container.style.display = 'none';
  }
}
