import React, { useEffect } from 'react';
import Select, {
  Props,
  MultiValue,
  OptionsOrGroups,
  GroupBase,
} from 'react-select';
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
}: AdminSelectProps<IsMulti, Group>) => {
  const [selected, setSelected] = React.useState<
    AdminSelectOption | MultiValue<AdminSelectOption> | null
  >(null);

  useEffect(() => {
    if (defaultValue) {
      setSelected(defaultValue);
    }
  }, [defaultValue]);

  const handleSelect = (
    newValue: OnChangeValue<AdminSelectOption, IsMulti>
  ) => {
    setSelected(newValue);
    onSelect(newValue);
  };

  return (
    <Select
      value={selected}
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
        option: (baseStyle) => ({
          ...baseStyle,
          color: '#000',
        }),
      }}
      isMulti={isMulti}
      menuPortalTarget={document.body}
      menuPosition={'fixed'}
    />
  );
};

export default AdminSelect;
