import { Component } from '@angular/core';
import { CmsStaticPage } from 'crownpeak-dxm-angular-sdk';

@Component({
    selector: '[component=PageWithNonCrownpeak]',
    template: `
        <div>
            <div component="SimpleComponent"></div>
            <div component="ComponentInFiles"></div>
            <div component="NonCrownpeakComponent"></div>
        </div>
    `
})
export class PageWithNonCrownpeak extends CmsStaticPage {
    constructor()
    {
        super(null);
    }
}
