// Thin wrapper around Khalti's ePayment (KPG-2) REST API.
const KHALTI_BASE_URL = process.env.KHALTI_BASE_URL || 'https://dev.khalti.com/api/v2';

function authHeaders() {
  const khaltiSecretKey = process.env.KHALTI_SECRET_KEY;

  // TEMP DEBUG
  console.log('--- KHALTI DEBUG ---');
  console.log('typeof:', typeof khaltiSecretKey);
  console.log('raw value (JSON):', JSON.stringify(khaltiSecretKey));
  console.log('--------------------');

 if (!khaltiSecretKey || khaltiSecretKey === 'replace_with_your_khalti_test_secret_key') {  throw new Error('KHALTI_SECRET_KEY is not configured in backend/.env');
  }

  return {
    Authorization: `key ${khaltiSecretKey}`,
    'Content-Type': 'application/json'
  };
}

async function initiateKhaltiPayment({ orderId, amountRupees, purchaseOrderName, returnUrl, websiteUrl, customer }) {
  const response = await fetch(`${KHALTI_BASE_URL}/epayment/initiate/`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      return_url: returnUrl,
      website_url: websiteUrl,
      amount: Math.round(Number(amountRupees) * 100),
      purchase_order_id: String(orderId),
      purchase_order_name: purchaseOrderName,
      customer_info: customer
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = data?.detail || data?.error_key || JSON.stringify(data);
    throw new Error(`Khalti initiate failed: ${detail}`);
  }

  return data;
}

async function lookupKhaltiPayment(pidx) {
  const response = await fetch(`${KHALTI_BASE_URL}/epayment/lookup/`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ pidx })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = data?.detail || data?.error_key || JSON.stringify(data);
    throw new Error(`Khalti lookup failed: ${detail}`);
  }

  return data;
}

module.exports = { initiateKhaltiPayment, lookupKhaltiPayment };