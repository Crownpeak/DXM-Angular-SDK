import CmsCore from "../common/cmsCore";
import { CmsDataCache } from "crownpeak-dxm-sdk-core";

export default class CmsPage extends CmsCore {
    cmsWrapper?:string;
    cmsUseTmf: boolean = false;
    cmsSuppressFolder: boolean = false;
    cmsSuppressModel: boolean = false;

    ngOnInit(): void {
        this.cmsDataProvider.getSingleAsset(this.cmsAssetId);
        CmsDataCache.cmsAssetId = this.cmsAssetId;
    }
}
