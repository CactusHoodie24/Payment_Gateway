// src/controllers/dashboardController.js
const { getConnection } = require('../db');

const dashboardController = {

  async getSummary(req, res) {
    try {
      const db   = getConnection();
      const role = req.user.role;
      const org  = req.user.organization_id;

      // ── Date range — today ──────────────────────────────
      const today    = new Date();
      const dateStr  = today.toISOString().slice(0, 10);
      const todayStart = `${dateStr} 00:00:00`;
      const todayEnd   = `${dateStr} 23:59:59`;

      if (role === 'organization') {
        // ── Organization dashboard ──────────────────────────

        // Accounts for this org
        const [accountRows] = await db.query(
          `SELECT
            COUNT(*)               AS total_accounts,
            SUM(available_balance) AS total_balance,
            SUM(ledger_balance)    AS total_ledger_balance,
            SUM(reserved_balance)  AS total_reserved_balance
           FROM accounts
           WHERE organization_id = ? AND account_status = 'ACTIVE'`,
          [org]
        );

        // Today's account entries for this org (via accounts)
        const [entryRows] = await db.query(
          `SELECT
            COUNT(*)                                                          AS total_entries,
            SUM(ae.amount)                                                    AS total_amount,
            SUM(CASE WHEN ae.entry_type = 'CREDIT' THEN ae.amount ELSE 0 END) AS total_credits,
            SUM(CASE WHEN ae.entry_type = 'DEBIT'  THEN ae.amount ELSE 0 END) AS total_debits,
            SUM(CASE WHEN ae.entry_type = 'CREDIT' THEN 1 ELSE 0 END)         AS credit_count,
            SUM(CASE WHEN ae.entry_type = 'DEBIT'  THEN 1 ELSE 0 END)         AS debit_count
           FROM account_entries ae
           INNER JOIN accounts a ON ae.account_id = a.id
           WHERE a.organization_id = ?
             AND ae.created_at BETWEEN ? AND ?`,
          [org, todayStart, todayEnd]
        );

        // Pending service requests for this org's accounts
        const [serviceRows] = await db.query(
          `SELECT COUNT(*) AS pending_requests
           FROM service_requests sr
           INNER JOIN accounts a ON sr.account_id = a.id
           WHERE a.organization_id = ? AND sr.state = 'PENDING'`,
          [org]
        );

        // Active webhooks
        const [webhookRows] = await db.query(
          `SELECT COUNT(*) AS total_webhooks
           FROM webhooks
           WHERE organization_id = ? AND status = 'ACTIVE'`,
          [org]
        );

        // Recent account entries — last 5
        const [recentEntries] = await db.query(
          `SELECT
            ae.entry_reference,
            ae.entry_type,
            ae.amount,
            ae.balance_before,
            ae.balance_after,
            ae.description,
            ae.created_at,
            a.account_number,
            a.account_name
           FROM account_entries ae
           INNER JOIN accounts a ON ae.account_id = a.id
           WHERE a.organization_id = ?
           ORDER BY ae.created_at DESC
           LIMIT 5`,
          [org]
        );

        const accounts = accountRows[0];
        const entries  = entryRows[0];
        const services = serviceRows[0];
        const webhooks = webhookRows[0];

        return res.status(200).json({
          status: 'success',
          data: {
            date: dateStr,
            accounts: {
              total_accounts:         parseInt(accounts.total_accounts)      || 0,
              total_balance:          parseFloat(accounts.total_balance)     || 0,
              total_ledger_balance:   parseFloat(accounts.total_ledger_balance)   || 0,
              total_reserved_balance: parseFloat(accounts.total_reserved_balance) || 0
            },
            today_activity: {
              total_entries:  parseInt(entries.total_entries)  || 0,
              total_credits:  parseFloat(entries.total_credits) || 0,
              total_debits:   parseFloat(entries.total_debits)  || 0,
              credit_count:   parseInt(entries.credit_count)   || 0,
              debit_count:    parseInt(entries.debit_count)    || 0,
              net_movement:   (parseFloat(entries.total_credits) || 0) - (parseFloat(entries.total_debits) || 0)
            },
            service_requests: {
              pending: parseInt(services.pending_requests) || 0
            },
            webhooks: {
              active: parseInt(webhooks.total_webhooks) || 0
            },
            recent_entries: recentEntries
          }
        });

      } else {
        // ── Admin dashboard ─────────────────────────────────

        // Today's account entries — all orgs
        const [entryRows] = await db.query(
          `SELECT
            COUNT(*)                                                          AS total_entries,
            SUM(ae.amount)                                                    AS total_amount,
            SUM(CASE WHEN ae.entry_type = 'CREDIT' THEN ae.amount ELSE 0 END) AS total_credits,
            SUM(CASE WHEN ae.entry_type = 'DEBIT'  THEN ae.amount ELSE 0 END) AS total_debits,
            SUM(CASE WHEN ae.entry_type = 'CREDIT' THEN 1 ELSE 0 END)         AS credit_count,
            SUM(CASE WHEN ae.entry_type = 'DEBIT'  THEN 1 ELSE 0 END)         AS debit_count
           FROM account_entries ae
           WHERE ae.created_at BETWEEN ? AND ?`,
          [todayStart, todayEnd]
        );

        // All time entries
        const [allTimeRows] = await db.query(
          `SELECT
            COUNT(*)               AS total_entries,
            SUM(amount)            AS total_amount,
            SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END) AS total_credits,
            SUM(CASE WHEN entry_type = 'DEBIT'  THEN amount ELSE 0 END) AS total_debits
           FROM account_entries`
        );

        // Organizations summary
        const [orgRows] = await db.query(
          `SELECT
            COUNT(*)                                                          AS total,
            SUM(CASE WHEN status = 'ACTIVE'        THEN 1 ELSE 0 END)        AS active,
            SUM(CASE WHEN status = 'PENDING_ACTIVE' THEN 1 ELSE 0 END)       AS pending_active,
            SUM(CASE WHEN status = 'SUSPENDED'      THEN 1 ELSE 0 END)       AS suspended
           FROM organizations`
        );

        // Accounts summary
        const [accountRows] = await db.query(
          `SELECT
            COUNT(*)               AS total_accounts,
            SUM(available_balance) AS total_balance,
            SUM(ledger_balance)    AS total_ledger_balance
           FROM accounts
           WHERE account_status = 'ACTIVE'`
        );

        // Pending service requests
        const [serviceRows] = await db.query(
          `SELECT COUNT(*) AS pending_requests FROM service_requests WHERE state = 'PENDING'`
        );

        // Top accounts by credit activity today
        const [topAccounts] = await db.query(
          `SELECT
            a.id,
            a.account_number,
            a.account_name,
            a.account_type,
            a.available_balance,
            o.name       AS organization_name,
            o.short_code AS organization_short_code,
            COUNT(ae.entry_reference)                                          AS entry_count,
            SUM(CASE WHEN ae.entry_type = 'CREDIT' THEN ae.amount ELSE 0 END) AS total_credits,
            SUM(CASE WHEN ae.entry_type = 'DEBIT'  THEN ae.amount ELSE 0 END) AS total_debits
           FROM account_entries ae
           INNER JOIN accounts      a ON ae.account_id      = a.id
           LEFT  JOIN organizations o ON a.organization_id  = o.id
           WHERE ae.created_at BETWEEN ? AND ?
           GROUP BY a.id, a.account_number, a.account_name, a.account_type,
                    a.available_balance, o.name, o.short_code
           ORDER BY total_credits DESC
           LIMIT 5`,
          [todayStart, todayEnd]
        );

        // Recent entries — last 10
        const [recentEntries] = await db.query(
          `SELECT
            ae.entry_reference,
            ae.entry_type,
            ae.amount,
            ae.balance_before,
            ae.balance_after,
            ae.description,
            ae.created_at,
            a.account_number,
            a.account_name,
            o.name       AS organization_name,
            o.short_code AS organization_short_code
           FROM account_entries ae
           INNER JOIN accounts      a ON ae.account_id     = a.id
           LEFT  JOIN organizations o ON a.organization_id = o.id
           ORDER BY ae.created_at DESC
           LIMIT 10`
        );

        const entries  = entryRows[0];
        const allTime  = allTimeRows[0];
        const orgs     = orgRows[0];
        const accounts = accountRows[0];
        const services = serviceRows[0];

        return res.status(200).json({
          status: 'success',
          data: {
            date: dateStr,
            today_activity: {
              total_entries:  parseInt(entries.total_entries)   || 0,
              total_credits:  parseFloat(entries.total_credits) || 0,
              total_debits:   parseFloat(entries.total_debits)  || 0,
              credit_count:   parseInt(entries.credit_count)    || 0,
              debit_count:    parseInt(entries.debit_count)     || 0,
              net_movement:   (parseFloat(entries.total_credits) || 0) - (parseFloat(entries.total_debits) || 0)
            },
            all_time: {
              total_entries:  parseInt(allTime.total_entries)   || 0,
              total_credits:  parseFloat(allTime.total_credits) || 0,
              total_debits:   parseFloat(allTime.total_debits)  || 0,
              total_amount:   parseFloat(allTime.total_amount)  || 0
            },
            organizations: {
              total:          parseInt(orgs.total)          || 0,
              active:         parseInt(orgs.active)         || 0,
              pending_active: parseInt(orgs.pending_active) || 0,
              suspended:      parseInt(orgs.suspended)      || 0
            },
            accounts: {
              total_accounts:       parseInt(accounts.total_accounts)       || 0,
              total_balance:        parseFloat(accounts.total_balance)      || 0,
              total_ledger_balance: parseFloat(accounts.total_ledger_balance) || 0
            },
            service_requests: {
              pending: parseInt(services.pending_requests) || 0
            },
            top_accounts: topAccounts.map(a => ({
              id:                    a.id,
              account_number:        a.account_number,
              account_name:          a.account_name,
              account_type:          a.account_type,
              available_balance:     parseFloat(a.available_balance) || 0,
              organization_name:     a.organization_name,
              organization_short_code: a.organization_short_code,
              entry_count:           parseInt(a.entry_count)    || 0,
              total_credits:         parseFloat(a.total_credits) || 0,
              total_debits:          parseFloat(a.total_debits)  || 0
            })),
            recent_entries: recentEntries
          }
        });
      }

    } catch (error) {
      console.error('❌ Dashboard error:', error);
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  }

};

module.exports = dashboardController;