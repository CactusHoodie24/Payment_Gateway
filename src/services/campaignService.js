const { v4: uuidv4 } = require('uuid');
const CampaignModel = require('../models/CampaignModel');
const CategoryModel  = require('../models/CategoryModel');

function generateCampaignCode() {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `FM-${year}-${rand}`;
}

const CampaignService = {
  async getAll(query) {
    const campaigns = await CampaignModel.getAll({ query });
    return { data: campaigns };
  },

  async getFeatured() {
    const campaigns = await CampaignModel.getFeatured();
    return { data: campaigns };
  },

  async getByCode(code) {
    const campaign = await CampaignModel.getByCode(code);
    if (!campaign) {
      throw { status: 404, message: 'Campaign not found.' };
    }
    return { data: campaign };
  },

  async getByCategory(categoryId) {
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      throw { status: 404, message: 'Category not found.' };
    }
    const campaigns = await CampaignModel.getByCategory(categoryId);
    return { data: campaigns };
  },

  async getUserCampaigns(userId) {
    const campaigns = await CampaignModel.getByUser(userId);
    return { data: campaigns };
  },

  async create(userId, body, files) {
    const { title, description, target_amount, closing_date, campaign_category_id, donation_mode, third_party_donation_url } = body;

    if (!title || !description || !target_amount || !closing_date || !campaign_category_id) {
      throw { status: 422, message: 'Missing required campaign fields.' };
    }

    const category = await CategoryModel.findById(campaign_category_id);
    if (!category) {
      throw { status: 422, message: 'Invalid campaign category.' };
    }

    const campaign_code = generateCampaignCode();

    const campaignId = await CampaignModel.create({
      campaign_code,
      user_id: userId,
      campaign_category_id,
      title,
      description,
      target_amount,
      closing_date,
      donation_mode: donation_mode || 'system',
      third_party_donation_url,
    });

    // Save uploaded images
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const imageUrl = `/uploads/${files[i].filename}`;
        await CampaignModel.addImage(campaignId, imageUrl, i === 0);
      }
    }

    return {
      message: 'Campaign created successfully and is pending review.',
      data: { campaign_code },
    };
  },

  async update(code, userId, body, files) {
    const campaign = await CampaignModel.getByCode(code);
    if (!campaign) {
      throw { status: 404, message: 'Campaign not found.' };
    }
    if (campaign.user_id !== userId) {
      throw { status: 403, message: 'You do not have permission to edit this campaign.' };
    }

    await CampaignModel.update(code, userId, body);

    // Append new images if uploaded
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const imageUrl = `/uploads/${files[i].filename}`;
        await CampaignModel.addImage(campaign.id, imageUrl, false);
      }
    }

    return { message: 'Campaign updated successfully.' };
  },
};

module.exports = CampaignService;
