import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-student-fun-zone-redirect',
  standalone: true,
  template: `<p>Redirecting to Student Fun Zone...</p>`,
})
export class StudentFunZoneRedirectComponent implements OnInit {
  ngOnInit(): void {
    window.location.href = '../../WP_1_Edna_Ustavdic/StudentFunZone/StudentFunZone.html';
  }
}
