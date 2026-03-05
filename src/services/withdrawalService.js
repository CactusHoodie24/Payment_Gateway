const WithdrawalModel = require('../models/WithdrawalModel');
const DonationModel   = require('../models/DonationModel');
const CampaignModel   = require('../models/CampaignModel');

const WithdrawalService = {
  async requestWithdrawal(userId, { campaign_code, amount, account_number, account_name, bank_or_wallet }) {
    const campaign = await CampaignModel.getByCode(campaign_code);
    if (!campaign) {
      throw { status: 404, message: 'Campaign not found.' };
    }
    if (campaign.user_id !== userId) {
      throw { status: 403, message: 'You do not own this campaign.' };
    }

    const totalRaised    = await DonationModel.getTotalRaised(campaign.id);
    const totalWithdrawn = await WithdrawalModel.getTotalWithdrawn(campaign.id);
    const available      = totalRaised - totalWithdrawn;

    if (amount > available) {
      throw {
        status:  400,
        message: `Insufficient funds. Available balance: MWK ${available.toLocaleString()}`,
      };
    }

    const withdrawalId = await WithdrawalModel.create({
      campaign_id:   campaign.id,
      user_id:       userId,
      amount,
      account_number,
      account_name,
      bank_or_wallet,
    });

    return {
      message: 'Withdrawal request submitted. It will be reviewed within 1-3 business days.',
      withdrawal_id: withdrawalId,
    };
  },

  async getUserWithdrawals(userId) {
    const withdrawals = await WithdrawalModel.getByUser(userId);
    return { data: withdrawals };
  },

  async getCampaignWithdrawals(campaignCode, userId) {
    const campaign = await CampaignModel.getByCode(campaignCode);
    if (!campaign) throw { status: 404, message: 'Campaign not found.' };
    if (campaign.user_id !== userId) throw { status: 403, message: 'Access denied.' };

    const withdrawals = await WithdrawalModel.getByCampaign(campaign.id);
    const totalRaised    = await DonationModel.getTotalRaised(campaign.id);
    const totalWithdrawn = await WithdrawalModel.getTotalWithdrawn(campaign.id);

    return {
      data: withdrawals,
      summary: {
        total_raised:    totalRaised,
        total_withdrawn: totalWithdrawn,
        available:       totalRaised - totalWithdrawn,
      },
    };
  },
};

module.exports = WithdrawalService;
