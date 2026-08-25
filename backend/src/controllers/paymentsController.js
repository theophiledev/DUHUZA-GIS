const { z } = require('zod');
const crypto = require('crypto');
const prisma = require('../config/db');

/**
 * MTN MoMo integration notes (FR42-FR46, BR13, BR14)
 * ----------------------------------------------------
 * This is a scaffold, not a production-ready MoMo client. Before going
 * live you need to:
 *   1. Register at the MTN MoMo Developer Portal, get sandbox API user +
 *      API key for the "Collections" product.
 *   2. Set MOMO_SUBSCRIPTION_KEY, MOMO_API_USER, MOMO_API_KEY,
 *      MOMO_TARGET_ENVIRONMENT, MOMO_CALLBACK_HOST in .env.
 *   3. Replace the fetch() stub in `initiateMomoRequest` with a real
 *      call to POST /collection/v1_0/requesttopay.
 *   4. Verify MoMo's webhook signature/IP allowlist in `momoCallback`
 *      before trusting the payload — never mark a transaction
 *      SUCCESSFUL from an unverified request (BR14).
 *
 * CRITICAL RULE (BR13/BR14): a Transaction going SUCCESSFUL only ever
 * flips `isPromoted` — it must NEVER touch a listing's approval status
 * (status field on Listing/MarketItem/ServiceProvider/Job). Promotion
 * and approval are two completely separate gates.
 */

const REFERENCE_MODEL = {
  LISTING: 'listing',
  MARKET_ITEM: 'marketItem',
  SERVICE: 'serviceProvider',
  JOB: 'job',
};

const requestSchema = z.object({
  referenceType: z.enum(['LISTING', 'MARKET_ITEM', 'SERVICE', 'JOB']),
  referenceId: z.string().uuid(),
  amount: z.number().positive(),
});

// FR44 step 1: user initiates payment -> we create a PENDING transaction
// and call MoMo's Request-to-Pay API.
async function initiateMomoRequest(req, res) {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { referenceType, referenceId, amount } = parsed.data;

  // Confirm the referenced item exists and belongs to this user before
  // letting them pay to promote it.
  const modelName = REFERENCE_MODEL[referenceType];
  const record = await prisma[modelName].findUnique({ where: { id: referenceId } });
  if (!record) return res.status(404).json({ error: 'Referenced item not found' });

  const ownerField = { listing: 'agentId', marketItem: 'sellerId', serviceProvider: 'userId', job: 'employerId' }[modelName];
  if (record[ownerField] !== req.user.id) return res.status(403).json({ error: 'You do not own this item' });

  const transaction = await prisma.transaction.create({
    data: { userId: req.user.id, referenceType, referenceId, amount, status: 'PENDING' },
  });

  // --- STUB: replace with a real MoMo Request-to-Pay call ---
  // const momoRef = crypto.randomUUID();
  // await fetch(`${process.env.MOMO_BASE_URL}/collection/v1_0/requesttopay`, {
  //   method: 'POST',
  //   headers: {
  //     'X-Reference-Id': momoRef,
  //     'X-Target-Environment': process.env.MOMO_TARGET_ENVIRONMENT,
  //     'Ocp-Apim-Subscription-Key': process.env.MOMO_SUBSCRIPTION_KEY,
  //     Authorization: `Bearer ${await getMomoAccessToken()}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     amount: String(amount),
  //     currency: 'RWF',
  //     externalId: transaction.id,
  //     payer: { partyIdType: 'MSISDN', partyId: req.user.phone },
  //     payerMessage: `Promote ${referenceType}`,
  //     payeeNote: transaction.id,
  //   }),
  // });
  const momoRef = crypto.randomUUID(); // placeholder until real integration

  await prisma.transaction.update({ where: { id: transaction.id }, data: { momoTransactionRef: momoRef } });

  return res.status(202).json({
    transactionId: transaction.id,
    status: 'PENDING',
    message: 'Approve the payment on your phone via the MoMo PIN prompt.',
  });
}

// FR44 step 2: MoMo's async webhook calls this once the user approves/declines.
async function momoCallback(req, res) {
  // TODO: verify the request is genuinely from MTN before trusting it —
  // e.g. check a shared signing secret, or restrict this route to MTN's
  // published IP ranges at the reverse-proxy level. Do NOT remove this
  // check in production; without it, anyone could POST here and fake a
  // successful payment (this is exactly what BR14 guards against).
  const isVerified = verifyMomoSignature(req);
  if (!isVerified) return res.status(401).json({ error: 'Unverified callback' });

  const { referenceId: transactionId, status } = req.body; // shape depends on real MoMo payload
  const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
  if (!transaction) return res.status(404).json({ error: 'Unknown transaction' });

  const newStatus = status === 'SUCCESSFUL' ? 'SUCCESSFUL' : 'FAILED';

  await prisma.$transaction(async (tx) => {
    await tx.transaction.update({
      where: { id: transaction.id },
      data: { status: newStatus, confirmedAt: new Date() },
    });

    // BR13: only flip isPromoted — never touch approval status.
    if (newStatus === 'SUCCESSFUL') {
      const modelName = REFERENCE_MODEL[transaction.referenceType];
      const promotedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7-day promotion window
      await tx[modelName].update({
        where: { id: transaction.referenceId },
        data: { isPromoted: true, promotedUntil },
      });
    }
  });

  return res.json({ received: true });
}

function verifyMomoSignature(req) {
  // Placeholder — implement per MTN's actual callback auth mechanism
  // once you have sandbox/production credentials.
  return true;
}

async function myTransactions(req, res) {
  const transactions = await prisma.transaction.findMany({
    where: { userId: req.user.id },
    orderBy: { initiatedAt: 'desc' },
  });
  return res.json(transactions);
}

module.exports = { initiateMomoRequest, momoCallback, myTransactions };
