
const VIPPS_CLIENT_ID = process.env.VIPPS_CLIENT_ID;
const VIPPS_CLIENT_SECRET = process.env.VIPPS_CLIENT_SECRET;
const VIPPS_SUBSCRIPTION_KEY = process.env.VIPPS_SUBSCRIPTION_KEY_PRIMARY;
const VIPPS_MERCHANT_SERIAL = process.env.VIPPS_MERCHANT_SERIAL_NUMBER;
const VIPPS_BASE_URL = process.env.VIPPS_BASE_URL || 'https://apitest.vipps.no';

if (!VIPPS_CLIENT_ID || !VIPPS_CLIENT_SECRET || !VIPPS_SUBSCRIPTION_KEY || !VIPPS_MERCHANT_SERIAL) {
    console.error('Vipps configuration missing');
}

let cachedAccessToken: string | null = null;
let tokenExpiry: number = 0;

export async function getVippsAccessToken(): Promise<string> {
    // Return cached token if still valid (with 5 min buffer)
    if (cachedAccessToken && Date.now() < tokenExpiry - 300000) {
        return cachedAccessToken;
    }

    const response = await fetch(`${VIPPS_BASE_URL}/accesstoken/get`, {
        method: 'POST',
        headers: {
            'client_id': VIPPS_CLIENT_ID!,
            'client_secret': VIPPS_CLIENT_SECRET!,
            'Ocp-Apim-Subscription-Key': VIPPS_SUBSCRIPTION_KEY!,
            'Merchant-Serial-Number': VIPPS_MERCHANT_SERIAL!,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to get Vipps access token:', response.status, errorText);
        throw new Error(`Failed to get Vipps access token: ${response.statusText}`);
    }

    const data = await response.json();
    cachedAccessToken = data.access_token;
    // expires_in is in seconds
    tokenExpiry = Date.now() + (parseInt(data.expires_in) * 1000);

    return cachedAccessToken!;
}

interface InitiatePaymentParams {
    orderId: string;
    reference?: string;
    amount: number; // in øre
    mobileNumber: string;
    returnUrl: string;
    description: string;
}

export async function initiateVippsPayment({
    orderId,
    reference,
    amount,
    mobileNumber,
    returnUrl,
    description
}: InitiatePaymentParams) {
    const accessToken = await getVippsAccessToken();

    // Ensure mobile number is formatted correctly (MSISDN)
    // Remove spaces, +, and non-digits
    let formattedPhone = mobileNumber.replace(/\D/g, '');
    // If 8 digits, assume Norwegian and add 47
    if (formattedPhone.length === 8) {
        formattedPhone = `47${formattedPhone}`;
    }

    const payload = {
        amount: {
            currency: 'NOK',
            value: amount, // Amount in øre
        },
        paymentMethod: {
            type: 'WALLET',
        },
        customer: {
            phoneNumber: formattedPhone,
        },
        reference: reference || orderId,
        userFlow: 'WEB_REDIRECT',
        returnUrl: returnUrl,
        paymentDescription: description,
    };

    const response = await fetch(`${VIPPS_BASE_URL}/epayment/v1/payments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'Ocp-Apim-Subscription-Key': VIPPS_SUBSCRIPTION_KEY!,
            'Merchant-Serial-Number': VIPPS_MERCHANT_SERIAL!,
            'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to initiate Vipps payment:', response.status, errorText);
        throw new Error('Kunne ikke starte Vipps-betaling');
    }

    return await response.json();
}


interface VippsPaymentDetails {
    reference: string;
    state: 'CREATED' | 'AUTHORIZED' | 'TERMINATED' | 'EXPIRED' | 'ABORTED' | 'FAILED' | 'CAPTURED';
    amount: {
        value: number;
        currency: string;
    };
}

export async function getVippsPayment(reference: string): Promise<VippsPaymentDetails> {
    const accessToken = await getVippsAccessToken();

    const response = await fetch(`${VIPPS_BASE_URL}/epayment/v1/payments/${reference}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Ocp-Apim-Subscription-Key': VIPPS_SUBSCRIPTION_KEY!,
            'Merchant-Serial-Number': VIPPS_MERCHANT_SERIAL!,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to get Vipps payment details:', response.status, errorText);
        throw new Error('Kunne ikke hente betalingsstatus fra Vipps');
    }

    return await response.json();
}
