const assert = require('assert');
const parser = require('../classes/parsers/page');
const fs = require('fs');
const path = require('path');

const file = path.resolve('./test/fixtures/page-with-non-crownpeak.ts');
const content = fs.readFileSync(file, 'utf8');
const { pages, uploads } = parser.parse(content, file);

describe('Page With Non-Crownpeak', () => {
    if (pages.length > 0 && pages[0].content && pages[0].content.replace) {
        pages[0].content = pages[0].content.replace(/(?<!\r)\n/g, "\r\n");
    }
    it('should not find any uploads', () => {
        assert.strictEqual(uploads.length, 0);
    });
    it('should find one page', () => {
        assert.strictEqual(pages.length, 1);
        assert.strictEqual(pages[0].name, "PageWithNonCrownpeak");
        assert.strictEqual(pages[0].content, "<div>\r\n    <div>{SimpleComponent}</div>\r\n    <div>{ComponentInFiles}</div>\r\n    <div component=\"NonCrownpeakComponent\"></div>\r\n</div>");
    });
});