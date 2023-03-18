export type Action =
  | { type: 'SET_SETTINGS'; payload: State }
  | { type: 'UPDATE_SETTING'; payload: Setting };

type Setting = {
  name: string;
  value: string;
};

export type Settings = {
  ShowHeaderRow?: string;
  HeaderRowSettings?: string;
  ShowExitIntentModal?: string;
};

export type State = {
  settings: Settings;
};

export const initialState: State = {
  settings: {},
};

export const settingsReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_SETTINGS':
      return {
        ...state,
        settings: action.payload.settings,
      };
    case 'UPDATE_SETTING':
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.payload.name]: action.payload.value,
        },
      };
    default:
      return state;
  }
};
