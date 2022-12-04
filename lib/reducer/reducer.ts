import { Session } from 'next-auth';

export type Action =
  | { type: 'SET_USER'; payload: State }
  | { type: 'REMOVE_USER' };

export type State = {
  user: Session['user'];
};

export const initialState: State = {
  user: {
    email: '',
    name: '',
    id: '',
    role: '',
    emailEmail: '',
    image: null,
  },
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
      };
    case 'REMOVE_USER':
      return {
        ...state,
        ...initialState,
      };
    default:
      return state;
  }
};
