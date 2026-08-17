import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../icon/icon';
import { navbarItems } from './navbar.config';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [IconComponent, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  private readonly alertService = inject(AlertService);
  readonly items = navbarItems;

  showUnavailable(label: string): void {
    this.alertService.warning('Esta sección está en construcción.', label);
  }
}
