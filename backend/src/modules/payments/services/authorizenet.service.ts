import https from 'https';
import http from 'http';
import { env } from '@/config/env';
import { logger } from '@/shared/logger';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface AuthorizeNetCardDetails {
  cardNumber: string;
  expirationDate: string; // Format: YYYY-MM
  cardCode?: string;
}

export interface AuthorizeNetChargeOptions {
  amount: number;
  card: AuthorizeNetCardDetails;
  description?: string;
  orderId?: string;
  currency?: string;
}

export interface AuthorizeNetResult {
  success: boolean;
  transactionId?: string;
  authCode?: string;
  responseCode?: string;
  message?: string;
  rawResponse?: any;
}

// ─── Helper: Make JSON Request to Authorize.Net API ─────────────────────────
function makeApiRequest(body: object, isSandbox: boolean): Promise<any> {
  return new Promise((resolve, reject) => {
    const host = isSandbox
      ? 'apitest.authorize.net'
      : 'api.authorize.net';
    const path = '/xml/v1/request.api';

    const payload = JSON.stringify(body);
    const options = {
      hostname: host,
      port: 443,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          // Authorize.Net sometimes returns BOM prefix – clean it
          const clean = data.replace(/^\uFEFF/, '');
          resolve(JSON.parse(clean));
        } catch (e) {
          reject(new Error(`Failed to parse Authorize.Net response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ─── Authorize.Net Payment Service ───────────────────────────────────────────
export class AuthorizeNetService {
  private static getCredentials() {
    const loginId =
      env.AUTHORIZE_NET_API_LOGIN_ID ||
      env.AUTHORIZENET_API_LOGIN_ID ||
      process.env.AUTHORIZE_NET_API_LOGIN_ID ||
      process.env.AUTHORIZENET_API_LOGIN_ID ||
      '';

    const transactionKey =
      env.AUTHORIZE_NET_TRANSACTION_KEY ||
      env.AUTHORIZENET_TRANSACTION_KEY ||
      process.env.AUTHORIZE_NET_TRANSACTION_KEY ||
      process.env.AUTHORIZENET_TRANSACTION_KEY ||
      '';

    const isSandbox =
      (env.AUTHORIZE_NET_ENVIRONMENT || process.env.AUTHORIZE_NET_ENVIRONMENT || 'SANDBOX').toUpperCase() !== 'PRODUCTION';

    return { loginId, transactionKey, isSandbox };
  }

  /**
   * Charge a credit/debit card using Authorize.Net.
   */
  static async chargeCard(opts: AuthorizeNetChargeOptions): Promise<AuthorizeNetResult> {
    const { loginId, transactionKey, isSandbox } = this.getCredentials();

    if (!loginId || !transactionKey) {
      logger.error('[AUTHORIZE.NET] API credentials not configured');
      return { success: false, message: 'Authorize.Net credentials not configured' };
    }

    logger.info(`[AUTHORIZE.NET] Charging ${opts.amount} via ${isSandbox ? 'SANDBOX' : 'PRODUCTION'}`);

    const requestBody = {
      createTransactionRequest: {
        merchantAuthentication: {
          name: loginId,
          transactionKey,
        },
        refId: opts.orderId || `order_${Date.now()}`,
        transactionRequest: {
          transactionType: 'authCaptureTransaction',
          amount: opts.amount.toFixed(2),
          payment: {
            creditCard: {
              cardNumber: opts.card.cardNumber,
              expirationDate: opts.card.expirationDate,
              cardCode: opts.card.cardCode || '000',
            },
          },
          order: {
            description: opts.description || 'SANAB Order',
          },
          customerIP: '127.0.0.1',
        },
      },
    };

    try {
      const response = await makeApiRequest(requestBody, isSandbox);
      const txResponse = response?.transactionResponse;
      const messageType = response?.messages?.resultCode;

      if (messageType === 'Ok' && txResponse?.responseCode === '1') {
        logger.info(`[AUTHORIZE.NET SUCCESS] Transaction ID: ${txResponse.transId}, Auth: ${txResponse.authCode}`);
        return {
          success: true,
          transactionId: txResponse.transId,
          authCode: txResponse.authCode,
          responseCode: txResponse.responseCode,
          message: txResponse.messages?.[0]?.description || 'Approved',
          rawResponse: response,
        };
      } else {
        const errorMsg =
          txResponse?.errors?.[0]?.errorText ||
          response?.messages?.message?.[0]?.text ||
          'Transaction declined';
        logger.warn(`[AUTHORIZE.NET DECLINED] ${errorMsg}`);
        return {
          success: false,
          responseCode: txResponse?.responseCode,
          message: errorMsg,
          rawResponse: response,
        };
      }
    } catch (err: any) {
      logger.error(`[AUTHORIZE.NET ERROR] ${err?.message || err}`);
      return { success: false, message: err?.message || 'Unknown payment error' };
    }
  }

  /**
   * Refund a previously charged transaction.
   */
  static async refundTransaction(
    transactionId: string,
    amount: number,
    card: Pick<AuthorizeNetCardDetails, 'cardNumber' | 'expirationDate'>
  ): Promise<AuthorizeNetResult> {
    const { loginId, transactionKey, isSandbox } = this.getCredentials();

    if (!loginId || !transactionKey) {
      return { success: false, message: 'Authorize.Net credentials not configured' };
    }

    const requestBody = {
      createTransactionRequest: {
        merchantAuthentication: { name: loginId, transactionKey },
        transactionRequest: {
          transactionType: 'refundTransaction',
          amount: amount.toFixed(2),
          payment: {
            creditCard: {
              cardNumber: card.cardNumber.slice(-4), // Last 4 digits for refund
              expirationDate: card.expirationDate,
            },
          },
          refTransId: transactionId,
        },
      },
    };

    try {
      const response = await makeApiRequest(requestBody, isSandbox);
      const txResponse = response?.transactionResponse;
      const success = response?.messages?.resultCode === 'Ok' && txResponse?.responseCode === '1';
      return {
        success,
        transactionId: txResponse?.transId,
        message: success
          ? 'Refund successful'
          : txResponse?.errors?.[0]?.errorText || 'Refund failed',
        rawResponse: response,
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Refund error' };
    }
  }

  /**
   * Verify Authorize.Net credentials by authenticating.
   */
  static async verifyCredentials(): Promise<{ success: boolean; environment: string; error?: string }> {
    const { loginId, transactionKey, isSandbox } = this.getCredentials();

    if (!loginId || !transactionKey) {
      return { success: false, environment: 'N/A', error: 'Credentials not configured' };
    }

    const requestBody = {
      authenticateTestRequest: {
        merchantAuthentication: { name: loginId, transactionKey },
      },
    };

    try {
      const response = await makeApiRequest(requestBody, isSandbox);
      const ok = response?.messages?.resultCode === 'Ok';
      return {
        success: ok,
        environment: isSandbox ? 'SANDBOX' : 'PRODUCTION',
        error: ok ? undefined : response?.messages?.message?.[0]?.text,
      };
    } catch (err: any) {
      return {
        success: false,
        environment: isSandbox ? 'SANDBOX' : 'PRODUCTION',
        error: err?.message,
      };
    }
  }
}
