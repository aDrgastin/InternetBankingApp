import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "./shared/components/navbar/navbar";
import { Footer } from './shared/components/footer/footer';
import { Sidebar } from './shared/components/sidebar/sidebar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Sidebar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('bankingApp');
  private readonly MOBILE_BREAKPOINT = 767;
  isSidebarCollapsed = signal(window.innerWidth < this.MOBILE_BREAKPOINT);

  onSidebarToggle() {
    this.isSidebarCollapsed.update(v => !v);
  }

  collapseSidebar() {
    if (window.innerWidth < this.MOBILE_BREAKPOINT) {
      this.isSidebarCollapsed.set(true);
    }
  }
}
