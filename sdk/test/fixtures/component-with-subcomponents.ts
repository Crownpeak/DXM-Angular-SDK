import {Component, Input} from '@angular/core';
import { CmsComponent, CmsField, CmsFieldTypes } from 'crownpeak-dxm-angular-sdk';

@Component({
    selector: '[component=ComponentWithSubcomponents]',
    template: `
        <div>
            <h1>{{ field1 }}</h1>
            <h2><div component="ComponentWithUpload"></div></h2>
            <h3><div component="ComponentInFiles"></div></h3>
        </div>
    `
})
export class ComponentWithSubcomponents extends CmsComponent {
    @Input() data:any;
    field1: CmsField = new CmsField("Field1", CmsFieldTypes.TEXT);
}

