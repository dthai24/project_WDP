/**
 * Mock service — quản lý tài khoản Admin (localStorage).
 * TODO: replace bằng API khi backend sẵn sàng.
 */
import { adminAccountsSeed } from '@/features/admin/data/adminAccountsMock';
import { normalizeAccount } from '@/features/admin/utils/adminAccountUtils';

const STORAGE_KEY = 'admin_accounts_v1';

function loadStoredAccounts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeAccount) : null;
  } catch {
    return null;
  }
}

function saveStoredAccounts(accounts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    // storage full or unavailable
  }
}

function getAllAccounts() {
  const stored = loadStoredAccounts();
  if (stored) return stored;
  return adminAccountsSeed.map(normalizeAccount);
}

function nextAccountId(accounts) {
  const maxId = accounts.reduce((max, item) => (item.id > max ? item.id : max), 0);
  return maxId + 1;
}

function simulateDelay(ms = 180) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getAccounts() {
  await simulateDelay();
  return { ok: true, accounts: getAllAccounts() };
}

export async function createAccount(payload) {
  await simulateDelay();
  const accounts = getAllAccounts();
  const email = String(payload.email ?? '').trim().toLowerCase();

  if (accounts.some((item) => item.email.toLowerCase() === email)) {
    return { ok: false, message: 'Email đã tồn tại trong hệ thống' };
  }

  const now = new Date().toISOString();
  const created = normalizeAccount({
    id: nextAccountId(accounts),
    fullName: payload.fullName,
    username: payload.username || email.split('@')[0],
    email: payload.email,
    phone: payload.phone ?? '',
    role: payload.role,
    status: payload.status ?? 'ACTIVE',
    createdAt: now,
    lastLoginAt: null,
  });

  const next = [...accounts, created];
  saveStoredAccounts(next);
  return { ok: true, account: created };
}

export async function updateAccount(id, payload) {
  await simulateDelay();
  const accounts = getAllAccounts();
  const index = accounts.findIndex((item) => String(item.id) === String(id));

  if (index < 0) {
    return { ok: false, message: 'Không tìm thấy tài khoản' };
  }

  const updated = normalizeAccount({
    ...accounts[index],
    role: payload.role ?? accounts[index].role,
    status: payload.status ?? accounts[index].status,
  });

  const next = [...accounts];
  next[index] = updated;
  saveStoredAccounts(next);
  return { ok: true, account: updated };
}

export async function toggleAccountStatus(id) {
  await simulateDelay();
  const accounts = getAllAccounts();
  const index = accounts.findIndex((item) => String(item.id) === String(id));

  if (index < 0) {
    return { ok: false, message: 'Không tìm thấy tài khoản' };
  }

  const nextStatus = accounts[index].status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
  const updated = { ...accounts[index], status: nextStatus };
  const next = [...accounts];
  next[index] = updated;
  saveStoredAccounts(next);
  return { ok: true, account: updated };
}

export async function resetAccountPassword(id) {
  await simulateDelay(120);
  const accounts = getAllAccounts();
  const account = accounts.find((item) => String(item.id) === String(id));
  if (!account) {
    return { ok: false, message: 'Không tìm thấy tài khoản' };
  }
  return { ok: true, message: `Đã gửi email đặt lại mật khẩu tới ${account.email}` };
}
