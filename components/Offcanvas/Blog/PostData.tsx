import React, { ReactNode } from 'react';
import { Post } from '@prisma/client';
import { Spinner } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import AdminApi from '../../../utils/api/services/adminApi';
import Section, { SectionType } from '../Section';

export type PostDataType = Post;

const BlogEditor = dynamic(() => import('../../Blog/Editor/Editor'), {
  ssr: false,
});
const PostData = ({
  post,
  onDataChange,
}: {
  post: Post | null;
  onDataChange?: (data: Post | null) => void;
}) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [adminApi] = React.useState<AdminApi>(new AdminApi());

  if (!post) return null;

  const data: SectionType<PostDataType>[] = [
    {
      title: 'Post',
      id: 'post',
      data: [
        {
          title: 'ID',
          value: post.id,
          type: 'text',
        },
        {
          title: 'Title',
          value: post.title,
          type: 'text',
          editable: true,
        },
        {
          title: 'Slug',
          value: post.slug,
          type: 'text',
          editable: true,
        },
        {
          title: 'Content',
          value: post.content,
          type: 'text',
          editable: true,
          RenderData: (postContent) => (
            <div
              dangerouslySetInnerHTML={{ __html: postContent as string }}
            ></div>
          ),
          renderEditComponent: (value, onChange) =>
            (
              <BlogEditor
                value={value as string}
                onChange={(postContentData) =>
                  onChange?.(postContentData as string)
                }
              />
            ) as ReactNode,
        },
        {
          title: 'Created At',
          value: post.createdAt,
          type: 'date',
        },
        {
          title: 'Updated At',
          value: post.updatedAt,
          type: 'date',
        },
      ],
    },
  ];

  const handlePostUpdate = async (updatedPost: Post) => {
    try {
      const updatedPostRecord = await adminApi.callApi<Post, 'update'>({
        method: 'PUT',
        model: 'Post',
        input: {
          where: {
            id: post.id,
          },
          data: updatedPost,
        },
      });
      onDataChange?.(updatedPostRecord);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePostDelete = async () => {
    try {
      await adminApi.callApi<Post, 'delete'>({
        method: 'DELETE',
        model: 'Post',
        input: {
          where: {
            id: post.id,
          },
        },
      });
      onDataChange?.(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-100 h-100">
      {loading ? (
        <div className="w-100 h-100 d-flex justify-content-center align-items-center">
          <Spinner animation="border" role="status" />
        </div>
      ) : (
        <>
          <Section<Post>
            sections={data}
            onSave={handlePostUpdate}
            onDelete={handlePostDelete}
            setLoading={(value: boolean) => setLoading(value)}
          />
        </>
      )}
    </div>
  );
};

export default PostData;
