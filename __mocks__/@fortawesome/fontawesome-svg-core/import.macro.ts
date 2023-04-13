import { library } from '@fortawesome/fontawesome-svg-core';

// eslint-disable-next-line import/prefer-default-export
export const solid = jest.fn().mockImplementation((iconName) => ({ iconName }));

library.add({ icon: [0, 0, [], '', ''], prefix: 'fas', iconName: 'plus' });
