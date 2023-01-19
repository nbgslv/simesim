import NiceModal, { bootstrapDialog, useModal } from '@ebay/nice-modal-react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import {
  GridCellParams,
  GridColumns,
  GridRowId,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { Post } from '@prisma/client';
import { format } from 'date-fns';
import { NextPageContext } from 'next';
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import AdminTable from '../../components/AdminTable/AdminTable';
import FormModal from '../../components/AdminTable/FormModal';
import AdminLayout from '../../components/Layouts/AdminLayout';
import prisma from '../../lib/prisma';
import AdminApi, { AdminApiAction } from '../../utils/api/services/adminApi';
import { verifyAdmin } from '../../utils/auth';
import AddBlogPost from '../../components/Offcanvas/Blog/AddBlogPost';
import AdminOffcanvas from '../../components/Offcanvas/AdminOffcanvas';
import PostData from '../../components/Offcanvas/Blog/PostData';
import AdminTableSwitch from '../../components/AdminTable/AdminTableSwitch';

type PostsAsAdminTableData = (GridValidRowModel & Post)[];

type BlogProps = {
  posts: PostsAsAdminTableData;
};

const Blog = ({ posts }: BlogProps) => {
  const [postsRows, setPostsRows] = useState<PostsAsAdminTableData>(posts);
  const [addRowLoading, setAddRowLoading] = useState<boolean>(false);
  const [changeShowLoading, setChangeShowLoading] = useState<GridRowId>('');
  const [postData, setPostData] = useState<Post | null>(null);
  const [adminApi] = useState(new AdminApi());
  const modal = useModal('add-posts');

  const handleShowToggle = async (checked: boolean, id: GridRowId) => {
    setChangeShowLoading(id);
    const post = postsRows.find((postOfPosts) => postOfPosts.id === id);
    if (post) {
      const updatedPost = await adminApi.callApi<Post, 'update'>({
        method: 'PUT',
        action: AdminApiAction.update,
        model: 'Post',
        input: {
          where: {
            id: id as string,
          },
          data: {
            show: checked,
          },
        },
      });
      setPostsRows((prev) =>
        prev.map((postOfPrevPosts) =>
          postOfPrevPosts.id === updatedPost.id ? updatedPost : postOfPrevPosts
        )
      );
    }
    setChangeShowLoading('');
  };

  const columns: GridColumns = [
    {
      field: 'id',
      headerName: 'ID',
    },
    {
      field: 'title',
      headerName: 'Title',
    },
    {
      field: 'slug',
      headerName: 'Slug',
    },
    {
      field: 'content',
      headerName: 'Content',
      renderCell: (params: GridCellParams) => (
        <Button onClick={() => setPostData(params.row)}>
          <FontAwesomeIcon icon={solid('up-right-from-square')} />
        </Button>
      ),
    },
    {
      field: 'coverImage',
      headerName: 'Cover',
      renderCell: (params: GridCellParams) => (
        <Image
          alt="Cover Image"
          src={`${process.env.NEXT_PUBLIC_DO_SPACE_URL}/${params.value}`}
          width={80}
          height={50}
        />
      ),
    },
    {
      field: 'show',
      headerName: 'Show',
      renderCell: (params: any) => (
        <AdminTableSwitch
          checked={params.value}
          onChange={handleShowToggle}
          rowId={params.id}
          row={params.row}
          loading={changeShowLoading}
        />
      ),
    },
    {
      field: 'views',
      headerName: 'Views',
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
    },
    {
      field: 'updatedAt',
      headerName: 'Updated At',
    },
  ];

  const handleDeleteRows = async (ids: GridRowId[]) => {
    await adminApi.callApi<Post, 'deleteMany'>({
      method: 'DELETE',
      action: AdminApiAction.deleteMany,
      model: 'Post',
      input: {
        where: {
          id: {
            in: ids as string[],
          },
        },
      },
    });
    setPostsRows(postsRows.filter((post) => !ids.includes(post.id!)));
  };

  const handleDeleteRow = async (id: GridRowId) => {
    await handleDeleteRows([id]);
  };

  const addRow = async (
    data: Post
  ): Promise<{ id: string; columnToFocus: undefined }> => {
    setAddRowLoading(true);
    const body = new FormData();
    body.append('title', data.title);
    body.append('slug', data.slug);
    body.append('content', data.content);
    body.append('coverImage', data.coverImage[0]);
    const newPost = await fetch('/api/blog', {
      method: 'POST',
      body,
    });
    const newPostJson = await newPost.json();
    setPostsRows([...postsRows, newPostJson.data]);
    setAddRowLoading(false);
    return { id: newPostJson.id, columnToFocus: undefined };
  };

  const showModal = async (): Promise<
    { id: string; columnToFocus: undefined } | Error
  > => {
    try {
      const addData = await NiceModal.show('add-posts');
      return await addRow(addData as Post);
    } catch (e) {
      modal.reject(e);
      return e as Error;
    } finally {
      await modal.hide();
      modal.remove();
    }
  };

  const handleUpdateRow = async (data: Post) => {
    const updatedPost = await adminApi.callApi<Post, 'update'>({
      method: 'PUT',
      action: AdminApiAction.update,
      model: 'Post',
      input: {
        where: {
          id: data.id,
        },
        data,
      },
    });
    setPostsRows(
      postsRows.map((post) => (post.id === data.id ? updatedPost : post))
    );
  };

  return (
    <AdminLayout title="Blog">
      <AdminTable
        data={postsRows}
        columns={columns}
        addRow={showModal}
        deleteRows={handleDeleteRows}
        deleteRow={handleDeleteRow}
        rowActions={['delete']}
      />
      <FormModal id="add-posts" {...bootstrapDialog(modal)} header={'Add Post'}>
        <AddBlogPost loading={addRowLoading} />
      </FormModal>
      <AdminOffcanvas
        onHide={() => setPostData(null)}
        show={!!postData}
        title={'Post'}
      >
        <PostData
          post={postData}
          onDataChange={(data) => handleUpdateRow(data as Post)}
        />
      </AdminOffcanvas>
    </AdminLayout>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  await verifyAdmin(context);
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
  const serializedPosts = posts.map((post) => ({
    ...post,
    createdAt: format(post.createdAt, 'dd/MM/yy kk:mm'),
    updatedAt: format(post.updatedAt, 'dd/MM/yy kk:mm'),
  }));

  return {
    props: {
      posts: serializedPosts,
    },
  };
}

export default Blog;
