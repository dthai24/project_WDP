/**
 * Bank Transfer Service
 * Quản lý thông tin chuyển khoản và tạo mã QR cho thanh toán ngân hàng
 */

class BankTransferService {
  constructor() {
    this.bankInfo = {
      bankName: process.env.BANK_NAME || 'Ngân hàng TMCP',
      accountNumber: process.env.BANK_ACCOUNT_NUMBER || '',
      accountHolder: process.env.BANK_ACCOUNT_HOLDER || '',
      branch: process.env.BANK_BRANCH || '',
    };
  }

  /**
   * Lấy thông tin tài khoản ngân hàng
   * @returns {Object} Bank account information
   */
  getBankInfo() {
    return {
      bankName: this.bankInfo.bankName,
      accountNumber: this.bankInfo.accountNumber,
      accountHolder: this.bankInfo.accountHolder,
      branch: this.bankInfo.branch,
    };
  }

  /**
   * Kiểm tra xem tài khoản ngân hàng đã được cấu hình chưa
   * @returns {boolean}
   */
  isBankInfoConfigured() {
    return Boolean(
      this.bankInfo.accountNumber &&
      this.bankInfo.accountHolder &&
      this.bankInfo.bankName
    );
  }

  /**
   * Tạo dữ liệu cho mã QR chuyển khoản (VietQR format)
   * @param {Object} paymentData - { amount, orderId, description }
   * @returns {Object} QR code data
   */
  generateQRData(paymentData) {
    const { amount, orderId, description } = paymentData;

    // Format cho VietQR (chuẩn NAPAS)
    // Định dạng: BankCode|AccountNumber|Amount|Description|OrderId
    const qrContent = [
      this.bankInfo.bankName,
      this.bankInfo.accountNumber,
      Math.round(amount) || '',
      this.sanitizeDescription(description || `DonHang${orderId}`),
      orderId
    ].join('|');

    return {
      content: qrContent,
      amount: amount,
      accountNumber: this.bankInfo.accountNumber,
      accountHolder: this.bankInfo.accountHolder,
      description: description || `Thanh toán đơn hàng ${orderId}`,
      orderId: orderId
    };
  }

  /**
   * Lấy thông tin chuyển khoản đầy đủ cho hiển thị
   * @param {Object} paymentData - { amount, orderId, description, courseName }
   * @returns {Object} Complete transfer information
   */
  getTransferInfo(paymentData) {
    if (!this.isBankInfoConfigured()) {
      throw new Error('Bank account information not configured');
    }

    const { amount, orderId, description, courseName } = paymentData;

    return {
      bankInfo: this.getBankInfo(),
      qrData: this.generateQRData({
        amount,
        orderId,
        description: courseName || description
      }),
      instructions: [
        `1. Mở ứng dụng ngân hàng hoặc quét mã QR`,
        `2. Nhập số tiền: ${amount.toLocaleString('vi-VN')} ₫`,
        `3. Nội dung chuyển: ${this.sanitizeDescription(courseName || description || `DonHang${orderId}`)}`,
        `4. Kiểm tra thông tin và xác nhận`
      ],
      transferSteps: {
        bankName: this.bankInfo.bankName,
        accountNumber: this.bankInfo.accountNumber,
        accountHolder: this.bankInfo.accountHolder,
        amount: amount,
        transferContent: this.sanitizeDescription(courseName || description || `DonHang${orderId}`),
        orderId: orderId
      }
    };
  }

  /**
   * Vệ sinh mô tả (loại bỏ ký tự đặc biệt)
   * @param {string} text
   * @returns {string} Sanitized text
   */
  sanitizeDescription(text = '') {
    return String(text)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 70) || 'DonHang';
  }

  /**
   * Format số tài khoản để hiển thị (ẩn một phần)
   * @param {string} accountNumber
   * @returns {string} Formatted account number
   */
  formatAccountNumber(accountNumber) {
    if (!accountNumber) return '';
    const length = accountNumber.length;
    if (length <= 4) return accountNumber;
    
    const lastFour = accountNumber.slice(-4);
    const maskedPart = '*'.repeat(length - 4);
    return `${maskedPart}${lastFour}`;
  }

  /**
   * Tạo link chuyển khoản cho các ứng dụng (VCB, Agribank, etc)
   * @param {Object} transferInfo
   * @returns {Object} Links to banking apps
   */
  generateBankingAppLinks(transferInfo) {
    const { bankInfo, transferSteps } = transferInfo;
    const { accountNumber, amount, transferContent } = transferSteps;

    return {
      vcb: `https://pay.vcb.com.vn/?amount=${amount}&description=${encodeURIComponent(transferContent)}`,
      bidv: `https://ibusiness.bidv.com.vn/service/payment?amount=${amount}&desc=${encodeURIComponent(transferContent)}`
    };
  }
}

module.exports = new BankTransferService();
