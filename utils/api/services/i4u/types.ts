export enum ClearingType {
  'Regular' = 1,
  'Payments' = 2,
  'CreditPayments' = 3,
  'Refund' = 4,
}

export enum CompanyClearing {
  'UPay' = 6,
  'Meshulam' = 7,
  'YaadSarig' = 12,
}

type ItemForClearing = {
  name: string;
  quantity: number;
  price: string;
  taxRate: string;
};

export type CreatePaymentClearingParams = {
  fullName: string;
  phone: string;
  email: string;
  sum: number;
  planId: string;
  items: ItemForClearing[];
};

export type CreateCreditClearingRequestBody = {
  Invoice4UUserApiKey: string;
  Type: ClearingType;
  CreditCardCompanyType?: CompanyClearing;
  CustomerId?: number;
  IsAutoCreateCustomer: boolean;
  FullName: string;
  Phone: string;
  Email: string;
  Sum: number;
  Description: string;
  PaymentsNum: number;
  Currency: string;
  OrderIdClientUsage: string;
  IsDocCreation: boolean;
  DocHeadline: string;
  DocComments: string;
  IsManualDocCreationsWithParams: boolean;
  DocItemQuantity: string;
  DocItemPrice: string;
  DocItemTaxRate: string;
  DocItemName: string;
  IsGeneralClient: boolean;
  ReturnUrl: string;
  AddToken: boolean;
  AddTokenAndCharge: boolean;
  ChargeWithToken: boolean;
  Refund: boolean;
  IsStandingOrderClearance: boolean;
};

export type CreateCreditClearingRequestResponse = CreateCreditClearingRequestBody & {
  d: {
    __type: string;
    Errors: string[];
    Info: string[];
    OpenInfo: [
      {
        Key: 'ClearingTraceId';
        Value: string;
      },
      {
        Key: 'PaymentId';
        Value: string;
      },
      {
        Key: 'I4UClearingLogId';
        Value: string;
      }
    ];
    ClearingRedirectUrl: string;
    PaymentId?: string;
    Platform?: string;
  };
};

export type GetClearingLogResponse = {
  d: {
    __type: string;
    Errors: string[];
    Info: string[];
    OpenInfo: string[];
    Amount: number;
    ClearingCompany: number;
    ClearingCompanyName: string;
    ClearingConfirmationNumber: string;
    ClearingLogBaseId: number;
    ClearingTraceId: string;
    ClientName: string;
    CreditAmount: number;
    CreditNumber: string;
    CreditType: number;
    CreditTypeName: string;
    CreditedTransaction: boolean;
    Currency: number;
    CurrencyName: string;
    Date: string;
    DocId?: string;
    ErrorMessage: string;
    Id: number;
    IsBitPayment: boolean;
    IsCredit: boolean;
    IsDocumentCreated: boolean;
    IsSuccess: boolean;
    IsToken: boolean;
    LogType: number;
    OrganizationId: number;
    PaymentId: string;
    PaymentNumber: number;
    UpdateRequestLog: boolean;
    DocCreated?: boolean;
  };
};

export type GetClearingLogParamsResponse = {
  d: GetClearingLogResponse['d'][];
};
