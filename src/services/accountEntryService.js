// src/services/accountEntryService.js
const AccountEntryModel = require('../models/AccountEntry');
const AccountModel      = require('../models/Account');

const VALID_ENTRY_TYPES = ['DEBIT', 'CREDIT'];

// Generate entry_reference e.g. ENT-20260310-0001
async function generateEntryReference() {
  const db = require('../db').getConnection();
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const [rows] = await db.query(
    "SELECT COUNT(*) AS count FROM account_entries WHERE entry_reference LIKE ?",
    [`ENT-${date}-%`]
  );
  const seq = String(rows[0].count + 1).padStart(4, '0');
  return `ENT-${date}-${seq}`;
}

const accountEntryService = {

  async createEntry(data) {
    const { account_id, entry_type, amount, description, transaction_id } = data;

    if (!account_id)  throw { status: 400, message: 'account_id is required.' };
    if (!entry_type)  throw { status: 400, message: 'entry_type is required.' };
    if (!amount)      throw { status: 400, message: 'amount is required.' };

    if (!VALID_ENTRY_TYPES.includes(entry_type)) {
      throw { status: 400, message: 'entry_type must be either DEBIT or CREDIT.' };
    }

    if (amount <= 0) {
      throw { status: 400, message: 'amount must be greater than 0.' };
    }

    const account = await AccountModel.findById(account_id);
    if (!account) throw { status: 404, message: 'Account not found.' };

    if (account.account_status !== 'ACTIVE') {
      throw { status: 409, message: 'Cannot post entries to an inactive account.' };
    }

    const balance_before = parseFloat(account.available_balance);
    let   balance_after;

    if (entry_type === 'CREDIT') {
      balance_after = balance_before + parseFloat(amount);
    } else {
      if (balance_before < parseFloat(amount)) {
        throw { status: 409, message: 'Insufficient balance for this debit entry.' };
      }
      balance_after = balance_before - parseFloat(amount);
    }

    // Update account balance
    await AccountModel.updateBalance(account_id, {
      available_balance: balance_after,
      ledger_balance:    balance_after,
      reserved_balance:  account.reserved_balance
    });

    const entry_reference = await generateEntryReference();

    return await AccountEntryModel.create({
      entry_reference,
      account_id,
      transaction_id: transaction_id || null,
      entry_type,
      amount,
      balance_before,
      balance_after,
      description
    });
  },

  async getEntryById(entry_reference) {
    const entry = await AccountEntryModel.findByIdWithDetails(entry_reference);
    if (!entry) throw { status: 404, message: 'Account entry not found.' };
    return entry;
  },

  async getAllEntries(filters = {}) {
    if (filters.entry_type && !VALID_ENTRY_TYPES.includes(filters.entry_type)) {
      throw { status: 400, message: 'entry_type must be either DEBIT or CREDIT.' };
    }
    return await AccountEntryModel.find(filters);
  },

  async deleteEntry(entry_reference) {
    const existing = await AccountEntryModel.findById(entry_reference);
    if (!existing) throw { status: 404, message: 'Account entry not found.' };
    await AccountEntryModel.findByIdAndDelete(entry_reference);
    return { message: 'Account entry deleted successfully.' };
  }

};

module.exports = accountEntryService;