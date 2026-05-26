import { Component, HostListener, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './shared/components/sidebar/sidebar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('bankingApp');
  private readonly MOBILE_BREAKPOINT = 767;
  private readonly SIDEBAR_KEY = 'sidebarCollapsed';
  isSidebarCollapsed = signal(this.getInitialSidebarState());

  onSidebarToggle() {
    this.isSidebarCollapsed.update(v => {
        localStorage.setItem(this.SIDEBAR_KEY, String(!v));
        return !v;
        });
    }

    collapseSidebar() {
        if (window.innerWidth < this.MOBILE_BREAKPOINT) {
            this.isSidebarCollapsed.set(true);
        }
    }

    @HostListener('window:resize')
    protected onResize() {
        if (window.innerWidth < this.MOBILE_BREAKPOINT) {
            this.isSidebarCollapsed.set(true);
        }
    }

    private getInitialSidebarState() {
        if (window.innerWidth < this.MOBILE_BREAKPOINT) return true;
        const saved = localStorage.getItem(this.SIDEBAR_KEY);
        return saved !== null ? saved === 'true' : false;
    }
}
