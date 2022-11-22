export type Action =
  | { type: 'SET_USER'; payload: State }
  | { type: 'REMOVE_USER' };

export type State = {
  user: {
    email: string;
    id: string;
    image: null;
    name: string;
    role: string;
  };
};

export const initialState: State = {
  user: {
    email: '',
    name: '',
    id: '',
    role: '',
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
