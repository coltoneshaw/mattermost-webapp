// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {KeyboardEvent, useCallback, useEffect, useState} from 'react';
import {createEditor, Transforms, Editor, BaseEditor, Text} from 'slate';
import {Slate, Editable, withReact, RenderElementProps, ReactEditor, RenderLeafProps} from 'slate-react';

// import 'prismjs/themes/prism.css';
import escapeHtml from 'escape-html';

import {CodeBlock, CodeLeaf, decorateCodeFunc} from './code_block';

const getPlaceholderValue = (placeholder: string | {id: string; defaultMessage: string} | undefined) => {
    if (!placeholder) {
        return '';
    }
    if (typeof placeholder === 'string') {
        return placeholder;
    }
    return placeholder.defaultMessage;
};

type Props = {
    placeholder?: string | {id: string; defaultMessage: string};
    defaultValue?: string;
    value?: string;
    handleAdvancedChange?: (value: string) => void;

}

type FormattedText = {
    text: string;
    bold?: true;
}

type ParagraphElement = {
    type: 'paragraph';
    children: FormattedText[];
}

type CodeElement = {
    type: 'code';
    language: 'javascript' | 'html' | 'css';
    children: FormattedText[];
}

type HeadingElement = {
    type: 'heading';
    level?: number;
    children: FormattedText[];
}

type CustomElement = ParagraphElement | HeadingElement | CodeElement;

const intitialValue = [
    {
        type: 'paragraph',
        children: [
            {text: ''},
        ],
    },
] as CustomElement[];

declare module 'slate' {
    interface CustomTypes {
        Editor: BaseEditor & ReactEditor;
        Element: CustomElement;
        Text: FormattedText;

    }
}

// const CodeElement = (props: RenderElementProps & {language: 'javascript' | 'html' | 'css'}) => {
//     return (
//         <div {...props.attributes}>
//             <Highlight
//                 style={{userSelect: 'none'}}
//                 className={`language-${props.language}`}
//                 contentEditable={false}
//             >

//                 {props.children}
//             </Highlight>
//         </div>

//     );
// };

const DefaultElement = (props: RenderElementProps) => {
    return <p {...props.attributes}>{props.children}</p>;
};

const serialize = (node: FormattedText) => {
    if (Text.isText(node)) {
        let string = escapeHtml(node.text);
        if (node.bold) {
            string = `**${string}**`;
        }
        return string;
    }
    return null;
};

const exportText = (node: CustomElement[]) => {
    const exportedText: string[] = [];
    node.forEach((element) => {
        const children = element.children.map((n) => serialize(n)).join('');

        if (element.type === 'code') {
            exportedText.push('```\n' + children + '\n```');
        }

        if (element.type === 'paragraph') {
            exportedText.push(children);
        }
    });

    return exportedText.join('\n');
};

// Define a React component to render leaves with bold text.
const Leaf = (props: RenderLeafProps) => {
    return (
        <span
            {...props.attributes}
            style={{fontWeight: props.leaf.bold ? 'bold' : 'normal'}}
        >
            {props.children}
        </span>
    );
};

const TextEditor = ({
    placeholder,
    defaultValue,
    handleAdvancedChange,
    value,
}: Props) => {
    const [editor, setEditor] = useState(() => withReact(createEditor()));

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement> | undefined) => {
        if (!event) {
            return;
        }
        if (event.key === 'Backspace') {
            Editor.deleteBackward(editor, {unit: 'character'});
        }

        if (event.key === 'Delete') {
            Editor.deleteForward(editor, {unit: 'character'});
        }

        if (event.key === '`' && event.ctrlKey) {
            event.preventDefault();

            const [match] = Editor.nodes(editor, {
                match: (n) => Editor.isBlock(editor, n) && n.type === 'code',
            });

            Transforms.setNodes(
                editor,
                {
                    type: match ? 'paragraph' : 'code',
                    language: match ? undefined : 'javascript',
                },
                {match: (n) => Editor.isBlock(editor, n)},
            );
        }

        if (event.key === 'b' && event.ctrlKey) {
            event.preventDefault();
            Transforms.setNodes(
                editor,
                {bold: true},
                {match: (n) => Text.isText(n), split: true},
            );
        }
    };

    const decorateCode = useCallback(

        // This may be where the performance issues come from
        (props) => decorateCodeFunc(editor, props),
        [editor],
    );

    const renderElement = useCallback((props: RenderElementProps) => {
        switch (props.element.type) {
        case 'code':
            return (
                <CodeBlock
                    {...props}
                />
            );
        default:
            return <DefaultElement {...props}/>;
        }
    }, []);

    const renderLeaf = useCallback((props: RenderLeafProps) => {
        return <Leaf {...props}/>;
    }, []);

    useEffect(() => {
        // setEditor(withReact(createEditor()));
    }, [handleAdvancedChange]);

    return (

        <Slate
            editor={editor}

            value={intitialValue}
            onChange={(value) => {
                if (handleAdvancedChange) {
                    handleAdvancedChange(exportText(value));
                }
            }}

        >
            <Editable
                renderLeaf={renderLeaf}
                placeholder={getPlaceholderValue(placeholder)}
                onKeyDown={onKeyDown}
                renderElement={renderElement}
                decorate={decorateCode}
                style={{
                    paddingTop: '13px',
                    paddingLeft: '16px',
                    paddingBottom: '12px',
                    paddingRight: '50px',
                }}
            />
        </Slate>

    );
};

export {
    TextEditor,
};
