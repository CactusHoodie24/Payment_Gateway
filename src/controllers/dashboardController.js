// src/controllers/dashboardController.js
const { getConnection } = require('../db');

const dashboardController = {

  async getSummary(req, res) {
    try {
      const db   = getConnection();
      const role = req.user.role;
      const org  = req.user.organization_id;

      // ── Date range — today ──────────────────────────────
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const todayStartStr = todayStart.toISOString().slice(0, 19).replace('T', ' ');
      const todayEndStr   = todayEnd.toISOString().slice(0, 19).replace('T', ' ');

      if (role === 'organization') {
        // ── Organization dashboard ──────────────────────────

        // Today's transactions for this org
        const [txnRows] = await db.query(
          `SELECT
            COUNT(*)                                          AS total_transactions,
            SUM(transaction_amount)                           AS total_revenue,
            SUM(CASE WHEN status = 'COMPLETED'  THEN 1 ELSE 0 END) AS successful,
            SUM(CASE WHEN status = 'PENDING'    THEN 1 ELSE 0 END) AS pending,
            SUM(CASE WHEN status = 'FAILED'     THEN 1 ELSE 0 END) AS failed,
            SUM(CASE WHEN status = 'CANCELLED'  THEN 1 ELSE 0 END) AS cancelled,
            SUM(CASE WHEN status = 'REVERSED'   THEN 1 ELSE 0 END) AS reversed,
            SUM(CASE WHEN status = 'COMPLETED'  THEN transaction_amount ELSE 0 END) AS successful_revenue,
            SUM(CASE WHEN status = 'PENDING'    THEN transaction_amount ELSE 0 END) AS pending_revenue
           FROM transactions
           WHERE created_at BETWEEN ? AND ?`,
          [todayStartStr, todayEndStr]
        );

        // Account balances for this org
        const [accountRows] = await db.query(
          `SELECT
            SUM(available_balance) AS total_balance,
            COUNT(*)               AS total_accounts
           FROM accounts
           WHERE organization_id = ? AND account_status = 'ACTIVE'`,
          [org]
        );

        // Webhooks for this org
        const [webhookRows] = await db.query(
          `SELECT COUNT(*) AS total_webhooks
           FROM webhooks
           WHERE organization_id = ? AND status = 'ACTIVE'`,
          [org]
        );

        const txn      = txnRows[0];
        const accounts = accountRows[0];
        const webhooks = webhookRows[0];

        const total      = parseInt(txn.total_transactions) || 0;
        const successful = parseInt(txn.successful)         || 0;
        const successRate = total > 0 ? ((successful / total) * 100).toFixed(2) : '0.00';

        return res.status(200).json({
          status: 'success',
          data: {
            date:  new Date().toISOString().slice(0, 10),
            transactions: {
              total:             total,
              successful:        successful,
              pending:           parseInt(txn.pending)   || 0,
              failed:            parseInt(txn.failed)    || 0,
              cancelled:         parseInt(txn.cancelled) || 0,
              reversed:          parseInt(txn.reversed)  || 0,
              success_rate:      `${successRate}%`,
              total_revenue:     txn.total_revenue        || 0,
              successful_revenue: txn.successful_revenue  || 0,
              pending_settlement: txn.pending_revenue     || 0
            },
            accounts: {
              total_accounts: parseInt(accounts.total_accounts) || 0,
              total_balance:  accounts.total_balance            || 0
            },
            webhooks: {
              active: parseInt(webhooks.total_webhooks) || 0
            }
          }
        });

      } else {
        // ── Admin dashboard ─────────────────────────────────

        // Today's transactions — all orgs
        const [txnRows] = await db.query(
          `SELECT
            COUNT(*)                                                AS total_transactions,
            SUM(transaction_amount)                                 AS total_revenue,
            SUM(CASE WHEN status = 'COMPLETED'  THEN 1 ELSE 0 END) AS successful,
            SUM(CASE WHEN status = 'PENDING'    THEN 1 ELSE 0 END) AS pending,
            SUM(CASE WHEN status = 'FAILED'     THEN 1 ELSE 0 END) AS failed,
            SUM(CASE WHEN status = 'CANCELLED'  THEN 1 ELSE 0 END) AS cancelled,
            SUM(CASE WHEN status = 'REVERSED'   THEN 1 ELSE 0 END) AS reversed,
            SUM(CASE WHEN status = 'COMPLETED'  THEN transaction_amount ELSE 0 END) AS successful_revenue,
            SUM(CASE WHEN status = 'PENDING'    THEN transaction_amount ELSE 0 END) AS pending_settlement
           FROM transactions
           WHERE created_at BETWEEN ? AND ?`,
          [todayStartStr, todayEndStr]
        );

        // All time transactions count
        const [allTimeTxn] = await db.query(
          `SELECT COUNT(*) AS total FROM transactions`
        );

        // Organizations summary
        const [orgRows] = await db.query(
          `SELECT
            COUNT(*)                                                   AS total,
            SUM(CASE WHEN status = 'ACTIVE'         THEN 1 ELSE 0 END) AS active,
            SUM(CASE WHEN status = 'PENDING_ACTIVE'  THEN 1 ELSE 0 END) AS pending_active,
            SUM(CASE WHEN status = 'SUSPENDED'       THEN 1 ELSE 0 END) AS suspended
           FROM organizations`
        );

        // Accounts summary
        const [accountRows] = await db.query(
          `SELECT
            COUNT(*)               AS total_accounts,
            SUM(available_balance) AS total_balance
           FROM accounts
           WHERE account_status = 'ACTIVE'`
        );

        // Pending service requests
        const [serviceRows] = await db.query(
          `SELECT COUNT(*) AS pending_requests
           FROM service_requests
           WHERE state = 'PENDING'`
        );

        // Top organizations by transaction volume today
        const [topOrgs] = await db.query(
          `SELECT
            o.name,
            o.short_code,
            COUNT(t.transaction_id)  AS transaction_count,
            SUM(t.transaction_amount) AS total_amount
           FROM transactions t
           LEFT JOIN transaction_types tt ON t.transaction_type_id = tt.id
           LEFT JOIN organizations o ON o.id = 1
           WHERE t.created_at BETWEEN ? AND ?
           GROUP BY o.id
           ORDER BY total_amount DESC
           LIMIT 5`,
          [todayStartStr, todayEndStr]
        );

        const txn      = txnRows[0];
        const orgs     = orgRows[0];
        const accounts = accountRows[0];
        const services = serviceRows[0];

        const total       = parseInt(txn.total_transactions) || 0;
        const successful  = parseInt(txn.successful)         || 0;
        const successRate = total > 0 ? ((successful / total) * 100).toFixed(2) : '0.00';

        return res.status(200).json({
          status: 'success',
          data: {
            date: new Date().toISOString().slice(0, 10),
            transactions: {
              today_total:        total,
              today_successful:   successful,
              today_pending:      parseInt(txn.pending)    || 0,
              today_failed:       parseInt(txn.failed)     || 0,
              today_cancelled:    parseInt(txn.cancelled)  || 0,
              today_reversed:     parseInt(txn.reversed)   || 0,
              success_rate:       `${successRate}%`,
              today_revenue:      txn.total_revenue         || 0,
              successful_revenue: txn.successful_revenue    || 0,
              pending_settlement: txn.pending_settlement    || 0,
              all_time_total:     parseInt(allTimeTxn[0].total) || 0
            },
            organizations: {
              total:          parseInt(orgs.total)          || 0,
              active:         parseInt(orgs.active)         || 0,
              pending_active: parseInt(orgs.pending_active) || 0,
              suspended:      parseInt(orgs.suspended)      || 0
            },
            accounts: {
              total_accounts: parseInt(accounts.total_accounts) || 0,
              total_balance:  accounts.total_balance            || 0
            },
            service_requests: {
              pending: parseInt(services.pending_requests) || 0
            },
            top_organizations: topOrgs
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