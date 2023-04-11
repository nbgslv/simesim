import React, { useEffect } from 'react';
import { Button } from 'react-bootstrap';
import styles from './AdminExpandableCell.module.scss';

const AdminExpandableCell = ({
  value,
  length = 50,
  shortValue,
}: {
  value: React.ReactNode | string;
  length?: number;
  shortValue?: string;
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const [typedValue, setTypedValue] = React.useState<React.ReactNode | string>(
    null
  );

  useEffect(() => {
    if (typeof value === 'string') {
      setTypedValue(value);
    } else if (React.isValidElement(value)) {
      setTypedValue(React.cloneElement(value, { ...value.props }));
    }
  }, [value]);

  if (!typedValue) return null;

  return (
    <div>
      <span>
        {expanded
          ? typedValue
          : shortValue?.substring?.(0, length) ??
            (typedValue as string).substring(0, length)}
      </span>
      &nbsp;
      {(shortValue ?? (typedValue as string)).length > length && (
        <Button
          className={styles.button}
          variant="link"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Hide' : 'Show more...'}
        </Button>
      )}
    </div>
  );
};

export default AdminExpandableCell;
