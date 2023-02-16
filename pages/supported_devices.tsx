import React, { useEffect } from 'react';
import { Accordion, Container } from 'react-bootstrap';
import MainLayout from '../components/Layouts/MainLayout';
import KeepGoApi from '../utils/api/services/keepGo/api';
import { KeepGoResponse } from '../utils/api/services/keepGo/types';
import { PhonesList } from '../components/CheckPhone/CheckPhoneSection';
import styles from '../styles/SupportedDevices.module.scss';

const SupportedDevices = ({ phonesList }: { phonesList: PhonesList[] }) => {
  const [phones, setPhones] = React.useState<
    {
      id: string;
      displayValue: string;
      exceptions: string[];
      models: string[];
    }[]
  >([]);

  useEffect(() => {
    if (phonesList) {
      setPhones(
        phonesList
          .map((list) =>
            list.brands.map((brand, id) => ({
              id: id.toString(),
              displayValue: brand.title,
              exceptions: brand.exceptions,
              models: brand.models,
            }))
          )
          .flat()
      );
    }
  }, [phonesList]);
  return (
    <MainLayout
      title="מכשירים נתמכים"
      metaCanonical={`${process.env.NEXT_PUBLIC_BASE_URL}/supported_devices`}
      hideJumbotron
    >
      <div className={styles.wrapper}>
        <Container className="p-2">
          <h1 className="text-center mb-4">מכשירים נתמכים</h1>
          <div className="mb-2">
            {phonesList.map((phoneList) => (
              <Accordion key={phoneList.type}>
                <Accordion.Item eventKey={phoneList.type}>
                  <Accordion.Header>{phoneList.type}</Accordion.Header>
                  {phoneList.brands.map((brand) => (
                    <Accordion.Body key={brand.title}>
                      <Accordion>
                        <Accordion.Header>{brand.title}</Accordion.Header>
                        <Accordion.Body>
                          <ul>
                            {brand.models.map((model) => (
                              <li key={model}>{model}</li>
                            ))}
                          </ul>
                          {brand.exceptions.length > 0 && (
                            <div className={styles.exceptions}>
                              <div className="text-danger small">לא נתמך</div>
                              <ul className={styles.exceptionsContent}>
                                {brand.exceptions.map((exception) => (
                                  <li className="small" key={exception}>
                                    {exception}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </Accordion.Body>
                      </Accordion>
                    </Accordion.Body>
                  ))}
                </Accordion.Item>
              </Accordion>
            ))}
          </div>
          <div className={styles.disclaimer}>
            <small style={{ fontSize: '0.7rem' }}>
              שימו לב: רשימת המכשירים התומכים בטכנולוגיית eSim מסופקת על ידי צד
              ג&apos;. מומלץ לקרוא את{' '}
              <a href="/terms" target="_blank">
                תנאי השימוש באתר
              </a>{' '}
              בעת הסתמכות על רשימה זו.
            </small>
          </div>
        </Container>
      </div>
    </MainLayout>
  );
};

export async function getStaticProps() {
  const keepGoApi = new KeepGoApi(
    process.env.KEEPGO_BASE_URL || '',
    process.env.KEEPGO_API_KEY || '',
    process.env.KEEPGO_ACCESS_TOKEN || ''
  );

  const phonesList = await keepGoApi.getEsimDevices();

  return {
    props: {
      phonesList: (phonesList as KeepGoResponse)?.data || [],
    },
  };
}

export default SupportedDevices;
