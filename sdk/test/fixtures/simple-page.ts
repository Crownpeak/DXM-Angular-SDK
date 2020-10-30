import { Component } from '@angular/core';
import { CmsStaticPage } from 'crownpeak-dxm-angular-sdk';

@Component({
    selector: '[component=SimplePage]',
    template: `
        <div>
            <h1 *ngIf="isLoaded" component="SimpleComponent"></h1>
            <h2 *ngIf="isLoaded" component="SimpleComponent"></h2>
        </div>
    `
})
export class SimplePage extends CmsStaticPage {
    constructor()
    {
        super(null);
        this.cmsAssetId = 12345;
        this.cmsSuppressFolder = true;
        this.cmsSuppressModel = true;
        this.cmsWrapper = "SimpleWrapper";
        this.cmsUseTmf = true;
    }
}
