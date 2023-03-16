import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useReducer,
} from 'react';
import { Action, State } from '../reducer/userReducer';

export type Context<A> = {
  state: State;
  dispatch: Dispatch<A>;
};

const UserStore = createContext<Context<Action> | null>(null);
UserStore.displayName = 'UserStore';

export const useUserStore = () => useContext(UserStore);

type Reducer<S, A> = (state: S, action: A) => S;

type UserStoreProviderProps<S, A> = {
  children: ReactNode;
  initialState: State;
  reducer: Reducer<S, A>;
};

const UserStoreProvider = ({
  children,
  initialState,
  reducer,
}: UserStoreProviderProps<State, Action>) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <UserStore.Provider value={{ state, dispatch }}>
      {children}
    </UserStore.Provider>
  );
};

export default UserStoreProvider;
