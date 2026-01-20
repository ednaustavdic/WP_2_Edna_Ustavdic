import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Firestore, doc, setDoc, docData } from '@angular/fire/firestore';
import { firstValueFrom, Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  sub: Subscription | undefined;

  constructor(private auth: AuthService, private firestore: Firestore) {
    const stored = localStorage.getItem('theme');
    const color = localStorage.getItem('primaryColor');
    if (stored) this.applyTheme(stored, color || undefined);

    this.sub = this.auth.user$.subscribe(user => {
      if (!user) return;
      const uRef = doc(this.firestore, 'users', user.uid);
      docData(uRef).subscribe((d: any) => {
        const pref = d?.preferences || {};
        if (pref.theme) this.applyTheme(pref.theme, pref.primaryColor);
      });
    });
  }

  dispose() {
    this.sub?.unsubscribe();
  }

  applyTheme(theme: string, primaryColor?: string) {
    if (theme === 'dark') {
      document.documentElement.classList.add('theme-dark');
      document.documentElement.classList.remove('theme-light');
    } else {
      document.documentElement.classList.remove('theme-dark');
      document.documentElement.classList.add('theme-light');
    }

    if (theme === 'surprise') {
      if (!primaryColor) {
        primaryColor = localStorage.getItem('primaryColor') || this.randomColor();
      }
    }

    if (primaryColor) {
      document.documentElement.style.setProperty('--primary', primaryColor);
      document.documentElement.style.setProperty('--primary-contrast', this.contrastColor(primaryColor));
      localStorage.setItem('primaryColor', primaryColor);
    }

    if (theme === 'dark') {
      document.documentElement.style.setProperty('--bg', 'linear-gradient(180deg,#071026 0%, #081426 100%)');
      document.documentElement.style.setProperty('--card-bg', '#0f1720');
      document.documentElement.style.setProperty('--text', '#e6eef8');
      document.documentElement.style.setProperty('--primary-contrast', document.documentElement.style.getPropertyValue('--primary-contrast') || '#fff');
    } else {
      document.documentElement.style.setProperty('--bg', 'linear-gradient(135deg, rgba(250,250,255,0.6), rgba(240,245,255,0.9))');
      document.documentElement.style.setProperty('--card-bg', 'rgba(255,255,255,0.95)');
      document.documentElement.style.setProperty('--text', '#17202a');
      document.documentElement.style.setProperty('--primary-contrast', document.documentElement.style.getPropertyValue('--primary-contrast') || '#fff');
    }

    localStorage.setItem('theme', theme);

    console.log('[ThemeService] applyTheme applied', { theme, primaryColor, classList: Array.from(document.documentElement.classList), primary: getComputedStyle(document.documentElement).getPropertyValue('--primary'), cardBg: getComputedStyle(document.documentElement).getPropertyValue('--card-bg') });
  }

  async setThemeForUser(theme: string) {
    localStorage.setItem('theme', theme);
    const user = await firstValueFrom(this.auth.user$);
    if (!user) return;
    const uRef = doc(this.firestore, 'users', user.uid);
    await setDoc(uRef, { preferences: { theme } }, { merge: true });
  }

  async setPrimaryColorForUser(color: string) {
    document.documentElement.style.setProperty('--primary', color);
    document.documentElement.style.setProperty('--primary-contrast', this.contrastColor(color));
    localStorage.setItem('primaryColor', color);
    const user = await firstValueFrom(this.auth.user$);
    if (!user) return;
    const uRef = doc(this.firestore, 'users', user.uid);
    await setDoc(uRef, { preferences: { primaryColor: color } }, { merge: true });
  }

  toggleDark() {
    const cur = localStorage.getItem('theme') || 'light';
    const next = cur === 'dark' ? 'light' : 'dark';
    console.log('[ThemeService] toggleDark:', { cur, next });
    this.applyTheme(next, localStorage.getItem('primaryColor') || undefined);
    this.setThemeForUser(next).catch((e) => { console.warn('setThemeForUser failed', e); });
  }

  surpriseMe() {
    const color = this.randomColor();
    this.applyTheme('surprise', color);
    this.setThemeForUser('surprise').catch(() => {});
    this.setPrimaryColorForUser(color).catch(() => {});
  }

  randomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
    return color;
  }

  contrastColor(hex: string) {
    const c = hex.replace('#','');
    const r = parseInt(c.substr(0,2),16);
    const g = parseInt(c.substr(2,2),16);
    const b = parseInt(c.substr(4,2),16);
    const lum = (0.299*r + 0.587*g + 0.114*b)/255;
    return lum > 0.6 ? '#000' : '#fff';
  }
}
