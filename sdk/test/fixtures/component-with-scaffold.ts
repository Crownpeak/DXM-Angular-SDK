import {Component, Input} from '@angular/core';
import { CmsComponent, CmsField, CmsFieldTypes } from 'crownpeak-dxm-angular-sdk';

@Component({
    selector: '[component=ComponentWithScaffold]',
    template: `
        <div>
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
export class ComponentWithScaffold extends CmsComponent {
    @Input() data:any;
    heading: CmsField = new CmsField("Field1", CmsFieldTypes.TEXT);
}
