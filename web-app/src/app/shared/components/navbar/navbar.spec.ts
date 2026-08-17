import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { AlertService } from '../../services/alert.service';
import { NavbarComponent } from './navbar';

describe('NavbarComponent', () => {
  it('shows a warning when an unavailable section is selected', () => {
    const alert = { warning: vi.fn() };
    TestBed.configureTestingModule({ imports: [NavbarComponent], providers: [{ provide: AlertService, useValue: alert }] });
    const component = TestBed.createComponent(NavbarComponent).componentInstance;

    component.showUnavailable('Calendario');

    expect(alert.warning).toHaveBeenCalledWith('Esta sección está en construcción.', 'Calendario');
  });
});
