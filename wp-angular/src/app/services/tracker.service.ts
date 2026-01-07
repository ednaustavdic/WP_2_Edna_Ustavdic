import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, docData, collection, updateDoc } from '@angular/fire/firestore';
import { collectionData, docData as afdDocData } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TrackerService {
  public useLocalOnly = true;

  constructor(private firestore: Firestore) {}

  setUseLocalOnly(v: boolean) { this.useLocalOnly = v; }

  getWeekId(date = new Date()): string {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2,'0')}`;
  }

  userDoc(uid: string) {
    return doc(this.firestore, 'users', uid);
  }

  userDocData(uid: string): Observable<any> {
    return docData(this.userDoc(uid));
  }

  async saveTrackerWeek(uid: string, key: string, weekId: string, data: any) {
    const userRef = this.userDoc(uid);
    const payload: any = {};
    payload[`${key}.${weekId}`] = data;
    await setDoc(userRef, payload, { merge: true });
  }

  async deleteTrackerDay(uid: string, key: string, weekId: string, dayIndex: number) {
    const userRef = this.userDoc(uid);
    const path = `${key}.${weekId}.days.${dayIndex}`;
    const payload: any = {};
    payload[path] = null;
    await setDoc(userRef, payload, { merge: true });
  }


  trackerWeekDocRef(uid: string, key: string, weekId: string) {
    return doc(collection(this.firestore, `users/${uid}/trackers/${key}/weeks`), weekId);
  }

  async saveTrackerWeekCollection(uid: string, key: string, weekId: string, data: any) {
    if (this.useLocalOnly) {
      this.saveTrackerWeekLocal(uid, key, weekId, data);
      return;
    }
    const weekRef = this.trackerWeekDocRef(uid, key, weekId);
    await setDoc(weekRef, data, { merge: true }).catch((e) => {
      console.warn('Firestore save failed, falling back to localStorage', e);
    });
    this.saveTrackerWeekLocal(uid, key, weekId, data);
  }


  async deleteTrackerDayCollection(uid: string, key: string, weekId: string, dayIndex: number) {
    if (this.useLocalOnly) {
      this.deleteTrackerDayLocal(uid, key, weekId, dayIndex);
      return;
    }
    const weekRef = this.trackerWeekDocRef(uid, key, weekId);
    const field = `days.${dayIndex}`;
    await updateDoc(weekRef, { [field]: null }).catch(async () => {
      await setDoc(weekRef, { days: { [dayIndex]: null } }, { merge: true });
    }).catch((e) => {
      console.warn('Firestore delete-day failed', e);
    });
    this.deleteTrackerDayLocal(uid, key, weekId, dayIndex);
  }

  trackerWeekData$(uid: string, key: string, weekId: string): Observable<any> {
    if (this.useLocalOnly) {
      return of(this.loadTrackerWeekLocal(uid, key, weekId));
    }
    const primaryRef = this.trackerWeekDocRef(uid, key, weekId);
    const fallback1 = doc(collection(this.firestore, `trackers/${uid}/${key}/weeks`), weekId);
    const fallback2 = doc(collection(this.firestore, `trackers/${key}/weeks`), weekId);

    return afdDocData(primaryRef).pipe(
      switchMap((doc: any) => {
        if (doc && Object.keys(doc).length) return of(doc);
        return afdDocData(fallback1);
      }),
      switchMap((doc: any) => {
        if (doc && Object.keys(doc).length) return of(doc);
        return afdDocData(fallback2);
      }),
      switchMap((doc: any) => {
        if (doc && Object.keys(doc).length) return of(doc);
        const local = this.loadTrackerWeekLocal(uid, key, weekId);
        return of(local);
      })
    );
  }

  trackerAllWeeks$(uid: string, key: string): Observable<any[]> {
    if (this.useLocalOnly) {
      return of(this.getAllWeeksFromLocal(uid, key) || []);
    }
    const weeksCol = collection(this.firestore, `users/${uid}/trackers/${key}/weeks`);
    return collectionData(weeksCol, { idField: 'weekId' }).pipe(
      map((arr: any[]) => {
        if (arr && arr.length) return arr;
        return this.getAllWeeksFromLocal(uid, key) || [];
      })
    );
  }

  private localKey(uid: string, key: string, weekId: string) {
    return `trackers:${uid}:${key}:weeks:${weekId}`;
  }

  saveTrackerWeekLocal(uid: string, key: string, weekId: string, data: any) {
    try {
      const k = this.localKey(uid, key, weekId);
      localStorage.setItem(k, JSON.stringify(data || {}));
      return true;
    } catch (e) {
      console.error('Local save failed', e);
      return false;
    }
  }

  loadTrackerWeekLocal(uid: string, key: string, weekId: string) {
    try {
      const k = this.localKey(uid, key, weekId);
      const raw = localStorage.getItem(k);
      const parsed = raw ? JSON.parse(raw) : null;
      console.debug('[TrackerService] loadTrackerWeekLocal', { key: k, parsed });
      return parsed;
    } catch (e) {
      console.error('Local load failed', e);
      return null;
    }
  }

  deleteTrackerDayLocal(uid: string, key: string, weekId: string, dayIndex: number) {
    try {
      const doc = this.loadTrackerWeekLocal(uid, key, weekId) || { days: [] };
      if (!doc.days) doc.days = [];
      doc.days[dayIndex] = null;
      this.saveTrackerWeekLocal(uid, key, weekId, doc);
      return true;
    } catch (e) {
      console.error('Local delete day failed', e);
      return false;
    }
  }

  getAllWeeksFromLocal(uid: string, key: string) {
    try {
      const prefix = `trackers:${uid}:${key}:weeks:`;
      const out: any[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const storageKey = localStorage.key(i) as string;
        if (storageKey && storageKey.startsWith(prefix)) {
          const weekId = storageKey.substr(prefix.length);
          const raw = localStorage.getItem(storageKey);
          const parsed = raw ? JSON.parse(raw) : null;
          console.debug('[TrackerService] found local key', storageKey, parsed);
          out.push({ weekId, ...parsed });
        }
      }
      return out;
    } catch (e) {
      console.error('Local getAllWeeks failed', e);
      return [];
    }
  }
}
