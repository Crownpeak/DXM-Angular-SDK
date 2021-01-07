import CmsCore from "../common/cmsCore";
import { CmsDataCache } from "crownpeak-dxm-sdk-core";

export default class CmsPage extends CmsCore {
    cmsWrapper?:string;
    cmsUseTmf: boolean = false;
    cmsUseMetadata: boolean = false;
    cmsSuppressFolder: boolean = false;
    cmsSuppressModel: boolean = false;
    isLoaded: boolean = false;

    ngOnInit(): void {
        const that = this;
        this.cmsDataProvider.getSingleAsset(this.cmsAssetId).then(() => that.isLoaded = true );
        CmsDataCache.cmsAssetId = this.cmsAssetId;
    }
}
