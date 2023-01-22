import React, { ReactNode, useEffect } from 'react';
import { Post } from '@prisma/client';
import { Button, Spinner } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
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
  const [postData, setPostData] = React.useState<Post | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [adminApi] = React.useState<AdminApi>(new AdminApi());

  // TODO add change cover image

  useEffect(
    () => () => {
      setPostData(null);
    },
    []
  );

  useEffect(() => {
    (async () => {
      try {
        if (!postData) {
          const postContentFromApi = await fetch(`/api/blog/${post?.id}`);
          if (postContentFromApi.ok) {
            const content = await postContentFromApi.json();
            setPostData(content.data);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [post]);

  if (!post || !postData) return null;

  const data: SectionType<PostDataType>[] = [
    {
      title: 'Post',
      id: 'post',
      data: [
        {
          title: 'ID',
          value: postData.id,
          type: 'text',
        },
        {
          title: 'Title',
          value: postData.title,
          type: 'text',
          editable: true,
        },
        {
          title: 'Slug',
          value: postData.slug,
          type: 'text',
          editable: true,
        },
        {
          title: 'Description',
          value: postData.description,
          type: 'textarea',
        },
        {
          title: 'Content',
          value: postData.content,
          type: 'text',
          editable: true,
          RenderData: (postContentFromApi) => (
            <div
              style={{
                direction: 'rtl',
                textAlign: 'right',
              }}
              dangerouslySetInnerHTML={{ __html: postContentFromApi as string }}
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
          title: 'Cover Image',
          value: postData.coverImage,
          type: 'text',
          RenderData: (coverImage) => (
            <div className="d-flex flex-column align-items-center">
              <Button
                className="mt-2"
                href={`${process.env.NEXT_PUBLIC_DO_SPACE_URL}/${coverImage}`}
                target="_blank"
              >
                <FontAwesomeIcon
                  icon={solid('up-right-from-square')}
                  style={{ color: '#fff' }}
                />
              </Button>
            </div>
          ),
        },
        {
          title: 'Show',
          value: postData.show,
          type: 'boolean',
          editable: true,
        },
        {
          title: 'Views',
          value: postData.views,
          type: 'number',
        },
        {
          title: 'Created At',
          value: postData.createdAt,
          type: 'date',
        },
        {
          title: 'Updated At',
          value: postData.updatedAt,
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
      setPostData(updatedPostRecord);
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
