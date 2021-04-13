import CmsCore from "../common/cmsCore";
import { CmsDataCache } from "crownpeak-dxm-sdk-core";

export default class CmsPage extends CmsCore {
    cmsWrapper?:string;
    cmsUseTmf: boolean = false;
    cmsUseMetadata: boolean = false;
    cmsSuppressFolder: boolean = false;
    cmsSuppressModel: boolean = false;
    isLoaded: boolean = false;
    cmsLoadDataTimeout?: number;
    cmsDataLoaded?: (data: object, assetId: number) => object | void;
    cmsDataError?: (exception: any, assetId: number) => void;
    cmsBeforeLoadingData?: (options: XMLHttpRequest | RequestInit) => void;

    ngOnInit(): void {
        const that = this;
        let isError = false;
        this.cmsDataProvider.setPreLoad(this.cmsBeforeLoadingData);
        this.cmsDataProvider.getSingleAsset(this.cmsAssetId, this.cmsLoadDataTimeout).catch((ex) => {
            isError = true;
            if (that.cmsDataError) that.cmsDataError(ex, that.cmsAssetId);
            else console.error(ex);
        }).then(() => {
            if (!isError) {
                if (that.cmsDataLoaded) CmsDataCache.set(that.cmsAssetId, that.cmsDataLoaded(CmsDataCache.get(that.cmsAssetId), that.cmsAssetId) || CmsDataCache.get(that.cmsAssetId));
                that.isLoaded = true;
            }
        });
        CmsDataCache.cmsAssetId = this.cmsAssetId;
    }
}
