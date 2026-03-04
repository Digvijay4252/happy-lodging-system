import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-cards.component.html',
  styleUrl: './dashboard-cards.component.scss',
})
export class DashboardCardsComponent {
  @Input() items: { label: string; value: any }[] = [];
}
