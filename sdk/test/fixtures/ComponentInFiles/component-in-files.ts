import {Component, Input} from '@angular/core';
import { CmsComponent, CmsField, CmsFieldTypes } from 'crownpeak-dxm-angular-sdk';

@Component({
    selector: '[component=ComponentInFiles]',
    templateUrl: './component-in-files.html',
    styleUrls: ['./component-in-files.css']
})
export class ComponentInFiles extends CmsComponent {
    @Input() data:any;
    heading: CmsField = new CmsField("Heading", CmsFieldTypes.TEXT);
}
