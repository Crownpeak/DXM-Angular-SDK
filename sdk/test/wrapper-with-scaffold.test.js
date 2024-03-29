const assert = require('assert');
const parser = require('../classes/parsers/wrapper');
const fs = require('fs');
const path = require('path');

const file = path.resolve('./test/fixtures/wrapper-with-scaffold.html');
const content = fs.readFileSync(file, 'utf8');
const { wrapper, uploads } = parser.parse(file, content);

describe('Wrapper With Scaffold', () => {
    wrapper.head = wrapper.head.replace(/(?<!\r)\n/g, "\r\n");
    wrapper.foot = wrapper.foot.replace(/(?<!\r)\n/g, "\r\n");
    it('should find no uploads', () => {
        assert.strictEqual(uploads.length, 0);
    });
    it('should find a wrapper', () => {
        assert.strictEqual(wrapper.name, "Wrapper With Scaffold");
    });
    it('should have the expected header and footer', () => {
        assert.strictEqual(wrapper.head.length, 206);
        assert.strictEqual(wrapper.head.indexOf("<h1>Wrapper With Scaffold</h1>"), 153);
        assert.strictEqual(wrapper.foot.length, 89);
        assert.strictEqual(wrapper.foot.indexOf("<h2>Wrapper With Scaffold</h2>"), 26);
    });
    it('should have processed cp-scaffolds', () => {
        assert.strictEqual(wrapper.head.indexOf("cp-scaffold"), -1);
        assert.strictEqual(wrapper.head.indexOf("else"), -1);
        assert.strictEqual(wrapper.head.indexOf("{metadata}"), 102);
        assert.strictEqual(wrapper.head.indexOf("present"), 89);
        assert.strictEqual(wrapper.head.indexOf("absent"), -1);
    });
});