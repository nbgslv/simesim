import { render } from '@testing-library/react';
import React from 'react';
import ShareButton from '../../../components/Blog/ShareButton/ShareButton';

describe('ShareButton', () => {
  const url = 'https://example.com';
  const title = 'Example Title';

  it('renders correctly', () => {
    const { container } = render(<ShareButton url={url} title={title} />);
    expect(container).toMatchSnapshot();
  });
});
