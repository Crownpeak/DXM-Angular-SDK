import {Component, Input} from '@angular/core';
import { CmsComponent, CmsField } from 'crownpeak-dxm-angular-sdk';

@Component({
    selector: '[component=ComponentWithList]',
    template: `
        <div>
            <!-- <List name="List" type="ListItem" itemName="Field"> -->
            {this.list.value.map(item => {
                return <ListItem data={item.ListItem} key={i++}/>
            })}
            <!-- </List> -->
        </div>
    `
})
export class ComponentWithList extends CmsComponent {
    @Input() data:any;
    list: CmsField = new CmsField("Field", "ListItem", null);
}
