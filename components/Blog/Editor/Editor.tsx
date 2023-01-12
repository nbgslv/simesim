import { FC } from 'react';
import {
  EditorComposer,
  Editor as LexicalEditor,
  ToolbarPlugin,
  AlignDropdown,
  BackgroundColorPicker,
  BoldButton,
  CodeFormatButton,
  FontFamilyDropdown,
  FontSizeDropdown,
  InsertDropdown,
  InsertLinkButton,
  ItalicButton,
  TextColorPicker,
  TextFormatDropdown,
  UnderlineButton,
  Divider,
} from 'verbum';

const Editor: FC = () => (
  <EditorComposer>
    <LexicalEditor hashtagsEnabled={true}>
      <ToolbarPlugin defaultFontSize="20px">
        <FontFamilyDropdown />
        <FontSizeDropdown />
        <Divider />
        <BoldButton />
        <ItalicButton />
        <UnderlineButton />
        <CodeFormatButton />
        <InsertLinkButton />
        <TextColorPicker />
        <BackgroundColorPicker />
        <TextFormatDropdown />
        <Divider />
        <InsertDropdown enablePoll={true} />
        <Divider />
        <AlignDropdown />
      </ToolbarPlugin>
    </LexicalEditor>
  </EditorComposer>
);

export default Editor;
