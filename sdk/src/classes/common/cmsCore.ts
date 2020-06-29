import { CmsDataCache, ICmsDataProvider, CmsNullDataProvider } from 'crownpeak-dxm-sdk-core';
import { Component } from "@angular/core";

export default class CmsCore extends Component {
    cmsDataProvider: ICmsDataProvider = new CmsNullDataProvider();
    cmsAssetId: number = -1;

    static init(cmsStaticDataLocation: string, cmsDynamicDataLocation: string) {
        CmsDataCache.init(cmsStaticDataLocation, cmsDynamicDataLocation);
    }
}
