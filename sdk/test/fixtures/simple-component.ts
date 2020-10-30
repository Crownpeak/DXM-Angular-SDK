import {Component, Input} from '@angular/core';
import { CmsComponent, CmsField, CmsFieldTypes, CmsIndexedField } from 'crownpeak-dxm-angular-sdk';

@Component({
    selector: '[component=SimpleComponent]',
    template: `
        <div>
            <h1>{{ field1 }}</h1>
            <h1>{{ this.field2 }}</h1>
            <h1>{{ field3 }}</h1>
            <h1>{{ field4 }}</h1>
            <h1>{{ this.field5 }}</h1>
            <h1>{{ field6 }}</h1>
            <h1>{{/* field7 */}}</h1>
            <h1>{{/* this.field8 */}}</h1>
            <h1>{{/* field9 */}}</h1>
            <h1>{{/* field10 */}}</h1>
            <h1>{{/* this.field11 */}}</h1>
            <h1>{{/* field12 */}}</h1>
        </div>
    `
})
export class SimpleComponent extends CmsComponent {
    @Input() data:any;
    cmsFolder: string = "Simple Subfolder";
    cmsZones: string[] = ["simple-zone"];
    field1: CmsField = new CmsField("Field1", CmsFieldTypes.TEXT);
    field2: CmsField = new CmsField("Field2", CmsFieldTypes.TEXT, null);
    field3: CmsField = new CmsField("Field3", CmsFieldTypes.TEXT, null, CmsIndexedField.STRING);
    field4: CmsField = new CmsField("Field4", "Text");
    field5: CmsField = new CmsField("Field5", "Text", null);
    field6: CmsField = new CmsField("Field6", "Text", null, CmsIndexedField.STRING);
    field7: CmsField = new CmsField("Field7", CmsFieldTypes.TEXT);
    field8: CmsField = new CmsField("Field8", CmsFieldTypes.TEXT, null);
    field9: CmsField = new CmsField("Field9", CmsFieldTypes.TEXT, null, CmsIndexedField.STRING);
    field10: CmsField = new CmsField("Field10", "Text");
    field11: CmsField = new CmsField("Field11", "Text", null);
    field12: CmsField = new CmsField("Field12", "Text", null, CmsIndexedField.STRING);
}
