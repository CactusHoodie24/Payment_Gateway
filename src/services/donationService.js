const DonationModel  = require('../models/DonationModel');
const CampaignModel  = require('../models/CampaignModel');
const AirtelService  = require('./airtelService');
const TnmService     = require('./tnmService');
const emailService   = require('./emailService');

const DonationService = {
  async initiateDonation({ campaign_code, donor_name, donor_phone, donor_email, amount, payment_method }) {
    // Validate campaign exists and is active
    const campaign = await CampaignModel.getByCode(campaign_code);
    if (!campaign) {
      throw { status: 404, message: 'Campaign not found.' };
    }
    if (campaign.status !== 'Active') {
      throw { status: 400, message: 'This campaign is not currently accepting donations.' };
    }
    if (!amount || amount <= 0) {
      throw { status: 422, message: 'Invalid donation amount.' };
    }

    let paymentResult;

    if (payment_method === 'airtel_money') {
      paymentResult = await AirtelService.initiatePayment({
        phone:         donor_phone,
        amount,
        campaignTitle: campaign.title,
      });
    } else if (payment_method === 'tnm_mpamba') {
      paymentResult = await TnmService.initiatePayment({
        phone:         donor_phone,
        amount,
        campaignTitle: campaign.title,
      });
    } else {
      throw { status: 400, message: `Payment method "${payment_method}" is not supported.` };
    }

    // Save pending donation to DB
    const donationId = await DonationModel.create({
      campaign_id:     campaign.id,
      donor_name,
      donor_phone,
      donor_email,
      amount,
      payment_method,
      transaction_ref: paymentResult.transaction_ref,
    });

    return {
      message:         'Payment initiated. Please complete the prompt on your phone.',
      transaction_ref: paymentResult.transaction_ref,
      donation_id:     donationId,
    };
  },

  // Called by payment gateway callbacks
  async handleCallback(payment_method, callbackBody) {
    let parsed;

    if (payment_method === 'airtel_money') {
      parsed = AirtelService.parseCallback(callbackBody);
    } else if (payment_method === 'tnm_mpamba') {
      parsed = TnmService.parseCallback(callbackBody);
    } else {
      throw { status: 400, message: 'Unknown payment method in callback.' };
    }

    const { transaction_ref, status, amount } = parsed;

    // Find the donation
    const donation = await DonationModel.findByTransactionRef(transaction_ref);
    if (!donation) {
      // Not found - may be a duplicate or stale callback
      return { message: 'Donation not found for this reference.' };
    }

    // Idempotency: ignore if already processed
    if (donation.status === 'success' || donation.status === 'failed') {
      return { message: 'Already processed.' };
    }

    // Update donation status
    await DonationModel.updateStatus(transaction_ref, status);

    // If successful, update campaign amount_raised
    if (status === 'success') {
      await CampaignModel.incrementAmountRaised(donation.campaign_id, donation.amount);

      // Send confirmation email if donor email was provided
      if (donation.donor_email) {
        const campaign = await CampaignModel.findById(donation.campaign_id);
        await emailService.sendDonationConfirmation(donation.donor_email, {
          donorName:     donation.donor_name || 'Donor',
          campaignTitle: campaign?.title || 'Campaign',
          amount:        donation.amount,
        }).catch(err => console.error('Email send failed:', err.message));
      }
    }

    return { message: 'Callback processed successfully.' };
  },
};

module.exports = DonationService;
