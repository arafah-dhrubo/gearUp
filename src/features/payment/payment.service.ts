import { prisma, Prisma } from '../../utils/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';
import { config } from '../../config/index.js';
import Stripe from 'stripe';

const stripe = config.stripeSecretKey ? new Stripe(config.stripeSecretKey) : null;

export const getUserPayments = (userId: string) =>
  prisma.payment.findMany({
    where: { userId },
    include: { rentalOrder: { include: { rentalItems: { include: { gearItem: { select: { id: true, name: true } } } } } } },
    orderBy: { createdAt: 'desc' },
  });

export const getPaymentById = async (paymentId: string, userId: string, userRole: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { rentalOrder: { include: { rentalItems: { include: { gearItem: true } } } } },
  });
  if (!payment) throw new AppError('Payment not found', 404);
  if (payment.userId !== userId && userRole === 'CUSTOMER') throw new AppError('Not authorized', 403);
  return payment;
};

export const createPaymentIntent = async (userId: string, rentalOrderId: string) => {
  if (!stripe) throw new AppError('Stripe is not configured', 500);

  const rental = await prisma.rentalOrder.findUnique({
    where: { id: rentalOrderId },
    include: { payments: true },
  });
  if (!rental) throw new AppError('Rental order not found', 404);
  if (rental.customerId !== userId) throw new AppError('Not authorized', 403);
  if (rental.status !== 'PLACED' && rental.status !== 'CONFIRMED') {
    throw new AppError('Order must be in PLACED or CONFIRMED status to pay', 400);
  }

  const existingPayment = rental.payments.find((p: { status: string }) => p.status === 'PENDING' || p.status === 'COMPLETED');
  if (existingPayment) throw new AppError('Payment already exists for this order', 400);

  const amountInCents = Math.round(rental.totalAmount * 100);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: 'usd',
    metadata: { rentalOrderId },
    automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
  });

  await prisma.payment.create({
    data: {
      transactionId: `pi-${paymentIntent.id}`,
      amount: rental.totalAmount,
      method: 'STRIPE',
      status: 'PENDING',
      stripePaymentIntentId: paymentIntent.id,
      stripeClientSecret: paymentIntent.client_secret,
      rentalOrderId,
      userId,
    },
  });

  return { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id, amount: rental.totalAmount };
};

export const confirmPayment = async (userId: string, paymentIntentId: string) => {
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
    include: { rentalOrder: true },
  });
  if (!payment) throw new AppError('Payment not found', 404);
  if (payment.userId !== userId) throw new AppError('Not authorized', 403);

  if (stripe) {
    let intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Auto-confirm in test mode if payment not yet completed
    if (intent.status === 'requires_payment_method' && config.stripeSecretKey.startsWith('sk_test_')) {
      // Use Stripe test token for 4242 card
      intent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: 'pm_card_visa',
      });
    }

    if (intent.status !== 'succeeded') throw new AppError(`Payment not completed. Status: ${intent.status}`, 400);
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: 'COMPLETED', paidAt: new Date() },
    });
    await tx.rentalOrder.update({
      where: { id: payment.rentalOrderId },
      data: { status: 'PAID' },
    });
  });

  return { paymentId: payment.id };
};

export const handleStripeWebhook = async (rawBody: Buffer, sig: string) => {
  if (!stripe) throw new AppError('Stripe is not configured', 500);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, config.stripeWebhookSecret);
  } catch {
    throw new AppError('Invalid webhook signature', 400);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const payment = await prisma.payment.findFirst({ where: { stripePaymentIntentId: paymentIntent.id } });
    if (payment && payment.status === 'PENDING') {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'COMPLETED', paidAt: new Date() },
        });
        await tx.rentalOrder.update({
          where: { id: payment.rentalOrderId },
          data: { status: 'PAID' },
        });
      });
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { status: 'FAILED' },
    });
  }

  return { received: true };
};
