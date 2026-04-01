const catchAsync = require('../utils/catchAsync');
const SiteContent = require('../models/siteContentModel');

exports.getPublicSiteContent = catchAsync(async (req, res) => {
  const content = await SiteContent.getSingleton();
  res.status(200).json({
    status: 'success',
    data: { siteContent: content },
  });
});

exports.updateSiteContent = catchAsync(async (req, res) => {
  const content = await SiteContent.getSingleton();
  if (req.body.banners !== undefined) content.banners = req.body.banners;
  if (req.body.homepage !== undefined) {
    Object.assign(content.homepage, req.body.homepage);
  }
  await content.save();
  res.status(200).json({
    status: 'success',
    data: { siteContent: content },
  });
});
