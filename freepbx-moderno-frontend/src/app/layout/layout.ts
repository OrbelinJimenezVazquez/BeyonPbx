// src/app/layout/layout.ts
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastComponent } from "../shared/toast/toast";
import { ConfirmationModalComponent } from "../shared/confirmation-modal/confirmation-modal";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet, CommonModule, RouterLinkActive, ToastComponent, ConfirmationModalComponent],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css'],
})
export class LayoutComponent implements OnInit {
  isDarkMode = false;
  isSidebarOpen = false;

  ngOnInit() {
    // Cargar preferencia de tema guardada
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
