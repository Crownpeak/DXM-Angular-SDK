import { Component } from '@angular/core';
import { CmsStaticPage } from 'crownpeak-dxm-angular-sdk';

@Component({
    selector: '[component=PageWithScaffold]',
    template: `
        <div>
            <h1 *ngIf="isLoaded" component="SimpleComponent"></h1>
            <p>Before</p>
            <!-- cp-scaffold 
            <h2>{Heading:Text}</h2>
            else -->
            <h2>{ "not present" }</h2>
            <!-- /cp-scaffold -->
            <p>Between</p>
            <!-- cp-scaffold 
            {SupplementaryField:Text}
            /cp-scaffold -->
            <p>After</p>
        </div>
    `
})
export class PageWithScaffold extends CmsStaticPage {
    constructor()
    {
        super(null);
    }
}
