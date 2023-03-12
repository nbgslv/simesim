import React, { ReactNode } from 'react';
import { Line } from '@prisma/client';
import { ProgressBar, Spinner } from 'react-bootstrap';
import AdminApi from '../../../utils/api/services/adminApi';
import Section, { SectionType } from '../Section';

const LineData = ({
  line,
  onDataChange,
}: {
  line: Line;
  onDataChange?: (data: Line | null) => void;
}) => {
  const [adminApi] = React.useState<AdminApi>(new AdminApi());
  const [loading, setLoading] = React.useState<boolean>(false);

  if (!line || !line.id) return <>{'N/A'}</>;

  const data: SectionType<Line>[] = [
    {
      title: 'Line',
      id: 'line',
      data: [
        {
          title: 'ID',
          value: line.id,
          type: 'text',
        },
        {
          title: 'iccid',
          value: line.iccid,
          type: 'text',
        },
        {
          title: 'Deactivation Date',
          value: line.deactivationDate || 'N/A',
          type: 'date',
          editable: true,
        },
        {
          title: 'Usage Status',
          value:
            line.remainingUsageKb && line.allowedUsageKb
              ? line.allowedUsageKb / line.remainingUsageKb
              : 'N/A',
          type: 'number',
          RenderData: (value): ReactNode => (
            <div className="text-center">
              <strong>{line.status}</strong>
              <ProgressBar
                striped
                variant="info"
                now={value as number}
                label={
                  value !== 'N/A' ? `${(value as number).toFixed(2)}%` : value
                }
              />
              {line.allowedUsageKb &&
                new Intl.NumberFormat('he-IL').format(
                  line.allowedUsageKb / 1000
                )}
              MB /{' '}
              {line.remainingUsageKb &&
                new Intl.NumberFormat('he-IL').format(
                  line.remainingUsageKb / 1000
                )}
              MB
            </div>
          ),
        },
        {
          title: 'Days Remaining',
          value: line.remainingDays || 'N/A',
          type: 'number',
        },
        {
          title: 'Notes',
          value: line.notes,
          type: 'textarea',
          editable: true,
        },
        {
          title: 'LPA Code',
          value: line.lpaCode,
          type: 'text',
        },
        {
          title: 'MSISDN',
          value: line.msisdn || 'N/A',
          type: 'text',
        },
        {
          title: 'Created At',
          value: line.createdAt,
          type: 'date',
        },
        {
          title: 'Updated At',
          value: line.updatedAt,
          type: 'date',
        },
      ],
    },
  ];

  const handleLineUpdate = async (updatedLine: Line) => {
    try {
      const updatedUserRecord = await adminApi.callApi<Line, 'update'>({
        method: 'PUT',
        model: 'Line',
        input: {
          where: {
            id: line.id,
          },
          data: updatedLine,
        },
      });
      onDataChange?.(updatedUserRecord);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLineDelete = async () => {
    try {
      await adminApi.callApi<Line, 'delete'>({
        method: 'DELETE',
        model: 'Line',
        input: {
          where: {
            id: line.id,
          },
        },
      });
      onDataChange?.(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-100 h-100">
      {loading ? (
        <div className="w-100 h-100 d-flex justify-content-center align-items-center">
          <Spinner animation="border" role="status" />
        </div>
      ) : (
        <Section
          sections={data}
          onSave={handleLineUpdate}
          onDelete={handleLineDelete}
          setLoading={(value) => setLoading(value)}
        />
      )}
    </div>
  );
};

export default LineData;
