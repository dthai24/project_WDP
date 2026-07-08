const crypto = require('crypto');

const DEFAULT_VNP_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';

class VNPayService {
  constructor() {
    this.vnp_TmnCode = process.env.VNP_TMN_CODE || '';
    this.vnp_HashSecret = process.env.VNP_HASH_SECRET || '';
    this.vnp_Url = process.env.VNP_URL || DEFAULT_VNP_URL;
    this.vnp_ReturnUrl = process.env.VNP_RETURN_URL || 'http://localhost:5050/api/payment/callback';
  }

  isConfigured() {
    return Boolean(this.vnp_TmnCode && this.vnp_HashSecret && this.vnp_Url);
  }

  /**
   * VNPay yêu cầu OrderInfo không dấu, không ký tự đặc biệt.
   */
  sanitizeOrderInfo(text = '') {
    return String(text)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 255) || 'Thanh toan khoa hoc';
  }

  /**
   * Tạo URL thanh toán VNPay
   * @param {Object} orderData - { orderId, amount, description, userId }
   * @returns {string} URL thanh toán
   */
  createPaymentUrl(orderData) {
    try {
      const {
        orderId,
        amount,
        description,
        userId,
        courseId,
        ipAddress = '127.0.0.1',
        bankCode
      } = orderData;

      if (!orderId || !amount) {
        throw new Error('Missing required fields: orderId, amount');
      }

      if (!this.isConfigured()) {
        throw new Error('VNPay chưa cấu hình. Kiểm tra VNP_TMN_CODE, VNP_HASH_SECRET, VNP_URL trong file .env');
      }

      const vnp_Params = {};
      vnp_Params['vnp_Version'] = '2.1.0';
      vnp_Params['vnp_Command'] = 'pay';
      vnp_Params['vnp_TmnCode'] = this.vnp_TmnCode;
      vnp_Params['vnp_Locale'] = 'vn';
      vnp_Params['vnp_CurrCode'] = 'VND';
      vnp_Params['vnp_TxnRef'] = orderId;
      vnp_Params['vnp_OrderInfo'] = this.sanitizeOrderInfo(description || `Thanh toan don hang ${orderId}`);
      vnp_Params['vnp_OrderType'] = 'other';
      vnp_Params['vnp_Amount'] = amount * 100; // VNPay expects amount in hundredths of VND
      vnp_Params['vnp_ReturnUrl'] = this.vnp_ReturnUrl;
      vnp_Params['vnp_IpAddr'] = ipAddress;
      vnp_Params['vnp_CreateDate'] = this.getVnpCreateDate();

      // bankCode = 'VNPAYQR' bỏ qua trang chọn ngân hàng, hiển thị thẳng mã QR
      // để quét bằng app ngân hàng bất kỳ (chuẩn VietQR/NAPAS 247)
      if (bankCode) {
        vnp_Params['vnp_BankCode'] = bankCode;
      }

      // Sort + encode params theo đúng chuẩn VNPay rồi tính chữ ký
      const sortedParams = this.sortObject(vnp_Params);
      const signData = this.buildSignData(sortedParams);
      sortedParams['vnp_SecureHash'] = this.hmacSHA512(this.vnp_HashSecret, signData);

      // Build payment URL từ chính các value đã encode dùng để ký (không encode lại lần 2)
      const paymentUrl = `${this.vnp_Url}?${this.buildQueryString(sortedParams)}`;

      return paymentUrl;
    } catch (error) {
      console.error('Error creating payment URL:', error);
      throw error;
    }
  }

  /**
   * Xác minh phản hồi từ VNPay
   * @param {Object} queryParams - Query parameters từ VNPay callback
   * @returns {Object} { isValid: boolean, data: Object }
   */
  verifyPaymentResponse(queryParams) {
    try {
      const vnp_SecureHash = queryParams['vnp_SecureHash'];

      // Copy params, loại bỏ secure hash
      const vnp_Params = { ...queryParams };
      delete vnp_Params['vnp_SecureHash'];
      delete vnp_Params['vnp_SecureHashType'];

      // Sort + encode lại (giống hệt lúc ký) rồi build sign data
      const sortedParams = this.sortObject(vnp_Params);
      const signData = this.buildSignData(sortedParams);
      const checksum = this.hmacSHA512(this.vnp_HashSecret, signData);

      const isValid = checksum === vnp_SecureHash;

      return {
        isValid,
        responseCode: queryParams['vnp_ResponseCode'],
        transactionStatus: queryParams['vnp_TransactionStatus'],
        transactionNo: queryParams['vnp_TransactionNo'],
        orderId: queryParams['vnp_TxnRef'],
        amount: queryParams['vnp_Amount'] ? queryParams['vnp_Amount'] / 100 : 0,
        bankCode: queryParams['vnp_BankCode'],
        bankTranNo: queryParams['vnp_BankTranNo'],
        cardType: queryParams['vnp_CardType'],
        payDate: queryParams['vnp_PayDate'],
        data: vnp_Params
      };
    } catch (error) {
      console.error('Error verifying payment response:', error);
      return {
        isValid: false,
        error: error.message
      };
    }
  }

  /**
   * Query trạng thái giao dịch từ VNPay
   * Thường dùng khi callback không được nhận
   */
  async queryTransactionStatus(orderId, transactionDate) {
    try {
      // This would require VNPay Query API
      // Implementation depends on VNPay API documentation
      console.log(`Query transaction status for order: ${orderId}`);
      
      // Placeholder for actual implementation
      return {
        status: 'pending',
        message: 'Query API not implemented'
      };
    } catch (error) {
      console.error('Error querying transaction status:', error);
      throw error;
    }
  }

  /**
   * Helper: Lấy thời gian VNPay format (YYYYMMDDHHmmss)
   */
  getVnpCreateDate() {
    const now = new Date();
    return now.getFullYear().toString() +
           ('0' + (now.getMonth() + 1)).slice(-2) +
           ('0' + now.getDate()).slice(-2) +
           ('0' + now.getHours()).slice(-2) +
           ('0' + now.getMinutes()).slice(-2) +
           ('0' + now.getSeconds()).slice(-2);
  }

  /**
   * Sort theo key (thứ tự bảng chữ cái) và encode value đúng chuẩn VNPay:
   * encodeURIComponent rồi đổi %20 -> + (application/x-www-form-urlencoded).
   * Đây là bước bắt buộc để chữ ký khớp với VNPay — không được bỏ qua.
   */
  sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach(key => {
      sorted[key] = encodeURIComponent(String(obj[key])).replace(/%20/g, '+');
    });
    return sorted;
  }

  /**
   * Build sign data string from sorted+encoded params
   */
  buildSignData(sortedParams) {
    return Object.keys(sortedParams)
      .map(key => `${key}=${sortedParams[key]}`)
      .join('&');
  }

  /**
   * Build query string for URL từ params đã encode sẵn (không encode lại lần 2)
   */
  buildQueryString(sortedParams) {
    return Object.keys(sortedParams)
      .map(key => `${key}=${sortedParams[key]}`)
      .join('&');
  }

  /**
   * HMAC SHA512 signature
   */
  hmacSHA512(key, data) {
    return crypto
      .createHmac('sha512', key)
      .update(Buffer.from(data, 'utf-8'))
      .digest('hex');
  }

  /**
   * Generate unique order ID
   */
  generateOrderId(userId, courseId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `${timestamp}${random}`;
  }
}

module.exports = new VNPayService();
