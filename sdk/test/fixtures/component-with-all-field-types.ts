import {Component, Input} from '@angular/core';
import { CmsComponent, CmsField, CmsFieldTypes } from 'crownpeak-dxm-angular-sdk';

@Component({
    selector: '[component=ComponentWithAllFieldTypes]',
    template: `
        <div>
            <h1>{{ field1 }}</h1>
            <h2>{{ field2 }}</h2>
            <h3>{{ field3 }}</h3>
            <h4>{{ field4 }}</h4>
            <h5>{{ field5 }}</h5>
            <h6>{{ field6 }}</h6>
            <h7>{{ field7 }}</h7>
            <h8>{{ field8 }}</h8>
        </div>
    `
})
export class ComponentWithAllFieldTypes extends CmsComponent {
    @Input() data:any;
    field1: CmsField = new CmsField("Field1", CmsFieldTypes.TEXT, null);
    field2: CmsField = new CmsField("Field2", CmsFieldTypes.WYSIWYG, null);
    field3: CmsField = new CmsField("Field3", CmsFieldTypes.DATE, null);
    field4: CmsField = new CmsField("Field4", CmsFieldTypes.DOCUMENT, null);
    field5: CmsField = new CmsField("Field5", CmsFieldTypes.IMAGE, null);
    field6: CmsField = new CmsField("Field6", CmsFieldTypes.HREF, null);
    field7: CmsField = new CmsField("Field7", CmsFieldTypes.WIDGET, null);
    field8: CmsField = new CmsField("Field8", "SomethingElse", null);
}
