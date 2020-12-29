const assert = require('assert');
const parser = require('../classes/parsers/component');
const fs = require('fs');
const path = require('path');

const file = path.resolve('./test/fixtures/component-with-non-crownpeak.ts');
const content = fs.readFileSync(file, 'utf8');
const { components, uploads } = parser.parse(content, file);

describe('Component With Non-Crownpeak', () => {
    it('should not find any uploads', () => {
        assert.strictEqual(uploads.length, 0);
    });
    it('should find two dependencies', () => {
        assert.strictEqual(components[0].dependencies.length, 2);
        assert.strictEqual(components[0].dependencies[0], "SimpleComponent");
        assert.strictEqual(components[0].dependencies[1], "ComponentInFiles");
    });
    it('should find one component', () => {
        assert.strictEqual(components.length, 1);
        assert.strictEqual(components[0].name, "ComponentWithNonCrownpeak");
        assert.strictEqual(components[0].content, "<div>\r\n    <h1>{Field1:Text}</h1>\r\n    <div>{SimpleComponent:SimpleComponent}</div>\r\n    <div>{ComponentInFiles:ComponentInFiles}</div>\r\n    <div component=\"NonCrownpeakComponent\"></div>\r\n</div>");
    });
});