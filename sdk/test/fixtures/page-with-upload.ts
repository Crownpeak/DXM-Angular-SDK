import { Component } from '@angular/core';
import { CmsStaticPage } from 'crownpeak-dxm-angular-sdk';

@Component({
    selector: '[component=PageWithUpload]',
    template: `
        <div>
            <h1 *ngIf="isLoaded" component="SimpleComponent"></h1>
            <img src="./logo.png"/>
        </div>
    `
})
export class PageWithUpload extends CmsStaticPage {
    constructor()
    {
        super(null);
    }
}
