import { Component } from '@angular/core';
import { CmsStaticPage } from 'crownpeak-dxm-angular-sdk';

@Component({
    selector: '[component=PageWithDropZone]',
    template: `
        <div *ngIf="isLoaded">
            <DropZone name="dropzone"/>
        </div>
    `
})
export class PageWithDropZone extends CmsStaticPage {
    constructor()
    {
        super(null);
    }
}
