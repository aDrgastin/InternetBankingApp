import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  isSidebarCollapsed = input<boolean>(false);
  protected sidebarToggle = output();

  toggleSidebar() {
    this.sidebarToggle.emit();
  }
}
