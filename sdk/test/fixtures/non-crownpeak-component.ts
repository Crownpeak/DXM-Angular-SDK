import {Component, Input} from '@angular/core';

@Component({
    selector: '[component=NonCrownpeakComponent]',
    template: `
        <div>
            <h1>Non-Crownpeak Component</h1>
        </div>
    `
})
export class NonCrownpeakComponent {
    @Input() data:any;
}
