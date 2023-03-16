import React from 'react';
import Select, { Props, OptionsOrGroups, GroupBase } from 'react-select';
import { OnChangeValue } from 'react-select/dist/declarations/src/types';

export type AdminSelectOption = {
  label: string;
  value: string;
};

type AdminSelectProps<
  IsMulti extends boolean = false,
  Group extends GroupBase<AdminSelectOption> = GroupBase<AdminSelectOption>
> = Props<AdminSelectOption, IsMulti, Group> & {
  ariaLabel: string;
  options: OptionsOrGroups<AdminSelectOption, any>;
  onSelect: (option: OnChangeValue<AdminSelectOption, IsMulti>) => void;
  isMulti?: boolean;
};

const AdminSelect = <
  IsMulti extends boolean = false,
  Group extends GroupBase<AdminSelectOption> = GroupBase<AdminSelectOption>
>({
  ariaLabel,
  options,
  onSelect,
  defaultValue,
  isMulti,
  menuPosition = 'fixed',
}: AdminSelectProps<IsMulti, Group>) => {
  const handleSelect = (
    newValue: OnChangeValue<AdminSelectOption, IsMulti>
  ) => {
    onSelect(newValue);
  };

  return (
    <Select
      options={options as OptionsOrGroups<AdminSelectOption, any>}
      onChange={handleSelect}
      aria-label={ariaLabel}
      isSearchable
      styles={{
        container: (baseStyles) => ({
          ...baseStyles,
          width: '100%',
        }),
        menu: (baseStyles) => ({
          ...baseStyles,
          direction: 'ltr',
        }),
        menuPortal: (baseStyles) => ({
          ...baseStyles,
          zIndex: 9999,
        }),
        option: (baseStyle) => ({
          ...baseStyle,
          color: '#000',
        }),
      }}
      isMulti={isMulti}
      menuPortalTarget={document.body}
      menuPosition={menuPosition}
      defaultValue={defaultValue}
    />
  );
};

export default AdminSelect;
