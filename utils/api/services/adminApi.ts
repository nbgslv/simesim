import {
  Prisma,
  User,
  PlanModel,
  Plan,
  Payment,
  PaymentMethod,
  Line,
  Bundle,
  DataBundle,
  Refill,
  Transaction,
  Country,
  Coupon,
  Inquiry,
  ApiKey,
} from '@prisma/client';
import { camelCase } from 'lodash';

type MapPrismaTypes<
  T extends Prisma.HasInclude | Prisma.HasSelect | undefined = undefined
> = [
  [
    T extends Prisma.HasInclude | Prisma.HasSelect
      ? User & Prisma.UserGetPayload<T>
      : User,
    {
      findFirst: Prisma.UserFindFirstArgs;
      findMany: Prisma.UserFindManyArgs;
      create: Prisma.UserCreateArgs;
      update: Prisma.UserUpdateArgs;
      updateMany: Prisma.UserUpdateManyArgs;
      delete: Prisma.UserDeleteArgs;
      deleteMany: Prisma.UserDeleteManyArgs;
      upsert: Prisma.UserUpsertArgs;
    }
  ],
  [
    T extends Prisma.HasInclude | Prisma.HasSelect
      ? PlanModel & Prisma.PlanModelGetPayload<T>
      : PlanModel,
    {
      findFirst: Prisma.PlanModelFindFirstArgs;
      findMany: Prisma.PlanModelFindManyArgs;
      create: Prisma.PlanModelCreateArgs;
      update: Prisma.PlanModelUpdateArgs;
      updateMany: Prisma.PlanModelUpdateManyArgs;
      delete: Prisma.PlanModelDeleteArgs;
      deleteMany: Prisma.PlanModelDeleteManyArgs;
      upsert: Prisma.PlanModelUpsertArgs;
    }
  ],
  [
    T extends Prisma.HasInclude | Prisma.HasSelect
      ? Plan & Prisma.PlanGetPayload<T>
      : Plan,
    {
      findFirst: Prisma.PlanFindFirstArgs;
      findMany: Prisma.PlanFindManyArgs;
      create: Prisma.PlanCreateArgs;
      update: Prisma.PlanUpdateArgs;
      updateMany: Prisma.PlanUpdateManyArgs;
      delete: Prisma.PlanDeleteArgs;
      deleteMany: Prisma.PlanDeleteManyArgs;
      upsert: Prisma.PlanUpsertArgs;
    }
  ],
  [
    T extends Prisma.HasInclude | Prisma.HasSelect
      ? Payment & Prisma.PaymentGetPayload<T>
      : Payment,
    {
      findFirst: Prisma.PaymentFindFirstArgs;
      findMany: Prisma.PaymentFindManyArgs;
      create: Prisma.PaymentCreateArgs;
      update: Prisma.PaymentUpdateArgs;
      updateMany: Prisma.PaymentUpdateManyArgs;
      delete: Prisma.PaymentDeleteArgs;
      deleteMany: Prisma.PaymentDeleteManyArgs;
      upsert: Prisma.PaymentUpsertArgs;
    }
  ],
  [
    T extends Prisma.HasInclude | Prisma.HasSelect
      ? PaymentMethod & Prisma.PaymentMethodGetPayload<T>
      : PaymentMethod,
    {
      findFirst: Prisma.PaymentMethodFindFirstArgs;
      findMany: Prisma.PaymentMethodFindManyArgs;
      create: Prisma.PaymentMethodCreateArgs;
      update: Prisma.PaymentMethodUpdateArgs;
      updateMany: Prisma.PaymentMethodUpdateManyArgs;
      delete: Prisma.PaymentMethodDeleteArgs;
      deleteMany: Prisma.PaymentMethodDeleteManyArgs;
      upsert: Prisma.PaymentMethodUpsertArgs;
    }
  ],
  [
    T extends Prisma.HasInclude | Prisma.HasSelect
      ? Line & Prisma.LineGetPayload<T>
      : Line,
    {
      findFirst: Prisma.LineFindFirstArgs;
      findMany: Prisma.LineFindManyArgs;
      create: Prisma.LineCreateArgs;
      update: Prisma.LineUpdateArgs;
      updateMany: Prisma.LineUpdateManyArgs;
      delete: Prisma.LineDeleteArgs;
      deleteMany: Prisma.LineDeleteManyArgs;
      upsert: Prisma.LineUpsertArgs;
    }
  ],
  [
    T extends Prisma.HasInclude | Prisma.HasSelect
      ? Bundle & Prisma.BundleGetPayload<T>
      : Bundle,
    {
      findFirst: Prisma.BundleFindFirstArgs;
      findMany: Prisma.BundleFindManyArgs;
      create: Prisma.BundleCreateArgs;
      update: Prisma.BundleUpdateArgs;
      updateMany: Prisma.BundleUpdateManyArgs;
      delete: Prisma.BundleDeleteArgs;
      deleteMany: Prisma.BundleDeleteManyArgs;
      upsert: Prisma.BundleUpsertArgs;
    }
  ],
  [
    T extends Prisma.HasInclude | Prisma.HasSelect
      ? DataBundle & Prisma.DataBundleGetPayload<T>
      : DataBundle,
    {
      findFirst: Prisma.DataBundleFindFirstArgs;
      findMany: Prisma.DataBundleFindManyArgs;
      create: Prisma.DataBundleCreateArgs;
      update: Prisma.DataBundleUpdateArgs;
      updateMany: Prisma.DataBundleUpdateManyArgs;
      delete: Prisma.DataBundleDeleteArgs;
      deleteMany: Prisma.DataBundleDeleteManyArgs;
      upsert: Prisma.DataBundleUpsertArgs;
    }
  ],
  [
    T extends Prisma.HasInclude | Prisma.HasSelect
      ? Refill & Prisma.RefillGetPayload<T>
      : Refill,
    {
      findFirst: Prisma.RefillFindFirstArgs;
      findMany: Prisma.RefillFindManyArgs;
      create: Prisma.RefillCreateArgs;
      update: Prisma.RefillUpdateArgs;
      updateMany: Prisma.RefillUpdateManyArgs;
      delete: Prisma.RefillDeleteArgs;
      deleteMany: Prisma.RefillDeleteManyArgs;
      upsert: Prisma.RefillUpsertArgs;
    }
  ],
  [
    Transaction,
    {
      findFirst: Prisma.TransactionFindFirstArgs;
      findMany: Prisma.TransactionFindManyArgs;
      create: Prisma.TransactionCreateArgs;
      update: Prisma.TransactionUpdateArgs;
      updateMany: Prisma.TransactionUpdateManyArgs;
      delete: Prisma.TransactionDeleteArgs;
      deleteMany: Prisma.TransactionDeleteManyArgs;
      upsert: Prisma.TransactionUpsertArgs;
    }
  ],
  [
    Country,
    {
      findFirst: Prisma.CountryFindFirstArgs;
      findMany: Prisma.CountryFindManyArgs;
      create: Prisma.CountryCreateArgs;
      update: Prisma.CountryUpdateArgs;
      updateMany: Prisma.CountryUpdateManyArgs;
      delete: Prisma.CountryDeleteArgs;
      deleteMany: Prisma.CountryDeleteManyArgs;
      upsert: Prisma.CountryUpsertArgs;
    }
  ],
  [
    T extends Prisma.HasInclude | Prisma.HasSelect
      ? Coupon & Prisma.CouponGetPayload<T>
      : Coupon,
    {
      findFirst: Prisma.CouponFindFirstArgs;
      findMany: Prisma.CouponFindManyArgs;
      create: Prisma.CouponCreateArgs;
      update: Prisma.CouponUpdateArgs;
      updateMany: Prisma.CouponUpdateManyArgs;
      delete: Prisma.CouponDeleteArgs;
      deleteMany: Prisma.CouponDeleteManyArgs;
      upsert: Prisma.CouponUpsertArgs;
    }
  ],
  [
    Inquiry,
    {
      findFirst: Prisma.InquiryFindFirstArgs;
      findMany: Prisma.InquiryFindManyArgs;
      create: Prisma.InquiryCreateArgs;
      update: Prisma.InquiryUpdateArgs;
      updateMany: Prisma.InquiryUpdateManyArgs;
      delete: Prisma.InquiryDeleteArgs;
      deleteMany: Prisma.InquiryDeleteManyArgs;
      upsert: Prisma.InquiryUpsertArgs;
    }
  ],
  [
    ApiKey,
    {
      findFirst: Prisma.ApiKeyFindFirstArgs;
      findMany: Prisma.ApiKeyFindManyArgs;
      create: Prisma.ApiKeyCreateArgs;
      update: Prisma.ApiKeyUpdateArgs;
      updateMany: Prisma.ApiKeyUpdateManyArgs;
      delete: Prisma.ApiKeyDeleteArgs;
      deleteMany: Prisma.ApiKeyDeleteManyArgs;
      upsert: Prisma.ApiKeyUpsertArgs;
    }
  ]
];

export type GetPrismaType<
  T,
  Include extends Prisma.HasInclude | Prisma.HasSelect | undefined = undefined
> = {
  [K in keyof MapPrismaTypes<Include> &
    string]: MapPrismaTypes<Include>[K] extends ReadonlyArray<unknown> // If this value is a tuple (AKA one of our map entries)
    ? // And the document node matches with the document node of this entry
      T extends MapPrismaTypes<Include>[K][0]
      ? // Then we have found our types
        MapPrismaTypes<Include>[K]
      : // Or not
        never
    : // Not even a map entry
      never;
}[keyof MapPrismaTypes<Include> & string];

export enum AdminApiAction {
  create = 'create',
  update = 'update',
  updateMany = 'updateMany',
  delete = 'delete',
  deleteMany = 'deleteMany',
  upsert = 'upsert',
}

export type AdminApiData<
  D extends Record<string, any>,
  Action extends keyof Types[1],
  Include extends Prisma.HasInclude | Prisma.HasSelect | undefined = undefined,
  Types extends MapPrismaTypes<Include>[number] = GetPrismaType<D, Include>
> = {
  input: Input<D, Action>;
  action: AdminApiAction;
};

export type Input<
  D extends Record<string, any>,
  Action extends keyof Types[1],
  Include extends Prisma.HasInclude | Prisma.HasSelect | undefined = undefined,
  Types extends MapPrismaTypes<Include>[number] = GetPrismaType<D, Include>
> = Types[1][Action];

export default class AdminApi {
  private readonly _apiPrefix = '/api';

  private readonly _endPoints: Record<string, string> = {
    inquiry: '/contact',
    country: '/country',
    coupon: '/coupon',
    order: '/order',
    plan: '/plan',
    planModel: '/planmodel',
    user: '/user',
    payment: '/payment',
    line: '/line',
    apiKey: '/auth/api/genkey',
  };

  callApi = async <
    D extends Record<string, any>,
    Action extends keyof Types[1],
    Include extends
      | Prisma.HasInclude
      | Prisma.HasSelect
      | undefined = undefined,
    Types extends MapPrismaTypes<Include>[number] = GetPrismaType<D, Include>
  >({
    method,
    action,
    model,
    input,
  }: {
    method: 'POST' | 'GET' | 'PUT' | 'DELETE';
    action?: AdminApiAction;
    // @ts-ignore
    model: keyof typeof this._endPoints;
    input: Input<D, Action, Include, Types>;
  }): Promise<Types[0]> => {
    try {
      const record = await fetch(
        // eslint-disable-next-line no-underscore-dangle
        `${process.env.NEXT_PUBLIC_BASE_URL}${this._apiPrefix}${
          // eslint-disable-next-line no-underscore-dangle
          this._endPoints[camelCase(model.toString())]
        }`,
        {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action, input }),
        }
      );
      const recordJson = await record.json();
      if (!recordJson.success)
        throw new Error(recordJson.message || 'Something went wrong');
      return recordJson.data;
    } catch (error) {
      console.error(error);
      throw new Error((error as Error).message);
    }
  };
}
