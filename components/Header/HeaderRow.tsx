import React, { useEffect } from 'react';
import { parse } from 'date-fns';
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
      const validFrom = parse(settings.validFrom, 'dd/MM/yyyy', new Date());
      const validTo = parse(settings.validTo, 'dd/MM/yyyy', new Date());
      const today = new Date();
      if (today < validFrom || today > validTo) {
        setShow(false);
      }
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
