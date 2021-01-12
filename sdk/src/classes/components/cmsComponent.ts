import { CmsDataCache, CmsDataSource, CmsField } from 'crownpeak-dxm-sdk-core';
import CmsCore from "../common/cmsCore";
import IComponentProps from "./IComponentProps";

export default class CmsComponent extends CmsCore implements IComponentProps {
    [key: string]: any;
    data?:any;
    cmsFolder?: string = "";
    cmsZones?: string[] = [];
    cmsDisableDragDrop?: boolean = false;
    
    constructor(props?: any) {
        super(props);
    }

    ngOnInit(): void {
        CmsDataCache.cmsComponentName = this.constructor.name;
        const dataSource = (this.data || (CmsDataCache.get(CmsDataCache.cmsAssetId))[CmsDataCache.cmsComponentName]) as CmsDataSource;
        CmsDataCache.dataSource = dataSource;
        if (Array.isArray(dataSource)) {
            let index = dataSource.index;
            if (typeof index === "undefined" || isNaN(index)) index = 0;
            else index++;
            dataSource.index = index;
        }
        if (dataSource) {
            for (const key of Object.keys(this)) {
                const value = this[key];
                if (value instanceof CmsField) {
                    const field = value as CmsField;
                    if (!field.value) {
                        if (dataSource.index >= 0) {
                            field.value = dataSource[dataSource.index][field.cmsFieldName];
                        } else {
                            field.value = dataSource[field.cmsFieldName];
                        }
                    }
                }
            }
        }
    }
}
