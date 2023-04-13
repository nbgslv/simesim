import { render } from '@testing-library/react';
import YouMightAlsoLike from '../../../components/Blog/YouMightAlsoLike';

describe('YouMightAlsoLike component', () => {
  const posts = [
    {
      id: '123ABCabc',
      title: 'Test Post',
      slug: 'test-post',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean vitae nunc facilisis, elementum mi sed, venenatis diam. Nunc erat nisl, consectetur in pellentesque vel, malesuada et velit. In vehicula sodales nulla, laoreet fermentum libero bibendum nec. Vivamus vel volutpat velit. Pellentesque ut justo in sapien posuere egestas in et sapien. Suspendisse potenti. Duis eleifend et magna a pellentesque. In ac pulvinar tellus, nec commodo nibh. Sed quis pulvinar leo, sit amet egestas quam. Curabitur congue ante ac dui aliquet, vitae faucibus odio mattis. Nunc lobortis quam et enim malesuada, et dignissim lorem rutrum. In in ligula vel leo eleifend posuere. Phasellus convallis, enim in facilisis laoreet, metus sem malesuada neque, eget sodales urna metus dictum diam. Nullam elementum sed ante vel pharetra. Proin tortor felis, tristique et metus in, gravida dignissim leo. Pellentesque vestibulum, enim vel gravida auctor, justo lorem dapibus ligula, eget elementum turpis augue auctor sapien.\n' +
        '\n' +
        'Donec magna eros, commodo et arcu id, auctor volutpat ligula. Nunc tortor erat, ornare at hendrerit id, interdum ut arcu. Fusce id erat non urna porttitor maximus quis ut ex. In eu erat bibendum, dictum lacus elementum, aliquet elit. Nam blandit tincidunt lectus at auctor. Sed gravida at metus auctor iaculis. Etiam efficitur tortor vel feugiat porta. Vivamus risus ex, faucibus ut bibendum imperdiet, porttitor sed eros. Sed vitae magna lectus. Praesent ut euismod eros. Sed non libero bibendum, mattis dolor ac, ultricies massa. Sed cursus lacinia sapien eget bibendum. Curabitur malesuada dui eu purus dictum bibendum.\n' +
        '\n' +
        'Nunc gravida bibendum velit et pulvinar. Sed nec molestie mauris, vitae auctor turpis. In justo nulla, laoreet non mattis vitae, semper a felis. Aenean rutrum ultricies ex sit amet aliquam. Suspendisse a iaculis arcu, at viverra ipsum. Vestibulum orci ante, tempus non magna eget, porttitor mollis erat. Sed sit amet nisl hendrerit, iaculis dui vestibulum, aliquam quam. Suspendisse malesuada aliquam erat sit amet volutpat. Mauris quis vestibulum ligula. Maecenas nec fringilla nisl. Aliquam consequat eros sed velit sagittis, et iaculis tellus consequat. Donec id elit consectetur, ornare justo sed, tincidunt mauris. Phasellus fringilla aliquam ante vel facilisis. Ut in pretium lectus. Donec eget scelerisque purus.',
      coverImage: 'https://picsum.photos/500/200',
      thumbnail: 'https://picsum.photos/32/32',
      show: true,
      views: 0,
      updatedAt: new Date(),
      createdAt: new Date(),
    },
    {
      id: '456DEFdef',
      title: 'Test Post 2',
      slug: 'test-post-2',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean vitae nunc facilisis, elementum mi sed, venenatis diam. Nunc erat nisl, consectetur in pellentesque vel, malesuada et velit. In vehicula sodales nulla, laoreet fermentum libero bibendum nec. Vivamus vel volutpat velit. Pellentesque ut justo in sapien posuere egestas in et sapien. Suspendisse potenti. Duis eleifend et magna a pellentesque. In ac pulvinar tellus, nec commodo nibh. Sed quis pulvinar leo, sit amet egestas quam. Curabitur congue ante ac dui aliquet, vitae faucibus odio mattis. Nunc lobortis quam et enim malesuada, et dignissim lorem rutrum. In in ligula vel leo eleifend posuere. Phasellus convallis, enim in facilisis laoreet, metus sem malesuada neque, eget sodales urna metus dictum diam. Nullam elementum sed ante vel pharetra. Proin tortor felis, tristique et metus in, gravida dignissim leo. Pellentesque vestibulum, enim vel gravida auctor, justo lorem dapibus ligula, eget elementum turpis augue auctor sapien.\n' +
        '\n' +
        'Donec magna eros, commodo et arcu id, auctor volutpat ligula. Nunc tortor erat, ornare at hendrerit id, interdum ut arcu. Fusce id erat non urna porttitor maximus quis ut ex. In eu erat bibendum, dictum lacus elementum, aliquet elit. Nam blandit tincidunt lectus at auctor. Sed gravida at metus auctor iaculis. Etiam efficitur tortor vel feugiat porta. Vivamus risus ex, faucibus ut bibendum imperdiet, porttitor sed eros. Sed vitae magna lectus. Praesent ut euismod eros. Sed non libero bibendum, mattis dolor ac, ultricies massa. Sed cursus lacinia sapien eget bibendum. Curabitur malesuada dui eu purus dictum bibendum.\n' +
        '\n' +
        'Nunc gravida bibendum velit et pulvinar. Sed nec molestie mauris, vitae auctor turpis. In justo nulla, laoreet non mattis vitae, semper a felis. Aenean rutrum ultricies ex sit amet aliquam. Suspendisse a iaculis arcu, at viverra ipsum. Vestibulum orci ante, tempus non magna eget, porttitor mollis erat. Sed sit amet nisl hendrerit, iaculis dui vestibulum, aliquam quam. Suspendisse malesuada aliquam erat sit amet volutpat. Mauris quis vestibulum ligula. Maecenas nec fringilla nisl. Aliquam consequat eros sed velit sagittis, et iaculis tellus consequat. Donec id elit consectetur, ornare justo sed, tincidunt mauris. Phasellus fringilla aliquam ante vel facilisis. Ut in pretium lectus. Donec eget scelerisque purus.',
      coverImage: 'https://picsum.photos/500/200',
      thumbnail: 'https://picsum.photos/32/32',
      show: true,
      views: 0,
      updatedAt: new Date(),
      createdAt: new Date(),
    },
  ];

  it('renders the component with the correct heading', () => {
    const { getByText } = render(<YouMightAlsoLike posts={posts} />);
    expect(
      getByText(/ציפור לחשה לנו שאולי תתעניין גם באלה/i)
    ).toBeInTheDocument();
  });

  it('renders a container for each post', () => {
    const { getAllByRole } = render(<YouMightAlsoLike posts={posts} />);
    const containers = getAllByRole('button');
    expect(containers.length).toEqual(posts.length);
  });

  it('renders the post title and cover image in each container', () => {
    const { getAllByRole } = render(<YouMightAlsoLike posts={posts} />);
    const containers = getAllByRole('button');
    containers.forEach((container, index) => {
      const title = container.querySelector('.postTitle');
      const image = container.querySelector('.coverImage');
      expect(title?.textContent).toEqual(posts[index].title);
      expect((image as HTMLImageElement).src).toContain(
        posts[index].coverImage
      );
      expect((image as HTMLImageElement).alt).toEqual(posts[index].title);
    });
  });
});
