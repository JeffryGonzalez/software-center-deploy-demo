import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  template: `<router-outlet />`,
  imports: [RouterOutlet],
})
export class Home {}
