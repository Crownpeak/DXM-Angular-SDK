const fs = require("fs");
const path = require('path');
const babelParser = require("@babel/parser");
const cssParser = require("./css");
const utils = require("crownpeak-dxm-sdk-core/lib/crownpeak/utils");

let _componentName = "";
let _componentCache = {};

const reList = /^([ \t]*)<!--\s*<List(.*?)\s*type=(["'])([^"']+?)\3(.*?)>\s*-->((.|\s)*?)<!--\s*<\/List>\s*-->/im;
const reListName = /\s+?name\s*=\s*(["'])([^"']+?)\1/i;
const reListItemName = /\s+?itemName\s*=\s*(["'])([^"']+?)\1/i;
const reListWrapper = /<([a-z0-9:\-]+)(.*?)\s+\*ngFor=(["'])([^"']+?)\3(.*?)>/im;
const reExportDefinition = /export\s+(?:const|class|{)\s+([A-Za-z0-9]+)\s+/g;

const parse = (content, file) => {
    const {templates, scripts, styles} = getParts(file, content);

    let template = templates.join("\n");

    const ast = babelParser.parse(content, {
        sourceType: "module",
        plugins: ["typescript", "decorators-legacy", "classProperties"]
    });
    //console.log(JSON.stringify(ast));
    if (ast.errors && ast.errors.length > 0) {
        console.warn(`COMPONENT: Skipping due to errors`);
        return;
    }

    let results = [];
    let uploads = [];
    let imports = [];
    let dependencies = [];
    const bodyParts = ast.program.body;
    for (let i = 0, len = bodyParts.length; i < len; i++) {
        const part = bodyParts[i];
        if (part.type === "ImportDeclaration" && part.specifiers && part.specifiers.length > 0) {
            for (let i in part.specifiers) {
                const specifier = part.specifiers[i];
                if ((specifier.type === "ImportDefaultSpecifier" || specifier.type === "ImportSpecifier")
                    && specifier.local && specifier.local.type === "Identifier") {
                    //console.log(`Found import ${specifier.local.name}`);
                    imports.push(specifier.local.name);
                }
            }
        }
    }

    // Parse out any special lists
    template = replaceLists(template, dependencies);

    for (let i = 0, len = bodyParts.length; i < len; i++) {
        const part = bodyParts[i];
        if (part.type === "ExportDefaultDeclaration" || part.type === "ExportNamedDeclaration") {
            const extnds = part.declaration.superClass;
            let name = part.declaration.id;
            if (extnds && extnds.name === "CmsComponent" && name) {
                name = name.name;
                const cmsProps = processCmsClassProperties(content, name, part.declaration, imports);
                //console.log(`Found component ${name} extending CmsComponent`);
                const data = processCmsComponent(content, ast, name, part.declaration, imports, dependencies);
                if (data) {
                    const result = processCmsComponentTemplate(content, name, template, data, imports, dependencies);
                    if (result) {
                        const processedResult = utils.replaceAssets(file, finalProcessMarkup(result), cssParser, true);
                        uploads = uploads.concat(processedResult.uploads);
                        results.push({name: name, content: processedResult.content, folder: cmsProps.folder, zones: cmsProps.zones, dependencies: dependencies});
                    }
                }
            }
        }
    }
    return { components: results, uploads: uploads };
};

const finalProcessMarkup = (content) => {
    // Remove anything that has { and } but doesn't look like a component
    const replacer = /[{]([^}]*?[\s,/$()][^}]*?)[}]/g;
    while (replacer.test(content)) {
        content = content.replace(replacer, "$1");
    }
    // Replacements from .cpscaffold.json file
    content = utils.replaceMarkup(content);
    return trimSharedLeadingWhitespace(content);
};

const replaceLists = (content, dependencies) => {
    let match;
    while (match = reList.exec(content)) {
        let attributes = " " + match[2] + " " + match[5];
        let name = "";
        let itemName = "";
        const ws = match[1];
        const type = match[4];
        if (reListName.test(attributes)) {
            const nameMatch = reListName.exec(attributes);
            name = nameMatch[2];
        }
        if (reListItemName.test(attributes)) {
            const nameMatch = reListItemName.exec(attributes);
            itemName = nameMatch[2];
        }
        if (!name) {
            name = type + "s"; // TODO: better way to make plural
        }
        if (!itemName) {
            itemName = type;
        }
        let wrapperStart = "", wrapperEnd = "";
        let wrapperMatch = reListWrapper.exec(match[6]);
        if (wrapperMatch) {
            wrapperStart = `<${wrapperMatch[1]}${wrapperMatch[2]}${wrapperMatch[5]}>\r\n${ws}    `;
            wrapperEnd = `  </${wrapperMatch[1]}>\r\n${ws}`;
        }
        //console.log(`Found list with name ${name}`);
        const repl = `${ws}<cp-list name="${name}">\r\n${ws}  ${wrapperStart}{${itemName}:${type}}\r\n${ws}${wrapperEnd}</cp-list>`;
        content = content.replace(match[0], repl);
        addDependency(type, dependencies);
    }
    return content;
};

const trimSharedLeadingWhitespace = (content) => {
    // Trim leading whitespace common to all lines except blanks
    const onlyWhitespace = /^\s*$/;
    const leadingWhitespace = /^\s*/;
    let lines = content.split(`\n`);
    let maxLeader = 99;
    for (let i in lines) {
        let line = lines[i];
        if (i == 0 || onlyWhitespace.test(line)) continue;
        let match = line.match(leadingWhitespace);
        if (match) maxLeader = Math.min(maxLeader, match[0].length);
    }
    if (maxLeader > 0) {
        const leadingWhitespaceReplacer = new RegExp(`^\\s{${maxLeader}}`);
        for (let i in lines) {
            let line = lines[i];
            if (i == 0 || onlyWhitespace.test(line)) continue;
            lines[i] = line.replace(leadingWhitespaceReplacer, "");
        }
        content = lines.join('\n');
    }
    return content;
};

const processCmsComponentTemplate = (content, name, template, data, imports, dependencies) => {
    const scaffoldPreRegexs = [
        { source: "<!--\\s*cp-scaffold\\s*((?:.|\\r|\\n)*?)\\s*else\\s*-->\\s*((?:.|\\r|\\n)*?)\\s*<!--\\s*\\/cp-scaffold\\s*-->", replacement: "<!-- cp-pre-scaffold $1 /cp-pre-scaffold -->" },
        { source: "<!--\\s*cp-scaffold\\s*((?:.|\\r|\\n)*?)\\s*\\/cp-scaffold\\s*-->", replacement: "$1"}
    ];
    const scaffoldPostRegexs = [
        { source: "<!--\\s*cp-pre-scaffold\\s*((?:.|\\r|\\n)*?)\\s*\\/cp-pre-scaffold\\s*-->", replacement: "$1"}
    ];
    const fieldRegexs = [
        { source: "<([a-z0-9:-]*)(\\s*.*?)\\s+\\[innerHTML\\]\\s*=\\s*([\"'])(%%name%%)\\3([^>]*?)(><\\/\\1>|\\/>)", replacement: "<$1$2$5>{%%fieldname%%:%%fieldtype%%}</$1>" },
        { source: "(\\s+\\[([^\\]]+)\\]\\s*=\\s*)([\"'])(%%name%%)\\3", replacement: " $2=$3{%%fieldname%%:%%fieldtype%%}$3" },
        { source: "{{.*?\\/\\*.*?%%name%%.*?\\*\\/.*?}}", replacement: "<!-- {%%fieldname%%:%%fieldtype%%} -->" },
        { source: "=\\s*{{[^{}]*?%%name%%[^{}}]*?}}", replacement: "=\"{%%fieldname%%:%%fieldtype%%}\"" },
        { source: "{{[^{}]*?%%name%%[^{}}]*?}}", replacement: "{%%fieldname%%:%%fieldtype%%}" }
    ];
    const componentRegexs = [
        { source: "<([a-z0-9:-]*)(\\s*.*?)\\s+component\\s*=\\s*([\"'])([^\"']+)\\3([^>]*?)(><\\/\\1>|\\/>)", replacement: "<$1$2$5>{%%name%%}</$1>" }
    ];
    let result = template;
    for (let j = 0, lenJ = scaffoldPreRegexs.length; j < lenJ; j++) {
        let regex = new RegExp(scaffoldPreRegexs[j].source);
        let match = regex.exec(result);
        while (match) {
            let replacement = scaffoldPreRegexs[j].replacement;
            //console.log(`Replacing [${match[0]}] with [${replacement}]`);
            result = result.replace(regex, replacement);
            match = regex.exec(result);
        }
    }
    // Longest name first to avoid substring replacements
    var dataItems = data.sort((a, b) => b.name.length - a.name.length);
    for (let i = 0, len = dataItems.length; i < len; i++) {
        //console.log(`Looking for ${data[i].name}`);
        if (data[i].fieldName) {
            let indexedField = cmsIndexedFieldToString(data[i].indexedField);
            if (indexedField) indexedField = ":" + indexedField;
            for (let j = 0, lenJ = fieldRegexs.length; j < lenJ; j++) {
                let regex = new RegExp(fieldRegexs[j].source.replace("%%name%%", data[i].name));
                let match = regex.exec(result);
                while (match) {
                    const replacement = fieldRegexs[j].replacement.replace("%%fieldname%%", data[i].fieldName).replace("%%fieldtype%%", data[i].fieldType + indexedField);
                    //console.log(`Replacing [${match[0]}] with [${replacement}]`);
                    result = result.replace(regex, replacement);
                    addDependency(data[i].fieldType, dependencies);
                    match = regex.exec(result);
                }
            }
        }
    }
    let componentTypes = {};
    for (let i = 0, len = componentRegexs.length; i < len; i++) {
        const regex = new RegExp(componentRegexs[i].source);
        let match = regex.exec(result);
        while (match) {
            const componentType = match[4];
            const sourceFiles = _componentSourceCache.filter(c => c.isCmsCompoment && c.exports.indexOf(componentType) >= 0);
            //console.log(`Found ${sourceFiles.length} of ${_componentSourceCache.length} files exporting ${componentType}`);
            if (sourceFiles.length > 0) {
                const index = componentTypes[componentType] || 1;
                const suffix = (index > 1 ? ("_" + index) : "") + ":" + componentType;
                componentTypes[componentType] = index + 1;
                const replacement = componentRegexs[i].replacement.replace("%%name%%", componentType + suffix);
                //console.log(`Replacing [${match[0]}] with [${replacement}]`);
                result = result.replace(regex, replacement);
                addDependency(componentType, dependencies);
            } else break;
            match = regex.exec(result);
        }
    }
    for (let j = 0, lenJ = scaffoldPostRegexs.length; j < lenJ; j++) {
        let regex = new RegExp(scaffoldPostRegexs[j].source);
        let match = regex.exec(result);
        while (match) {
            let replacement = scaffoldPostRegexs[j].replacement;
            //console.log(`Replacing [${match[0]}] with [${replacement}]`);
            result = result.replace(regex, replacement);
            match = regex.exec(result);
        }
    }

    return result;
};

const processCmsComponent = (content, ast, name, declaration, imports, dependencies) => {
    _componentName = name;
    //console.log(`Processing CmsComponent ${_componentName}`);
    let results = [];
    const items = declaration.body.body;
    for (let i = 0; len = items.length, i < len; i++) {
        const item = items[i];
        if (item.value && item.value.callee && item.value.callee.name === "CmsField" && item.value.arguments && item.value.arguments.length > 1) {
            const args = item.value.arguments;
            if (args[1].property && args[1].property.name) {
                if (args.length > 3 && args[3].object && args[3].object.type === "Identifier" && args[3].object.name === "CmsIndexedField") {
                    // Items of the form CmsField("Heading", CmsFieldTypes.TEXT, something, CmsIndexedField.TYPE)
                    //console.log(`Found property [${item.key.name}] with field name [${args[0].value}], type [${args[1].property.name}] and indexedField [${args[3].property.name}]`);
                    results.push({
                        name: item.key.name,
                        fieldName: args[0].value,
                        fieldType: cmsFieldTypeToString(args[1].property.name),
                        indexedField: args[3].property.name
                    });
                } else {
                    // Items of the form CmsField("Heading", CmsFieldTypes.TEXT)
                    //console.log(`Found property [${item.key.name}] with field name [${args[0].value}] of type [${args[1].property.name}]`);
                    results.push({
                        name: item.key.name,
                        fieldName: args[0].value,
                        fieldType: cmsFieldTypeToString(args[1].property.name)
                    });
                }
            } else if (args[1].type === "StringLiteral" && args[1].value) {
                if (args.length > 3 && args[3].object && args[3].object.type === "Identifier" && args[3].object.name === "CmsIndexedField") {
                    // Items of the form CmsField("Heading", "FieldType", something, CmsIndexedField.TYPE)
                    //console.log(`Found property [${item.key.name}] with field name [${args[0].value}], type [${args[1].value}] and indexedField [${args[3].property.name}]`);
                    results.push({
                        name: item.key.name,
                        fieldName: args[0].value,
                        fieldType: cmsFieldTypeToString(args[1].value),
                        indexedField: args[3].property.name
                    });
                } else {
                    // Items of the form CmsField("Heading", "FieldType")
                    //console.log(`Found property [${item.key.name}] with field name [${args[0].value}] of type [${args[1].value}]`);
                    results.push({
                        name: item.key.name,
                        fieldName: args[0].value,
                        fieldType: cmsFieldTypeToString(args[1].value)
                    });
                }
            }
        }
    }
    return results;
};

const processCmsClassProperties = (content, page, declaration, imports) => {
    return { 
        folder: getClassPropertyValue(declaration, "cmsFolder", ""),
        zones: getClassPropertyValue(declaration, "cmsZones", [])
    };
};

const getClassPropertyValue = (declaration, name, defaultValue) => {
    const parts = declaration.body.body;
    for (let i = 0, len = parts.length; i < len; i++) {
        const part = parts[i];
        if (part.type === "ClassProperty"
            && part.key && part.key.type === "Identifier" && part.key.name === name
            && part.value) {
            if (part.value.type === "ArrayExpression") {
                // Items of the form
                // name:type = [value];
                return part.value.elements.map(e => e.value);
            } else {
                // Items of the form
                // name:type = value;
                return part.value.value;
            }
        }
    }
    return defaultValue;
};

const addDependency = (type, dependencies) => {
    if (utils.isCoreComponent(type)) return;
    if (dependencies.indexOf(type) < 0) dependencies.push(type);
};

const cmsFieldTypeToString = (cmsFieldType) => {
    if (cmsFieldType === "IMAGE") return "Src";
    if (cmsFieldType === cmsFieldType.toUpperCase()) {
        // TODO: robusify this!
        return cmsFieldType[0] + cmsFieldType.substr(1).toLowerCase();
    }
    return cmsFieldType;
};

const cmsIndexedFieldToString = (cmsIndexedField) => {
    if (!cmsIndexedField || cmsIndexedField === "NONE") return "";
    if (cmsIndexedField === "DATETIME") return "IndexedDateTime";
    if (cmsIndexedField === cmsIndexedField.toUpperCase()) {
        // TODO: robusify this!
        return "Indexed" + cmsIndexedField[0] + cmsIndexedField.substr(1).toLowerCase();
    }
    return "Indexed" + cmsIndexedField;
};

const getTemplates = (file, content) => {
    const reTemplate = /template\s*:\s*([`"'])\s*((?:.|\s)*?)\s*\1/;
    const reTemplateUrl = /templateUrl\s*:\s*(["'])([^"']*?)\1/;

    let match = reTemplate.exec(content);
    if (match && match.length > 1) return [match[2]];

    match = reTemplateUrl.exec(content);
    if (match && match.length > 1) {
        if (match[2].indexOf("http") < 0 && match[2].indexOf("//") !== 0) {
            const filepath = path.resolve(path.dirname(file), match[2]);
            if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) return [fs.readFileSync(filepath)];
        }
        return [match[2]];
    }

    return [];
};

const getScripts = (file, content) => {
    return [content];
};

const getStyles = (file, content) => { 
    const reStyleUrls = /styleUrls\s*:\s*\[\s*(((["'`])(?:[^"'`\\]|\\.)*?\3(?:\s*,\s*)?)+)\s*\]/;
    const reStyles = /styles\s*:\s*\[\s*(((["'`])(?:[^"'`\\]|\\.)*?\3(?:\s*,\s*)?)+)\s*\]/;
    const reIndividual = /(["'`])((?:[^"'`\\]|\\.)*?)\1/g

    let results = [];
    let match = reStyles.exec(content);
    if (match) {
        let itemMatch;
        while (itemMatch = reIndividual.exec(match[0])) {
            results.push(itemMatch[2].replace(/\\'/g, "'").replace(/\\`/g, "`").replace(/\\"/g, "\""));
        }
    }
    match = reStyleUrls.exec(content);
    if (match) {
        let itemMatch;
        while (itemMatch = reIndividual.exec(match[0])) {
            if (itemMatch[2].indexOf("http") < 0 && itemMatch[2].indexOf("//") !== 0) {
                const filepath = path.resolve(path.dirname(file), itemMatch[2]);
                if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) results.push(fs.readFileSync(filepath));
            }
        }
    }

    return results;
};

const getParts = (file, content) => {
    let result = _componentCache[file];
    if (!result) {
        result = { 
            templates: getTemplates(file, content),
            scripts: getScripts(file, content),
            styles: getStyles(file, content)
        };
        _componentCache[file] = result;
    }
    return result;
};

const readSourceFiles = (folder = "") => {
    const excludes = ["node_modules"];
    // NB: This is not foolproof, but the best I can do without working on the application directly
    if (!folder) folder = process.env.INIT_CWD || path.resolve('.');

    //console.log(`Looking in ${folder}`);
    let results = [];
    const entries = fs.readdirSync(folder, {withFileTypes: true});
    entries.filter(e => e.isFile()).forEach(file => {
        if (file.name.length > 3 && file.name.slice(-3) === ".ts") {
            const filePath = `${folder}${path.sep}${file.name}`;
            //console.log(`Processing ${filePath}`);
            const content = fs.readFileSync(filePath).toString();
            let match = reExportDefinition.exec(content);
            if (match) {
                let exp = [match[1]];
                while (match = reExportDefinition.exec(content)) exp.push(match[1]);
                results.push({name: file.name, path: filePath, content: content, exports: exp, isCmsCompoment: isCmsComponent(filePath, content)});
                //console.log(`Added result ${JSON.stringify(results[results.length - 1])}`);
            }
        }
    });
    entries.filter(e => e.isDirectory()).forEach(dir => {
        if (excludes.indexOf(dir.name) < 0) {
            results = results.concat(readSourceFiles(`${folder}${path.sep}${dir.name}`))
        }
    });

    return results;
}

const isCmsComponent = (file, content) => {
    const reComponent = new RegExp("class\\s+.*?\\s+extends\\s+CmsComponent");

    //console.log(`Checking if ${file} is a CMS component`);
    const { templates, scripts, styles } = getParts(file, content);
    return scripts.filter(s => reComponent.exec(s)).length > 0;
};

const _componentSourceCache = readSourceFiles();

module.exports = {
    parse: parse,
    isCmsComponent: isCmsComponent,
    readSourceFiles: readSourceFiles
};