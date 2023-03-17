import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useReducer,
} from 'react';
import { Action, State } from '../reducer/settingsReducer';

export type Context<A> = {
  state: State;
  dispatch: Dispatch<A>;
};

const SettingsStore = createContext<Context<Action> | null>(null);
SettingsStore.displayName = 'SettingsStore';

export const useSettingsStore = () => useContext(SettingsStore);

type Reducer<S, A> = (state: S, action: A) => S;

type SettingsStoreProviderProps<S, A> = {
  children: ReactNode;
  initialState: State;
  reducer: Reducer<S, A>;
};

const SettingsStoreProvider = ({
  children,
  initialState,
  reducer,
}: SettingsStoreProviderProps<State, Action>) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <SettingsStore.Provider value={{ state, dispatch }}>
      {children}
    </SettingsStore.Provider>
  );
};

export default SettingsStoreProvider;
