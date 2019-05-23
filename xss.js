const xss = require('xss');
const commonmarkSpec = require('./src/lib/service/xss/commonmark-spec');
const xssOption = require('./src/lib/service/xss/recommended-whitelist');

// const html = `
// <code class='_class <a>_a</a>'>_code</code>
// <a href='https://google.com'>
//   <b test='a tag</a><div onclick=alert(1111)>asdf</div>'
// `;

const html = `
<noscript><img src="</noscript><img src=x onerror=alert(1)>"
`;

const tagWhiteList = xssOption.tags;
const attrWhiteList = xssOption.attrs;
const whiteListContent = {};

tagWhiteList.forEach((tag) => {
  whiteListContent[tag] = attrWhiteList;
});

const option = {
  stripIgnoreTag: true,
  stripIgnoreTagBody: false, // see https://github.com/weseek/growi/pull/505
  whiteList: whiteListContent,
  css: false,
  escapeHtml: (html) => { return html }, // resolve https://github.com/weseek/growi/issues/221
  onTag: (tag, html, options) => {
    console.log('----------------------------------------------------------------');
    console.log('tag', html, options);
    // pass autolink
    if (tag.match(commonmarkSpec.uriAutolinkRegexp) || tag.match(commonmarkSpec.emailAutolinkRegexp)) {
      return html;
    }
  },
  onTagAttr: (tag, name, value, isWhiteAttr) => {
    if (isWhiteAttr) {
      const escapedValue = value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      console.log('    - attr', 'before:', value);
      console.log('    - attr', 'after :', escapedValue);

      return `${name}=${escapedValue}`;
    }
    return `${name}=''`;
  },
  onIgnoreTagAttr: (tag, name, value, isWhiteAttr) => {
    return `${name}='onIgnoreTagAttr'`;
  },
};

const sanitized = xss(html, option);

console.log('----------------------------------------------------------------');
console.log(sanitized);
console.log('----------------------------------------------------------------');

{ /* <a>&lt;b test='a tag&lt;/a&gt;&lt;div onclick=alert(1111)&gt;asdf&lt;/div&gt;' */ }
