import {Component, Input} from '@angular/core';
import { CmsComponent, CmsField, CmsFieldTypes } from 'crownpeak-dxm-angular-sdk';

@Component({
    selector: '[component=ComponentWithUpload]',
    template: `
        <div>
            <h1>{{ field1 }}</h1>
            <img src="./logo.png"/>
        </div>
    `
})
export class ComponentWithUpload extends CmsComponent {
    @Input() data:any;
    field1: CmsField = new CmsField("Field1", CmsFieldTypes.TEXT);
}
