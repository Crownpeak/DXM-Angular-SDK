const babelParser = require("@babel/parser");
const cssParser = require("./css");
const utils = require("crownpeak-dxm-sdk-core/lib/crownpeak/utils");
const component = require("./component");

let _fileName = "";
const _componentSourceCache = component.readSourceFiles();

const reTemplate = /template\s*:\s*`\s*((.|\s)*?)\s*`/;

const parse = (content, file) => {
    _fileName = file;
    let match = reTemplate.exec(content);
    if (!match) return;
    let template = match[1];

    const ast = babelParser.parse(content, {
        sourceType: "module",
        plugins: ["typescript", "decorators-legacy", "classProperties"]
    });
    //console.log(JSON.stringify(ast));
    if (ast.errors && ast.errors.length > 0) {
        console.warn(`PAGE: Skipping due to errors`);
        return;
    }

    let results = [];
    let uploads = [];
    let imports = [];
    const bodyParts = ast.program.body;
    for (let i = 0, len = bodyParts.length; i < len; i++) {
        const part = bodyParts[i];
        if (part.type === "ImportDeclaration" && part.specifiers && part.specifiers.length > 0) {
            for (let i in part.specifiers) {
                const specifier = part.specifiers[i];
                if ((specifier.type === "ImportDefaultSpecifier" || specifier.type === "ImportSpecifier")
                    && specifier.local && specifier.local.type === "Identifier") {
                    //console.log(`Found import ${specifier.local.name}, ${part.source.value}`);
                    imports.push({name: specifier.local.name, source: part.source.value});
                }
            }
        }
        else if (part.type === "ExportDefaultDeclaration" || part.type === "ExportNamedDeclaration") {
            const extnds = part.declaration.superClass;
            let name = part.declaration.id;
            if (extnds && (extnds.name === "CmsDynamicPage" || extnds.name === "CmsStaticPage") && name) {
                name = name.name;
                //console.log(`Found page ${name} extending ${extnds.name}`);
                const props = processCmsPage(content, ast, name, part.declaration, imports);
                const result = processCmsPageTemplate(content, name, template, null, imports);
                if (result) {
                    const processedResult = utils.replaceAssets(file, finalProcessMarkup(result), cssParser);
                    uploads = uploads.concat(processedResult.uploads);
                    results.push({name: name, content: processedResult.content, wrapper: props.wrapper, useTmf: props.useTmf === true, useMetadata: props.useMetadata === true, suppressFolder: props.suppressFolder === true, suppressModel: props.suppressModel === true});
                }
            }
        }
    }
    return { pages: results, uploads: uploads };
};

const initialProcessMarkup = (content) => {
    // TODO: find a way to run this without breaking the ability to make replacements
    // Remove any { and }
    return content.replace(/[{]|[}]/g, "");
};

const finalProcessMarkup = (content) => {
    content = content.replace(/\s+\*ngIf=(["']?)isLoaded\1/ig, "");
    // Replacements from .cpscaffold.json file
    content = utils.replaceMarkup(content);
    return trimSharedLeadingWhitespace(content);
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
        if (match && match[0].length) maxLeader = Math.min(maxLeader, match[0].length);
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

const processCmsPageTemplate = (content, name, template, components, imports) => {
    const scaffoldPreRegexs = [
        { source: "<!--\\s*cp-scaffold\\s*((?:.|\\r|\\n)*?)\\s*else\\s*-->\\s*((?:.|\\r|\\n)*?)\\s*<!--\\s*\\/cp-scaffold\\s*-->", replacement: "<!-- cp-pre-scaffold $1 /cp-pre-scaffold -->" },
        { source: "<!--\\s*cp-scaffold\\s*((?:.|\\r|\\n)*?)\\s*\\/cp-scaffold\\s*-->", replacement: "$1"}
    ];
    const scaffoldPostRegexs = [
        { source: "<!--\\s*cp-pre-scaffold\\s*((?:.|\\r|\\n)*?)\\s*\\/cp-pre-scaffold\\s*-->", replacement: "$1"}
    ];
    const componentRegexs = [
        { source: "<([a-z0-9:-]*)(\\s*.*?)\\s+component\\s*=\\s*([\"'])([^\"']+)\\3([^>]*?)(><\\/\\1>|\\/>)", replacement: "<$1$2$5>{%%name%%}</$1>" },
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
    for (let i = 0, len = componentRegexs.length; i < len; i++) {
        const regex = new RegExp(componentRegexs[i].source);
        let match = regex.exec(result);
        let componentTypes = {};
        while (match) {
            const componentType = match[4];
            if (isDropZoneComponent(componentType)) {
                const replacement = "<DropZone$2$5></DropZone>";
                result = result.replace(regex, replacement);
            } else {
                const sourceFiles = _componentSourceCache.filter(c => c.isCmsCompoment && c.exports.indexOf(componentType) >= 0);
                //console.log(`Found ${sourceFiles.length} of ${_componentSourceCache.length} files exporting ${componentType}`);
                if (sourceFiles.length > 0) {
                    const index = componentTypes[componentType] || 1;
                    const suffix = index > 1 ? "_" + index + ":" + componentType : "";
                    componentTypes[componentType] = index + 1;
                    const replacement = componentRegexs[i].replacement.replace("%%name%%", componentType + suffix);
                    //console.log(`Replacing [${match[0]}] with [${replacement}]`);
                    result = result.replace(regex, replacement);
                } else break;
            }
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

const processCmsPage = (content, ast, name, declaration, imports) => {
    _pageName = name;
    //console.log(`Processing CmsPage ${_pageName}`);
    const ctor = declaration.body.body.find(p => p.type === "ClassMethod" && p.key && p.key.name === "constructor");
    if (ctor) {
        return processCmsConstructor(content, declaration, ctor, imports);
    }
    return {};
};

const processCmsConstructor = (content, page, ctor, imports) => {
    return { 
        suppressFolder: getConstructorAssignedValue(ctor, "cmsSuppressFolder", false),
        suppressModel: getConstructorAssignedValue(ctor, "cmsSuppressModel", false),
        useTmf: getConstructorAssignedValue(ctor, "cmsUseTmf", false),
        useMetadata: getConstructorAssignedValue(ctor, "cmsUseMetadata", false),
        wrapper: getConstructorAssignedValue(ctor, "cmsWrapper", undefined)
    };
};

const getConstructorAssignedValue = (ctor, name, defaultValue) => {
    const parts = ctor.body.body;
    for (let i = 0, len = parts.length; i < len; i++) {
        const part = parts[i];
        if (part.type === "ExpressionStatement"
            && part.expression && part.expression.type === "AssignmentExpression"
            && part.expression.operator === "=") {
            if (part.expression.left && part.expression.left.type === "Identifier" 
                && part.expression.left.name === name
                && part.expression.right) {
                // Items of the form
                // name = value;
                return part.expression.right.value;
            } else if (part.expression.left && part.expression.left.type === "MemberExpression"
                && part.expression.left.object && part.expression.left.object.type === "ThisExpression"
                && part.expression.left.property && part.expression.left.property.name === name
                && part.expression.right) {
                // Items of the form
                // this.name = value;
                return part.expression.right.value;
            } else if (part.expression.left && part.expression.left.type === "MemberExpression"
                && part.expression.left.object && part.expression.left.object.type === "ThisExpression"
                && part.expression.left.property && part.expression.left.property.type === "StringLiteral"
                && part.expression.left.property.value === name
                && part.expression.right) {
                // Items of the form
                // this["name"] = value;
                return part.expression.right.value;
            }
        }
    }
    return defaultValue;
};

const isDropZoneComponent = (componentName, importDefinition) => {
    //console.warn(`TODO: robust checking for CmsDropZoneComponent inheritance`);
    return componentName === "DropZone";
};

module.exports = {
    parse: parse
};