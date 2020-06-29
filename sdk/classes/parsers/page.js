const babelParser = require("@babel/parser");

let _fileName = "";

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
                const wrapper = processCmsPage(content, ast, name, part.declaration, imports);
                const result = processCmsPageTemplate(content, name, template, null, imports);
                if (result) {
                    results.push({name: name, content: finalProcessMarkup(result), wrapper: wrapper});
                }
            }
        }
    }
    return results;
};

const initialProcessMarkup = (content) => {
    // TODO: find a way to run this without breaking the ability to make replacements
    // Remove any { and }
    return content.replace(/[{]|[}]/g, "");
};

const finalProcessMarkup = (content) => {
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
    const componentRegexs = [
        { source: "<([a-z0-9:-]*)(\\s*.*?)\\s+component\\s*=\\s*([\"'])([^\"']+)\\3([^>]*?)(><\\/\\1>|\\/>)", replacement: "<$1$2$5>{%%name%%}</$1>" },
    ];
    let result = template;
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
                const index = componentTypes[componentType] || 1;
                const suffix = index > 1 ? "_" + index + ":" + componentType : "";
                componentTypes[componentType] = index + 1;
                const replacement = componentRegexs[i].replacement.replace("%%name%%", componentType + suffix);
                //console.log(`Replacing [${match[0]}] with [${replacement}]`);
                result = result.replace(regex, replacement);
            }
            match = regex.exec(result);
        }
    }

    return result;
};

const processCmsPage = (content, ast, name, declaration, imports) => {
    _pageName = name;
    //console.log(`Processing CmsPage ${_pageName}`);
    let wrapper = null;
    const ctor = declaration.body.body.find(p => p.type === "ClassMethod" && p.key && p.key.name === "constructor");
    if (ctor) {
        const wrapperBody = ctor.body.body.find(p => p.type === "ExpressionStatement" 
            && p.expression.type && p.expression.type === "AssignmentExpression" 
            && p.expression.left && p.expression.left.property && p.expression.left.property.name === "cmsWrapper");
        if (wrapperBody) {
            wrapper = wrapperBody.expression.right.value;
            //console.log(`Found reference to wrapper [${wrapper}]`);
        }
    }
    return wrapper;
};

const isDropZoneComponent = (componentName, importDefinition) => {
    //console.warn(`TODO: robust checking for CmsDropZoneComponent inheritance`);
    return componentName === "DropZone";
};

module.exports = {
    parse: parse
};