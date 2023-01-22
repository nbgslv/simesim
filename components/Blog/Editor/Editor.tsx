import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styles from './Editor.module.scss';

const Editor = ({
  onChange,
  value,
}: {
  onChange: (data: string) => void;
  value?: string;
}) => {
  const [postContent, setPostContent] = useState<string>('');

  useEffect(() => {
    if (value && !postContent) setPostContent(value);
  }, [value]);

  useEffect(() => {
    onChange(postContent);
  }, [postContent]);

  const modules = {
    toolbar: [
      [{ header: '1' }, { header: '2' }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [
        { list: 'ordered' },
        { list: 'bullet' },
        { indent: '-1' },
        { indent: '+1' },
      ],
      ['link', 'image', 'video'],
      ['clean'],
    ],
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    },
  };

  return (
    <div className={styles.main}>
      <ReactQuill
        theme="snow"
        value={postContent}
        modules={modules}
        onChange={setPostContent}
      />
    </div>
  );
};

export default Editor;
