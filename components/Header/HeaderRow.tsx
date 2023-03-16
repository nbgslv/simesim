import React, { useEffect } from 'react';
import { Context, useSettingsStore } from '../../lib/context/SettingsStore';
import { Action } from '../../lib/reducer/settingsReducer';

const HeaderRow = () => {
  const { state } = useSettingsStore() as Context<Action>;
  const [content, setContent] = React.useState<string>('');
  const [show, setShow] = React.useState<boolean>(false);

  useEffect(() => {
    if (state.settings && state.settings.HeaderRowSettings) {
      const { ShowHeaderRow, HeaderRowSettings } = state.settings;
      const settings = JSON.parse(HeaderRowSettings);
      setContent(settings.content);
      setShow(ShowHeaderRow === 'true');
      if (document !== undefined) {
        const style = document.createElement('style');
        style.append(document.createTextNode(settings.styles));
        document.head.appendChild(style);
      }
    }
  }, [state.settings]);

  return show ? <div dangerouslySetInnerHTML={{ __html: content }} /> : null;
};

export default HeaderRow;
