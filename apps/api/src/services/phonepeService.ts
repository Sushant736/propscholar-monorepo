import { StandardCheckoutClient, Env, StandardCheckoutPayRequest, CreateSdkOrderRequest, CallbackResponse as PhonePeCallbackResponse } from 'pg-sdk-node';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';

interface PhonePeConfig {
  clientId: string;
  clientSecret: string;
  clientVersion: number;
  env: Env;
  callbackUsername: string;
  callbackPassword: string;
}

interface CreateOrderRequest {
  amount: number; // Amount in INR
  redirectUrl: string;
  merchantOrderId?: string;
}

interface CreateOrderResponse {
  orderId: string;
  merchantOrderId: string;
  redirectUrl: string;
  expireAt: number;
  state: string;
}

interface OrderStatusResponse {
  orderId: string;
  state: string;
  amount: number;
  expireAt: number;
  paymentDetails: Array<{
    paymentMode: string;
    timestamp: number;
    amount: number;
    transactionId: string;
    state: string;
    errorCode?: string;
    detailedErrorCode?: string;
  }>;
}

interface CallbackResponse {
  type: string;
  payload: {
    orderId: string;
    merchantOrderId: string;
    transactionId: string;
    amount: number;
    state: string;
    errorCode?: string;
    detailedErrorCode?: string;
    paymentMode?: string;
    timestamp?: number;
  };
}

export class PhonePeService {
  private static instance: PhonePeService;
  private client: StandardCheckoutClient;
  private config: PhonePeConfig;

  private constructor() {
    this.config = {
      clientId: process.env.PHONEPE_CLIENT_ID || '',
      clientSecret: process.env.PHONEPE_CLIENT_SECRET || '',
      clientVersion: parseInt(process.env.PHONEPE_CLIENT_VERSION || '1'),
      env: process.env.NODE_ENV === 'production' ? Env.PRODUCTION : Env.SANDBOX,
      callbackUsername: process.env.PHONEPE_CALLBACK_USERNAME || '',
      callbackPassword: process.env.PHONEPE_CALLBACK_PASSWORD || '',
    };

    if (!this.config.clientId || !this.config.clientSecret) {
      throw new Error('PhonePe credentials not configured');
    }

    this.client = StandardCheckoutClient.getInstance(
      this.config.clientId,
      this.config.clientSecret,
      this.config.clientVersion,
      this.config.env
    );

    logger.info('PhonePe service initialized', {
      env: this.config.env,
      clientVersion: this.config.clientVersion,
    });
  }

  public static getInstance(): PhonePeService {
    if (!PhonePeService.instance) {
      PhonePeService.instance = new PhonePeService();
    }
    return PhonePeService.instance;
  }

  /**
   * Create a new payment order
   */
  public async createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      const merchantOrderId = request.merchantOrderId || uuidv4();
      const amountInPaisa = Math.round(request.amount * 100); // Convert INR to paisa

      logger.info('Creating PhonePe order', {
        merchantOrderId,
        amount: request.amount,
        amountInPaisa,
      });

      const payRequest = StandardCheckoutPayRequest.builder()
        .merchantOrderId(merchantOrderId)
        .amount(amountInPaisa)
        .redirectUrl(request.redirectUrl)
        .build();

      const response = await this.client.pay(payRequest);

      logger.info('PhonePe order created successfully', {
        merchantOrderId,
        orderId: response.orderId,
        state: response.state,
      });

      return {
        orderId: response.orderId,
        merchantOrderId,
        redirectUrl: response.redirectUrl,
        expireAt: response.expireAt,
        state: response.state,
      };
    } catch (error) {
      logger.error('Failed to create PhonePe order', {
        error: error instanceof Error ? error.message : error,
        request,
      });
      throw new Error(`Payment order creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create SDK order token for frontend integration
   */
  public async createSdkOrder(request: CreateOrderRequest): Promise<{ token: string; orderId: string; merchantOrderId: string }> {
    try {
      const merchantOrderId = request.merchantOrderId || uuidv4();
      const amountInPaisa = Math.round(request.amount * 100);

      logger.info('Creating PhonePe SDK order', {
        merchantOrderId,
        amount: request.amount,
        amountInPaisa,
      });

      const sdkRequest = CreateSdkOrderRequest.StandardCheckoutBuilder()
        .merchantOrderId(merchantOrderId)
        .amount(amountInPaisa)
        .redirectUrl(request.redirectUrl)
        .build();

      const response = await this.client.createSdkOrder(sdkRequest);

      logger.info('PhonePe SDK order created successfully', {
        merchantOrderId,
        orderId: response.orderId,
        token: response.token ? 'present' : 'missing',
      });

      return {
        token: response.token,
        orderId: response.orderId,
        merchantOrderId,
      };
    } catch (error) {
      logger.error('Failed to create PhonePe SDK order', {
        error: error instanceof Error ? error.message : error,
        request,
      });
      throw new Error(`SDK order creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check order status
   */
  public async getOrderStatus(merchantOrderId: string): Promise<OrderStatusResponse> {
    try {
      logger.info('Checking PhonePe order status', { merchantOrderId });

      const response = await this.client.getOrderStatus(merchantOrderId);

      logger.info('PhonePe order status retrieved', {
        merchantOrderId,
        orderId: response.orderId,
        state: response.state,
        amount: response.amount,
      });

      return {
        orderId: response.orderId,
        state: response.state,
        amount: response.amount,
        expireAt: response.expireAt,
        paymentDetails: response.paymentDetails || [],
      };
    } catch (error) {
      logger.error('Failed to get PhonePe order status', {
        error: error instanceof Error ? error.message : error,
        merchantOrderId,
      });
      throw new Error(`Order status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate callback from PhonePe
   */
  public validateCallback(
    authorization: string,
    responseBody: string
  ): CallbackResponse {
    try {
      logger.info('Validating PhonePe callback', {
        authorization: authorization ? 'present' : 'missing',
        bodyLength: responseBody.length,
      });

      const callbackResponse: PhonePeCallbackResponse = this.client.validateCallback(
        this.config.callbackUsername,
        this.config.callbackPassword,
        authorization,
        responseBody
      );

      logger.info('PhonePe callback validated successfully', {
        type: callbackResponse.type,
        orderId: callbackResponse.payload?.orderId,
        state: callbackResponse.payload?.state,
      });

      // Convert PhonePe response to our interface
      return {
        type: callbackResponse.type.toString(),
        payload: {
          orderId: callbackResponse.payload.orderId,
          merchantOrderId: callbackResponse.payload.merchantOrderId || '',
          transactionId: callbackResponse.payload.paymentDetails?.[0]?.transactionId || '',
          amount: callbackResponse.payload.amount,
          state: callbackResponse.payload.state,
          errorCode: callbackResponse.payload.errorCode,
          detailedErrorCode: callbackResponse.payload.detailedErrorCode,
          paymentMode: callbackResponse.payload.paymentDetails?.[0]?.paymentMode,
          timestamp: callbackResponse.payload.paymentDetails?.[0]?.timestamp,
        },
      };
    } catch (error) {
      logger.error('PhonePe callback validation failed', {
        error: error instanceof Error ? error.message : error,
        authorization: authorization ? 'present' : 'missing',
      });
      throw new Error(`Callback validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert amount from INR to paisa
   */
  public static convertToPaisa(amountInINR: number): number {
    return Math.round(amountInINR * 100);
  }

  /**
   * Convert amount from paisa to INR
   */
  public static convertToINR(amountInPaisa: number): number {
    return Math.round(amountInPaisa / 100 * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Generate unique merchant order ID
   */
  public static generateMerchantOrderId(): string {
    return uuidv4();
  }

  /**
   * Validate environment configuration
   */
  public validateConfig(): boolean {
    const requiredVars = [
      'PHONEPE_CLIENT_ID',
      'PHONEPE_CLIENT_SECRET', 
      'PHONEPE_CALLBACK_USERNAME',
      'PHONEPE_CALLBACK_PASSWORD',
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      logger.error('Missing PhonePe configuration', { missing });
      return false;
    }

    return true;
  }
} 