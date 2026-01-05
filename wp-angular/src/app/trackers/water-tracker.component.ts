import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-water-tracker',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './water-tracker.component.html',
  styleUrls: ['./water-tracker.component.css']
})
export class WaterTrackerComponent {
  waterCount = 0;
  saved = false;

  addWater() {
    this.waterCount++;
    this.saved = false;
  }

  saveWater() {
    this.saved = true;
  }
}
