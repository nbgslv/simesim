import NiceModal, { bootstrapDialog, useModal } from '@ebay/nice-modal-react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Divider } from '@mui/material';
import { differenceWith, fromPairs, isEqual, toPairs, camelCase } from 'lodash';
import React, { ReactNode } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import AsyncConfirmationModal from '../AdminTable/AsyncConfirmationModal';
import styles from './Section.module.scss';

export type DataType<T> = {
  title: string;
  value: NonNullable<T[keyof T]>;
  type: 'text' | 'textarea' | 'number' | 'date' | 'boolean' | 'select';
  editable?: boolean;
  options?: { value: string; label: string }[];
  RenderData?: (data: NonNullable<T[keyof T]>) => ReactNode;
  renderEditComponent?: (
    value: NonNullable<T[keyof T]>,
    onChange?: (data: NonNullable<T[keyof T]>) => void
  ) => ReactNode;
};

export type SectionType<T> = {
  title: string;
  id: string;
  data: DataType<T>[];
};

type SectionProps<T> = {
  sections: SectionType<T>[];
  setLoading?: (loading: boolean) => void;
  onSave?: (data: T) => Promise<void>;
  onDelete?: () => Promise<void>;
};

const Section = <T extends object>({
  sections,
  onSave,
  onDelete,
  setLoading,
}: SectionProps<T>) => {
  const [editData, setEditData] = React.useState<string>('');
  const modal = useModal('delete-modal');

  const sanitizeName = (name: string) => camelCase(name.replace(/\s+/g, ''));

  const { register, getValues, setValue } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: sections.reduce(
      (accSection, section) => ({
        ...accSection,
        ...section.data.reduce(
          (accData, data) => ({
            ...accData,
            [sanitizeName(data.title)]: data.editable ? data.value : undefined,
          }),
          {}
        ),
      }),
      {}
    ),
  });

  const handleSave = async () => {
    try {
      setLoading?.(true);
      const newData = fromPairs(
        differenceWith(
          toPairs(getValues()),
          toPairs(
            sections.reduce(
              (accSection, section) => ({
                ...accSection,
                ...section.data.reduce(
                  (accData, data) => ({
                    ...accData,
                    [sanitizeName(data.title)]: data.editable
                      ? data.value
                      : undefined,
                  }),
                  {}
                ),
              }),
              {}
            )
          ),
          isEqual
        )
      );
      await onSave?.(newData as T);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading?.(false);
      setEditData('');
    }
  };

  const handleEditStart = (sectionId: string) => {
    if (
      sections
        .find((section) => section.id === sectionId)
        ?.data.some((data) => data.editable)
    ) {
      setEditData(sectionId);
    }
  };

  const deleteRecord = async () => {
    try {
      const deleteModal = await NiceModal.show('delete-modal');
      if (deleteModal) {
        setLoading?.(true);
        await onDelete?.();
      }
    } catch (error) {
      console.error(error);
    } finally {
      await modal.hide();
      setLoading?.(false);
    }
  };

  return (
    <div className={styles.main}>
      {sections.map((section, i) => (
        <div key={section.title} className="mt-3">
          <div className="d-flex justify-content-between align-items-center p-2">
            <h5 className="mb-1 fw-bold">{section.title}</h5>
            <div className={styles.sectionButtons}>
              {i === 0 && (
                <Button
                  variant="outline-primary"
                  onClick={() => deleteRecord()}
                >
                  <FontAwesomeIcon icon={solid('trash')} />
                </Button>
              )}
              {editData === section.id ? (
                <>
                  <Button
                    variant="success"
                    onClick={() => handleSave()}
                    className="ms-2"
                  >
                    <FontAwesomeIcon icon={solid('check')} />
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setEditData('')}
                    className="ms-2"
                  >
                    <FontAwesomeIcon icon={solid('rectangle-xmark')} />
                  </Button>
                </>
              ) : (
                <>
                  {section.data.some((data) => data.editable) && (
                    <Button
                      variant="primary"
                      onClick={() => handleEditStart(section.id)}
                      className="ms-2"
                    >
                      <FontAwesomeIcon icon={solid('pen-to-square')} />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
          <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.6)' }} />
          {section.data.map((data) => (
            <React.Fragment key={data.title}>
              <div className="data-container">
                <Row
                  style={{
                    height: data.type === 'textarea' ? '5rem' : 'inherit',
                  }}
                >
                  <Col lg={6}>
                    <strong>{data.title}</strong>
                  </Col>
                  <Col lg={6} className={styles.leftData}>
                    {/* eslint-disable-next-line no-nested-ternary */}
                    {editData === section.id && data.editable
                      ? data.renderEditComponent?.(
                          data.value,
                          (dataOfEditable) =>
                            setValue(
                              sanitizeName(data.title) as never,
                              dataOfEditable as never
                            )
                        ) ??
                        (() => {
                          switch (data.type) {
                            case 'text':
                            case 'number':
                            case 'date':
                              return (
                                <input
                                  type={data.type}
                                  {...register(
                                    sanitizeName(data.title) as never
                                  )}
                                />
                              );
                            case 'textarea':
                              return (
                                <textarea
                                  {...register(
                                    sanitizeName(data.title) as never
                                  )}
                                />
                              );
                            case 'boolean':
                              return (
                                <input
                                  type="checkbox"
                                  {...register(
                                    sanitizeName(data.title) as never
                                  )}
                                />
                              );
                            case 'select':
                              return (
                                <select
                                  {...register(
                                    sanitizeName(data.title) as never
                                  )}
                                >
                                  {data.options?.map((option) => (
                                    <option
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              );
                            default:
                              return null;
                          }
                        })()
                      : data.RenderData
                      ? data.RenderData(data.value)
                      : (data.value as string)}
                  </Col>
                </Row>
              </div>
              {i !== sections.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </div>
      ))}
      <AsyncConfirmationModal
        id="delete-modal"
        title={'Delete'}
        body={
          'Are you sure you want to delete this? All the related data will be deleted.'
        }
        confirmAction={deleteRecord}
        confirmButtonText={'Delete'}
        cancelButtonText={'Cancel'}
        {...bootstrapDialog(modal)}
      />
    </div>
  );
};

export default Section;
