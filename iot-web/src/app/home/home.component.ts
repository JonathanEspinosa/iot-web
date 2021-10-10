import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {

  subscription: Subscription | undefined;
  events: any[] = [];

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {  }

  goGroups() {
    this.router.navigateByUrl('/group');
  }

  goUsers() {
    this.router.navigateByUrl('/user');
  }

  goRol() {
    this.router.navigateByUrl('/rol');
  }
}
