import { CmsDataCache } from 'crownpeak-dxm-sdk-core';
import CmsComponent from './cmsComponent';
import IDropZoneProps from './IDropZoneProps';
import { Input, Component, ViewContainerRef } from "@angular/core";

export default class CmsDropZoneComponent extends CmsComponent {
    name?:string;

    constructor(props: IDropZoneProps) {
        super(props);
    }

    ngOnInit(): void {
        this.data = (CmsDataCache.get(CmsDataCache.cmsAssetId).DropZones || {})[this.name || "badger"] || [];
        super.ngOnInit();
    }

    createComponents(viewContainerRef:ViewContainerRef) {
        this.data.map((component: any) => {
            const key = Object.keys(component)[0];
            const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.components[key]);
            const componentRef = viewContainerRef.createComponent(componentFactory);
            (componentRef.instance as CmsComponent).data = component[key];
        })
    }
}
