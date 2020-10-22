<a href="https://www.crownpeak.com" target="_blank">![Crownpeak Logo](images/crownpeak-logo.png?raw=true "Crownpeak Logo")</a>

# Crownpeak Digital Experience Management (DXM) Software Development Kit (SDK) for Angular
Crownpeak Digital Experience Management (DXM) Software Development Kit (SDK) for Angular has been constructed to assist
the Single Page App developer in developing client-side applications that leverage DXM for content management purposes.


## Benefits
* **Runtime libraries to handle communication with either Dynamic (DXM Dynamic Content API) or Static (On-disk JSON payload)
Data Sources**

  As a development team runs their build process, the underlying Angular Application will be minified and likely packed
  into a set of browser-compatible libraries (e.g., ES5). We expect any DXM NPM Packages also to be compressed in this
  manner. To facilitate communication between the Angular Application and content managed within DXM, a runtime NPM Package
  is provided. The purpose of this package is:
  
  * Read application configuration detail from a global environment file (e.g., Dynamic Content API endpoint and credentials, 
  static content disk location, etc.);
  * Making data models available to the Angular Application, which a developer can map against
    * **Dynamic Data** - Asynchronously processing data from the DXM Dynamic Content API, using the Search G2 Raw JSON endpoint; and 
    * **Static Data** - Loading JSON payload data directly from local storage.
  
* **DXM Content-Type Scaffolding**

  Developers will continue to work with their Continuous Integration / Delivery and source control tooling to create a
  Angular application. However, the purpose of the DXM Content-Type Scaffolding build step is to convert the Angular Components
  in a single direction (Angular > DXM), into the necessary configuration to support CMS operations. At present, the DXM
  Component Library includes the capability to auto-generate Templates (input.aspx, output.aspx, post_input.aspx) based
  upon a moustache-style syntax (decorating of editable properties). It is not intended that we re-design this process,
  as it is fully supported within DXM, and customer-battle-tested - therefore, in order to create Template configuration,
  the build step:
    * Converts Angular Components into Crownpeak Components by using the existing Component Builder Process, via the CMS Access
   API (DXM's RESTful Content Manipulation API), and then existing "post_save" process;
    * Creates Templates for each Angular Page (One of the DXM Angular Component Types) by using the existing Template Builder
   Process, again via the CMS Access API and existing "post_save" process; and
    * Creates a new Model for the Angular Page Content-Type, via the CMS Access API, so that authors can create multiple versions
   of a structured Page or Component, without needing to run an entire development/test cycle.


## Install
```
yarn add crownpeak-dxm-angular-sdk
# or 
npm install crownpeak-dxm-angular-sdk
```

## Usage - Runtime Data Libraries
 Review example project at <a href="https://github.com/Crownpeak/DXM-SDK-Examples/tree/master/angular" target="_blank">https://github.com/Crownpeak/DXM-SDK-Examples/tree/master/angular</a>
 for complete usage options. The example project includes the following capabilities:
  * ```CmsStaticPage``` type to load payload data from JSON file on filesystem, delivered by DXM;
  * ```CmsDynamicPage``` type to load payload data from DXM Dynamic Content API.


### CmsStaticPage Type
Loads payload data from JSON file on filesystem - expects knowledge of DXM AssetId in order to find file with corresponding
name (e.g., 12345.json). CmsStaticPage is the data equivalent of a DXM Asset when used as a page. Example at /examples/bootstrap-blog/pages/blogPage.js:
```
import { Component } from '@angular/core';
import { CmsStaticPage, CmsDataCache } from 'crownpeak-dxm-angular-sdk';

@Component({
    selector: '[component=HomePage]',
    template: `
            <div class="jumbotron" component="HeroContainer"></div>
            <div class="container">
                <div class="row">
                    <div class="col-md-4" component="SecondaryContainer"></div>
                    <div class="col-md-4" component="SecondaryContainer"></div>
                    <div class="col-md-4" component="SecondaryContainer"></div>
                </div>
                <hr>
                <div class="row" component="SecondaryList"></div>
                <div class="row" component="DropZone" name="secondary"></div>
                <hr>
            </div>
    `
})
export class HomePage extends CmsStaticPage {
    constructor()
    {
        super(null);
        this.cmsAssetId = 266812;
        this.cmsWrapper = "";           //insert Wrapper Name from data-cms-wrapper-name in HTML, or don't include property to accept defaults.
        this.cmsUseTmf = false;         //set to true to create templates that use the Translation Model Framework.
        this.cmsSuppressModel = false;  //set to true to suppress model and content folder creation when scaffolding.
        this.cmsSuppressFolder = false; //set to true to suppress content folder creation when scaffolding.
    }

    ngOnInit()
    {
        super.ngOnInit();
    }
}
```

### CmsDynamicPage Type
Loads payload data from DXM Dynamic Content API upon request - expects knowledge of DXM AssetId.
 ```
import { Component } from '@angular/core';
import { CmsStaticPage, CmsDataCache } from 'crownpeak-dxm-angular-sdk';

@Component({
    selector: '[component=HomePage]',
    template: `
            <div *ngIf="isLoaded" class="jumbotron" component="HeroContainer"></div>
            <div *ngIf="isLoaded" class="container">
                <div class="row">
                    <div class="col-md-4" component="SecondaryContainer"></div>
                    <div class="col-md-4" component="SecondaryContainer"></div>
                    <div class="col-md-4" component="SecondaryContainer"></div>
                </div>
                <hr>
                <div class="row" component="SecondaryList"></div>
                <div class="row" component="DropZone" name="secondary"></div>
                <hr>
            </div>
    `
})
export class HomePage extends CmsDynamicPage {
    constructor()
    {
        super(null);
        this.cmsAssetId = 266812;
        this.cmsWrapper = "";           //insert Wrapper Name from data-cms-wrapper-name in HTML, or don't include property to accept defaults.
        this.cmsUseTmf = false;         //set to true to create templates that use the Translation Model Framework.
        this.cmsSuppressModel = false;  //set to true to suppress model and content folder creation when scaffolding.
        this.cmsSuppressFolder = false; //set to true to suppress content folder creation when scaffolding.
    }

    ngOnInit()
    {
        super.ngOnInit();
    }
}

```

### CmsComponent
Includes CmsField references for content rendering from DXM within a Angular Component:
```
import {Component, Input} from '@angular/core';
import { CmsComponent, CmsField, CmsFieldTypes } from 'crownpeak-dxm-angular-sdk';

@Component({
    selector: '[component=HeroContainer]',
    template: `
        <div class="container">
            <h1 class="display-3">{{ heading }}</h1>
            <div [innerHTML]="description"></div>
            <p><a class="btn btn-primary btn-lg" href="#" role="button">{{ button_text }}</a></p>
        </div>
    `
})
export class HeroContainer extends CmsComponent {
    @Input() data:any;
    heading: CmsField = new CmsField("Heading", CmsFieldTypes.TEXT, null);
    description: CmsField = new CmsField("Description", CmsFieldTypes.WYSIWYG, null);
    button_text: CmsField = new CmsField("Button_Text", CmsFieldTypes.TEXT, null);
    cmsFolder: string = ""; //set the subfolder in which the component will be created when scaffolding.
    cmsZones: string[] = []; //set the zones into which the component is permitted to be dropped.
}
```

### CmsDropZoneComponent
Enables implementation of draggable components via DXM. Example usage below:
```
import {CmsDropZoneComponent} from 'crownpeak-dxm-angular-sdk';
import {Component, ComponentFactoryResolver, ViewChild} from '@angular/core';
import {DropZoneDirective} from "./dropZoneDirective";
import {HeroContainer} from "./heroContainer";
import {SecondaryContainer} from "./secondaryContainer";

@Component({
    selector: '[component=DropZone]',
    template: `<ng-template Component></ng-template>`,
    inputs: ["name", "data"]
})
export class DropZone extends CmsDropZoneComponent {
    @ViewChild(DropZoneDirective, {static: true}) dropZoneDirective: DropZoneDirective;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) {
        super(null);

        this.components = {
            "HeroContainer": HeroContainer,
            "SecondaryContainer": SecondaryContainer
        };
    }

    ngOnInit() {
        super.ngOnInit();
        this.createComponents(this.dropZoneDirective.viewContainerRef);
    }
}
```
Example implementation upon a ```CmsStaticPage``` or ```CmsDynamicPage```:
```
<div class="row" component="DropZone" name="secondary"></div>
```
For further details, see examples/bootstrap-homepage project.

### List Items
Enables implementation of list items within DXM. Example usage below (note comment, which is requirement for DXM scaffolding):
```
import { Component } from '@angular/core';
import { CmsComponent, CmsField, CmsDataCache } from 'crownpeak-dxm-angular-sdk';

@Component({
    selector: '[component=SecondaryList]',
    template: `
        <!-- <List name="SecondaryContainers" type="Widget" itemName="_widget"> -->
        <div class="col-md-4" *ngFor="let sc of secondaryContainers.value">
            <div component="SecondaryContainer" [data]="sc.SecondaryContainer"></div>
        </div>
        <!-- </List> -->
    `
})
export class SecondaryList extends CmsComponent {
    secondaryContainers: CmsField; // = new CmsField("SecondaryContainer", "SecondaryContainer", CmsDataCache.get(CmsDataCache.cmsAssetId).SecondaryList);

    ngOnInit(): void {
        this.secondaryContainers = new CmsField("SecondaryContainer", "SecondaryContainer", CmsDataCache.get(CmsDataCache.cmsAssetId).SecondaryList);
    }
}
```

### More Complex Replacements
If your application code is too complex for the parser to be able to extract your fields, it is possible to provide your own markup for the Component Library to use instead of your component code:
```
<!-- cp-scaffold 
<h2>{Heading:Text}</h2>
else -->
<h2>{{ heading.value.length > MAX_LENGTH ? heading.value.substr(0, MAX_LENGTH) + "..." : heading }}</h2>
<!-- /cp-scaffold -->
```
It is also possible to add extra markup that is not used directly in your application, for example to support extra data capture:
```
<!-- cp-scaffold 
{SupplementaryField:Text}
/cp-scaffold -->
```

### CmsFieldType
Enumeration containing field types supported within the SDK.

| CmsFieldType  | DXM Mapping     |
| ------------- | --------------- |
| TEXT          | Text            |
| WYSIWYG       | Wysiwyg         |
| DATE          | Date            |
| DOCUMENT      | Document        |
| IMAGE         | Src             |
| HREF          | Href            |

### Indexed Fields
Enables fields to be extracted from content and published as separate fields into Search G2, to support easier sorting and filtering:
```
title: CmsField = new CmsField("Title", CmsFieldTypes.TEXT, null, CmsIndexedField.STRING);
```
A number of different values are available in the `CmsIndexedField` enumerated type to support different data types:
| Enum value | Search G2 Prefix | Comment |
| ---------- | ---------------- | ------- |
| STRING     | custom_s_        | String, exact match only.
| TEXT       | custom_t_        | Text, substring matches allowed, tokenised so not usefully sortable.
| DATETIME   | custom_dt_       | DateTime, must be ISO-8601.
| INTEGER    | custom_i_        | 32-bit signed integer, must be valid.
| LONG       | custom_l_        | 64-bit signed integer, must be valid.
| FLOAT      | custom_f_        | 32-bit IEEE floading point, must be valid.
| DOUBLE     | custom_d_        | 64-bit IEEE floating point, must be valid.
| BOOLEAN    | custom_b_        | Boolean, must be true or false.
| LOCATION   | custom_p_        | Point, must be valid _lat,lon_.
| CURRENCY   | custom_c_        | Currency, supporting exchange rates.
If an invalid value for the specific data type is sent to Search G2, the entire statement is liable to fail silently.

### Content creation options
There are a number of options that can be specified on the constructor of an item that extends CmsPage.
These are set as properties on the extending class. For example:
```
this.useTmf = true;
```
| Property       | Description |
| -------------- | ----------- |
| useTmf         | If set, the resulting template will use the Translation Model Framework (TMF). Defaults to false. |
| suppressModel  | If set, no model will be created for the resulting template. Defaults to false. |
| suppressFolder | If set (or if suppressModel is set), no content folder will be created for the resulting model. Defaults to false. |

---

## Installation - DXM Content-Type Scaffolding (cmsify)
* Requires update to DXM Component Library, by installing <a href="https://raw.githubusercontent.com/Crownpeak/DXM-SDK-Core/master/dxm/dxm-cl-patch-for-sdk-latest.xml" target="_blank">dxm-cl-patch-for-sdk-latest.xml</a>.

* Requires .env file located in root of the Angular project to be scaffolded. Values required within .env file are:
 
| Key           | Description                                                               |
| ------------- | ------------------------------------------------------------------------- |
| CMS_INSTANCE  | DXM Instance Name.                                                        |
| CMS_USERNAME  | DXM Username with access to create Assets, Models, Templates, etc.        |
| CMS_PASSWORD  | Pretty obvious.                                                           |
| CMS_API_KEY   | DXM Developer API Key - Can be obtained by contacting Crownpeak Support.  |
| CMS_SITE_ROOT | DXM Site Root Asset Id.                                                   |
| CMS_PROJECT   | DXM Project Asset Id.                                                     |
| CMS_WORKFLOW  | DXM Workflow Id (to be applied to created Models).                        |
| CMS_SERVER    | (Optional) Allows base Crownpeak DXM URL to be overridden.                |

```
# Crownpeak DXM Configuration
CMS_INSTANCE={Replace with CMS Instance Name}
CMS_USERNAME={Replace with CMS Username}
CMS_PASSWORD={Replace with CMS Password}
CMS_API_KEY={Replace with CMS Developer API Key}
CMS_SITE_ROOT={Replace with Asset Id of Site Root}
CMS_PROJECT={Replace with Asset Id of Project}
CMS_WORKFLOW={Replace with Workflow Id}
CMS_STATIC_CONTENT_LOCATION=/content/json
CMS_DYNAMIC_CONTENT_LOCATION=//searchg2.crownpeak.net/{Replace with Search G2 Collection Name}/select/?wt=json
```

Installation instructions:
1. Create new DXM Site Root and check "Install Component Project using Component Library 2.2"; or
```
$ yarn crownpeak init --folder <parent-folder-id> --name "New Site Name"
```

2. After site creation, set the values for `CMS_SITE_ROOT` and `CMS_PROJECT` in your `.env` file to be the
relevant asset IDs from DXM;

3. Install the manifest (detailed above);
```
$ yarn crownpeak patch
```

4. Verify that all your settings are correct.
```
$ yarn crownpeak scaffold --verify
```

## Usage - DXM Content-Type Scaffolding

From the root of the project to be Angular scaffolded:

```
$ yarn crownpeak scaffold
yarn run v1.22.4
$ ../../sdk/cmsify scaffold
Uploaded [holder.min.js] as [/Skunks Works/Angular SDK/_Assets/js/holder.min.js] (261402)
Unable to find source file [/Users/paul.taylor/Documents/Repos/Crownpeak/DXM-Angular-SDK/examples/bootstrap/js/bundle.js] for upload
Uploaded [blog.css] as [/Skunks Works/Angular SDK/_Assets/css/blog.css] (261400)
Saved wrapper [Blog] as [/Skunks Works/Angular SDK/Component Project/Component Library/Nav Wrapper Definitions/Blog Wrapper] (261771)
Saved component [BlogPost] as [/Skunks Works/Angular SDK/Component Project/Component Library/Component Definitions/Blog Post] (261776)
Saved component [FeaturedPost] as [/Skunks Works/Angular SDK/Component Project/Component Library/Component Definitions/Featured Post] (261777)
Saved component [Footer] as [/Skunks Works/Angular SDK/Component Project/Component Library/Component Definitions/Footer] (261778)
Saved component [Header] as [/Skunks Works/Angular SDK/Component Project/Component Library/Component Definitions/Header] (261779)
Saved component [PostArchives] as [/Skunks Works/Angular SDK/Component Project/Component Library/Component Definitions/Post Archives] (261780)
Saved component [SecondaryPost] as [/Skunks Works/Angular SDK/Component Project/Component Library/Component Definitions/Secondary Post] (261781)
Saved component [TopicList] as [/Skunks Works/Angular SDK/Component Project/Component Library/Component Definitions/Topic List] (261782)
Saved template [BlogPage] as [/Skunks Works/Angular SDK/Component Project/Component Library/Template Definitions/Blog Page Template] (261370)
Saved model [BlogPage] as [/Skunks Works/Angular SDK/Component Project/Models/Blog Page Folder/Blog Page] (261784)
Saved content folder [Blog Pages] as [/Skunks Works/Angular SDK/Blog Pages/] (261376)
✨  Done in 62.61s.
```

The scaffolding can be run multiple times as additional capabilities are added to the Angular project. Asset data within DXM will not
be destroyed by future runs.

The `crownpeak scaffold` script supports a number of optional command-line parameters:

| Parameter        | Effect        |
| ---------------- | --------------|
| `--dry-run`      | Report on the items that would be imported into the CMS, but do not import them. |
| `--verbose`      | Show verbose output where applicable. |
| `--verify`       | Verify that the Crownpeak DXM environment is configured correctly. |
| `--no-components` | Do not import any components. |
| `--no-pages`      | Do not import any pages, templates, or models. |
| `--no-uploads`    | Do not import any uploads; for example CSS, JavaScript or images. |
| `--no-wrappers`   | Do not import any wrappers. |
| `--only <name>`   | Only import items matching the specified name. Can be used multiple times. |

These are intended to improve performance for multiple runs, and you should expect to see errors if the items being skipped have not already been created within the CMS; for example, if you provide the `--no-components` parameter where the components have not previously been imported.


## Credit
Thanks to:
* <a href="https://github.com/richard-lund" target="_blank">Richard Lund</a> for the refactoring;
* <a href="https://github.com/ptylr" target="_blank">Paul Taylor</a> for a few edits ;)
 
 
## License
MIT License

Copyright (c) 2020 Crownpeak Technology, inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
