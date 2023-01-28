import { PaymentType } from '@prisma/client';
import {
  ClearingType,
  CompanyClearing,
  CreateCreditClearingRequestResponse,
  CreatePaymentClearingParams,
  GetClearingLogParamsResponse,
  GetClearingLogResponse,
} from './types';

export default class Invoice4UClearing {
  private readonly apiKey?: string;

  private readonly isTest: boolean;

  private readonly email?: string;

  private readonly password?: string;

  private token?: string;

  private readonly apiUrl =
    'https://api.invoice4u.co.il/Services/ApiService.svc';

  private readonly apiTestUrl =
    'https://private-anon-10dc6c5189-invoice4uclearingapis.apiary-mock.com/Services/ApiService.svc';

  private readonly returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/order`;

  private readonly callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/order/api/order/payment`;

  constructor(
    private readonly apiKeyToUse: string,
    private readonly emailToUse: string,
    private readonly passwordToUse: string,
    private readonly test: boolean
  ) {
    this.apiKey = apiKeyToUse;
    this.email = emailToUse;
    this.password = passwordToUse;
    this.isTest = test;
  }

  public async createPaymentClearing({
    fullName,
    phone,
    email,
    sum,
    planId,
    items,
    isBitPayment,
  }: CreatePaymentClearingParams): Promise<CreateCreditClearingRequestResponse> {
    try {
      const request = {
        Invoice4UUserApiKey: this.apiKey,
        Type: ClearingType.Regular.toString(),
        CreditCardCompanyType: CompanyClearing.Meshulam.toString(),
        IsAutoCreateCustomer: 'true', // if this is true, then a new client is created with the name, email and phone provided
        FullName: fullName,
        Phone: phone,
        Email: email,
        Sum: sum.toString(),
        Description: 'ה-eSim החדש שלך',
        PaymentsNum: (1).toString(),
        Currency: 'ILS',
        OrderIdClientUsage: planId,
        IsDocCreate: 'true', // if this is true, a document is generated
        DocHeadline: '',
        Comments: '',
        IsManualDocCreationsWithParams: 'false',
        DocItemQuantity: items
          .reduce((acc: number[], item) => [...acc, item.quantity], [])
          .join(' | '),
        DocItemPrice: items
          .reduce((acc: string[], item) => [...acc, item.price], [])
          .join(' | '),
        DocItemTaxRate: items
          .reduce((acc: string[], item) => [...acc, item.taxRate], [])
          .join(' | '),
        IsItemsBase64Encoded: 'false',
        DocItemName: items
          .reduce((acc: string[], item) => [...acc, item.name], [])
          .join(' | '),
        IsGeneralClient: 'true',
        IsBitPayment: isBitPayment,
        CallBackUrl: this.callbackUrl,
        ReturnUrl: `${this.returnUrl}/${planId}?paymentType=${
          isBitPayment ? PaymentType.BIT : PaymentType.CREDIT_CARD
        }`,
        AddToken: 'false',
        AddTokenAndCharge: 'false',
        ChargeWithToken: 'false',
        Refund: 'false',
        IsStandingOrderClearance: 'false',
      };

      const response = await fetch(
        `${this.isTest ? this.apiTestUrl : this.apiUrl}/ProcessApiRequestV2`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ request }),
        }
      );

      /** * Testing ** */
      if (this.test) {
        const resText = await response.text();
        const fixedResText = resText.replace(
          '"CustomerId": xxxxxx',
          '"CustomerId": 123456'
        );
        const resJson = JSON.parse(fixedResText);
        return { d: resJson } as CreateCreditClearingRequestResponse;
      }
      /** * Testing ** */

      return await response.json();
    } catch (e) {
      console.error(e);
      throw new Error((e as Error).message);
    }
  }

  public get isVerified(): boolean {
    return !!this.token;
  }

  public async verifyLogin(): Promise<string | undefined> {
    try {
      const response = await fetch(
        `${this.isTest ? this.apiTestUrl : this.apiUrl}/VerifyLogin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password,
          }),
        }
      );

      /** * Testing ** */
      if (this.test) {
        const token =
          '559E5F77C50312050A0B2C70F4044FDF019EE8862B5A4173E597FE3A4211B71CB226BA0C1313A837D1646E3E73A984F3D21A1547395BB5DDB4035D0CA2AF126A499C3448B121982FBAC0380EDE48C65BD1449D21196A7A93EEAB05F483582CFCE0BB5140AF21C5D3F482F3100CBAA2655323B888AA496BDA64DBBEE35035673ACC9F0AE0FB5DD9DA364EEB60F71C178119ED18DC8E406C83AE0D788D8C973E4CB82664D257A1E3031F7A7E1BBCEFE62A4B80599A416DE0AC8D6CBF86281041892CACA2FDFCC1DE52DA8C66041FF1DEB3DEB8C1A2A3E99AB1094F221653052C79426CF02DE32132A82C26265F86A27640D924599190B4695A603E31531C4772BD1EDF9ADFF9AA6AF14E0CDD9F519C77178C6DEF75ED7E807D4DD199BEA4E0E1E724436FD295A62B647A75ACE0661B5C0F6D52579AE91CADB7E0CCD46BFBAC1912729F471704644D917784BF6D9C79F6E0CC3F4113CE88187FB5721B50F95BE3538F3D010FBC82B3F6D997F4EF77FC3F18DD652B04C60BF0127DF7525C1D3002DB7201464104B6CE64AB90DD11FD3F393B542EE9A0942C3EB124173FE830E3A6CE893A6A021F056350ED2BA8879C17BD8496341DA71541D5EEDD521C134F233EC09A513DDE21FBCAAD6A508AAEB719D07E8F805EDE34AA3DF057163D4315EEFFBF7B8CB1ACE8F9394D8C509CAD49996D9F4E4206722CA7D2A5F0FE6E82F32F371F58A192A93D51A332E4C4B0A60DD7FEEA357E0F66EDC3E7588A838F72192879C2BEB819B4ACC3B57B55F83CAF4CDF357A04E4D3C241C9C7D53F6786DB221EAF45212012053BF264775D0640B8D842A9200C04DF899EFBE44689E5D83D61F6E6E3E246D0C83ABAA506432E5DF581F782797CB36CC00DC6B3B060009B4F9865C42EAF8110029E8A48546988528C9E947EACBE9C169958861C69EFC04A06EC426E877B8EEE9DBB2345B1B2C5F6E8375A5811AA91DEC6BBA8D021CF19107B7821681CFEEC55E4E14FBA23918DC308C7C8AF9873493FE4D1B2C218C6F1E347490ED9B529470BB7CC52C63E9C2A0C2E41E875A0ACCEF4828258A6B11C65C6DADF4D70CE';
        this.token = token;
        return token;
      }
      /** * Testing ** */

      const responseJson = await response.json();
      this.token = responseJson.d;

      return this.token;
    } catch (e) {
      console.error(e);
      throw new Error((e as Error).message);
    }
  }

  public async getClearingLog(
    clearingLogId: string
  ): Promise<GetClearingLogResponse> {
    try {
      if (!this.token) {
        throw new Error('You must verify your login first');
      }

      const response = await fetch(
        `${this.isTest ? this.apiTestUrl : this.apiUrl}/GetClearingLogById`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clearingLogId,
            token: this.token,
          }),
        }
      );

      /** * Testing ** */
      if (this.test) {
        const responseJson = await response.json();
        return { d: responseJson };
      }
      /** * Testing ** */

      return await response.json();
    } catch (e: unknown) {
      console.error(e);
      throw new Error((e as Error).message);
    }
  }

  public async getClearingLogByParams(
    paymentId: string
  ): Promise<GetClearingLogParamsResponse> {
    try {
      if (!this.token) {
        throw new Error('You must verify your login first');
      }

      const response = await fetch(
        `${this.isTest ? this.apiTestUrl : this.apiUrl}/GetClearingLogByParams`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            searchParams: {
              PaymentId: paymentId,
            },
            token: this.token,
          }),
        }
      );

      /** * Testing ** */
      if (this.test) {
        const responseJson = await response.json();
        return { d: responseJson };
      }
      /** * Testing ** */

      return await response.json();
    } catch (e: unknown) {
      console.error(e);
      throw new Error((e as Error).message);
    }
  }
}
