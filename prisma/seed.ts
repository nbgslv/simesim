import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const RECORDS = 1000;
const prisma = new PrismaClient();

async function generateFake_user() {
  return {
    email: faker.phone.number('05########'),
    emailEmail: faker.internet.email(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    emailVerified: faker.date.past(),
    role: faker.helpers.arrayElement(['ADMIN', 'USER']),
  };
}

async function generateFake_planModel({
  bundleIds,
  refillIds,
}: {
  bundleIds: string[];
  refillIds: Record<string, string[]>;
}) {
  const bundleId = faker.helpers.arrayElement(bundleIds);
  const refillId = faker.helpers.arrayElement(refillIds[bundleId]);

  return {
    name: faker.commerce.productName(),
    description: faker.lorem.lines(1),
    price: faker.commerce.price(1, 100, 2),
    vat: faker.datatype.boolean(),
    bundleId,
    refillId,
  };
}

async function generateFake_plan({
  planModelId,
  price,
  userId,
  paymentId,
}: {
  planModelId: string;
  price: number | null;
  userId: string;
  paymentId: string | null;
}) {
  return {
    friendlyId: faker.datatype.number({ max: 99999, min: 10000 }),
    planModelId,
    status: faker.helpers.arrayElement([
      'ACTIVE',
      'CANCELLED',
      'PENDING',
      'EXPIRED',
    ]),
    name: faker.commerce.productName(),
    price: price || faker.commerce.price(1, 100, 2),
    userId,
    paymentId: paymentId || null,
  };
}

async function generateFake_payment({ amount }: { amount: number }) {
  const docId = faker.helpers.maybe(() => faker.datatype.uuid(), {
    probability: 0.8,
  });
  return {
    clearingTraceId: faker.datatype.number({
      max: 9999999999999999,
      min: 1000000000000000,
    }),
    paymentId: faker.datatype.uuid(),
    i4UClearingLogId: faker.datatype.number({ max: 99999, min: 10000 }),
    clearingConfirmationNumber: faker.datatype.number({
      max: 9999999999999999,
      min: 1000000000000000,
    }),
    paymentDate: faker.date.past(),
    docId,
    isDocumentCreated: docId || null,
    amount,
    // paymentMethod: faker.helpers.maybe()
  };
}

async function generateFakeData<T>(data: T) {
  const records: T[] = [];
  for (let i = 0; i < RECORDS; i++) {
    records.includes(data);
  }
}

async function main() {
  return '';
}
