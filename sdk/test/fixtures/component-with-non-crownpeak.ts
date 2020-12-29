import {Component, Input} from '@angular/core';
import { CmsComponent, CmsField, CmsFieldTypes } from 'crownpeak-dxm-angular-sdk';

@Component({
    selector: '[component=ComponentWithNonCrownpeak]',
    template: `
        <div>
            <h1>{{ field1 }}</h1>
            <div component="SimpleComponent"></div>
            <div component="ComponentInFiles"></div>
            <div component="NonCrownpeakComponent"></div>
        </div>
    `
})
export class ComponentWithNonCrownpeak extends CmsComponent {
    @Input() data:any;
    field1: CmsField = new CmsField("Field1", CmsFieldTypes.TEXT);
}
