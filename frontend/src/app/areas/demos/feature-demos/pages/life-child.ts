import { Component, effect, input, OnDestroy } from '@angular/core';

// TypeScript -> @Script

// "Metadata Decorators" [HttpGet] [TestMethod],
@Component({
  selector: 'app-demos-lifechild',
  imports: [],
  template: ` <p>I'm just a baby! The id you selected is {{ id() }}</p> `,
  styles: ``,
})
export class LifechildPage implements OnDestroy {
  id = input.required<string>(); // you have to pass from the parent component.

  constructor() {
    // console.log(`Going to the api to get thingy ${this.id()}`);
    effect((onCleanup) => {
      console.log(`The id changed! ${this.id()}`);
      onCleanup(() =>
        console.log('This will run when the injection context (component) is destroyed.'),
      );
    });
  }
  ngOnDestroy(): void {
    const message = 'Hello!';
    console.log('Goodbye, cruel world!' + this.id() + message);
  }

  // 500, 2
}
