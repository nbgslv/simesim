import React from 'react';
import { Form, Spinner } from 'react-bootstrap';
import PaymentGate from '../Payment/PaymentGate/PaymentGate';

const StepThree = ({ orderId }: { orderId?: string }) => {
  const [agreeToTerms, setAgreeToTerms] = React.useState<boolean>(false);

  if (!orderId)
    return (
      <div>
        <Spinner animation={'border'} />
      </div>
    );
  return (
    <div className="d-flex flex-column align-items-center">
      <Form.Check className="mb-4" type="checkbox" id="terms" reverse>
        <Form.Check.Input
          type="checkbox"
          checked={agreeToTerms}
          onChange={(e) => setAgreeToTerms(e.target.checked)}
        />
        <Form.Check.Label>
          אני מאשר/ת את&nbsp;
          <a href="/terms" target="_blank">
            תנאי השימוש
          </a>
        </Form.Check.Label>
      </Form.Check>
      <PaymentGate orderId={orderId} black={false} disable={!agreeToTerms} />
    </div>
  );
};

export default StepThree;
