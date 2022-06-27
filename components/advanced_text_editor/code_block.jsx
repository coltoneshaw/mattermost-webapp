// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-coy.css';
import components from 'prismjs/components';
import {Text} from 'slate';

const push_string = (token, path, start, ranges, token_type = 'text') => {
    ranges.push({
        prism_token: token_type,
        anchor: {path, offset: start},
        focus: {path, offset: start + token.length},
    });
    start += token.length;
    return start;
};

// This recurses through the Prism.tokenizes result and creates stylized ranges based on the token type
const recurseTokenize = (token, path, ranges, start, parent_tag) => {
    // Uses the parent's token type if a Token only has a string as its content
    if (typeof token === 'string') {
        return push_string(token, path, start, ranges, parent_tag);
    }
    if ('content' in token) {
        // Calls recurseTokenize on nested Tokens in content
        for (const subToken of token.content) {
            start = recurseTokenize(subToken, path, ranges, start, token.type);
        }
        return start;
    }
};

const decorateCodeFunc = (editor, [node, path]) => {
    const ranges = [];
    if (!Text.isText(node)) {
        return ranges;
    }

    // You can use this to specify a language like in the gif if you add a bit of logic
    let language = 'html';
    const lang_aliases = {html: 'markup'};
    if (language in lang_aliases) {
        language = lang_aliases[language];
    }
    if (!(language in components.languages)) {
        return ranges;
    }

    // If you wanna import dynamically use this line, but beware the massive import (211 KB!!)
    // require(`prismjs/components/prism-${language}`)
    const tokens = Prism.tokenize(node.text, Prism.languages[language]);

    let start = 0;
    for (const token of tokens) {
        start = recurseTokenize(token, path, ranges, start);
    }
    return ranges;
};

// the different token types can be found on Prismjs website
const CodeLeaf = ({attributes, children, leaf}) => {
    return (
        <span
            {...attributes}
            className={`token ${leaf.prism_token}`}
        >
            {children}
        </span>
    );
};

const CodeBlock = (props) => {
    return (
        <pre
            className='code-block'
            style={{
                padding: '8px',
                backgroundColor: 'lightgray',
            }}
            {...props.attributes}
        >
            <code>{props.children}</code>
        </pre>
    );
};

export {CodeBlock, CodeLeaf, decorateCodeFunc};
