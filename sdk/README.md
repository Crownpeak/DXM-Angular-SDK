<a href="https://www.crownpeak.com" target="_blank">![Crownpeak Logo](https://github.com/Crownpeak/DXM-Angular-SDK/raw/master/images/crownpeak-logo.png?raw=true "Crownpeak Logo")</a>

# Crownpeak Digital Experience Management (DXM) Software Development Kit (SDK) for Angular
Crownpeak Digital Experience Management (DXM) Software Development Kit (SDK) for Angular has been constructed to assist
the Single Page App developer in developing client-side applications that leverage DXM for content management purposes.

*For all usage instructions, see <a href="https://github.com/Crownpeak/DXM-Angular-SDK" target="_blank">https://github.com/Crownpeak/DXM-Angular-SDK</a>*

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
   
## Version History
 
| Version       | Date          | Changes                            |
| ------------- | --------------|----------------------------------- |
| 2.0.0         | 2020JUN30     | Initial release.    |
| 2.1.0         | 2020JUL28     | New 'init', 'patch' and 'scaffold' options, improved output, lots of bug fixes. |
| 2.1.1         | 2020JUL29     | Updated crownpeak-dxm-sdk-core version.    |
| 2.2.0         | 2020SEP03     | Add support for indexed fields and cp-scaffold. Bug fixes. |
| 2.3.0         | 2020OCT01     | Preserve paths for uploads, support uploads from pages and wrappers. Bug fixes. |