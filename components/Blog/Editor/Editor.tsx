import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const Editor = ({ onChange }: { onChange: (data: string) => void }) => {
  const [postContent, setPostContent] = useState<string>('');

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
    <ReactQuill
      theme="snow"
      value={postContent}
      modules={modules}
      onChange={setPostContent}
    />
  );
};

export default Editor;
