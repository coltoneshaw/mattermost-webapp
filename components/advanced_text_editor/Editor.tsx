// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useEffect, useState} from 'react';
import {convertToRaw, convertFromRaw, DraftEditorCommand, Editor, EditorState, RichUtils} from 'draft-js';
import 'draft-js/dist/Draft.css';
import {draftToMarkdown, markdownToDraft} from 'markdown-draft-js';

const getRawFromEditorState = (editorState: EditorState) => {
    const content = editorState.getCurrentContent();
    const rawObject = convertToRaw(content);
    const markdownString = draftToMarkdown(rawObject);
    return markdownString;
};

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

const TextEditor = ({
    placeholder, defaultValue,
    handleAdvancedChange,
    value,
}: Props) => {
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

    useEffect(() => {
        if (defaultValue) {
            setEditorState((state) => {
                const raw = getRawFromEditorState(state);
                if (raw !== defaultValue) {
                    const converted = EditorState.createWithContent(convertFromRaw(markdownToDraft(defaultValue)));
                    return converted;
                }
                return state;
            });
        }
    }, [defaultValue]);

    const handleChange = (editorState: EditorState) => {
        setEditorState(editorState);
        const raw = getRawFromEditorState(editorState);

        if (handleAdvancedChange) {
            handleAdvancedChange(raw);
        }
    };

    const handleKeyCommand = (command: DraftEditorCommand, editorState: EditorState) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);

        if (newState) {
            setEditorState(newState);
            return 'handled';
        }

        return 'not-handled';
    };

    return (

        <Editor
            editorState={editorState}
            onChange={handleChange}
            handleKeyCommand={handleKeyCommand}
            placeholder={getPlaceholderValue(placeholder)}
        />

    );
};

export {
    TextEditor,
};
