import { Component, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  protected readonly authService = inject(AuthService);

  isSidebarCollapsed = input<boolean>(false);
  protected sidebarToggle = output();
  protected currentUser = this.authService.user;

  toggleSidebar() {
    this.sidebarToggle.emit();
  }
}
