const mongoose = require('mongoose');

const siteContentSchema = new mongoose.Schema(
  {
    banners: [
      {
        title: String,
        subtitle: String,
        imageUrl: String,
        linkUrl: String,
        order: { type: Number, default: 0 },
        active: { type: Boolean, default: true },
      },
    ],
    homepage: {
      heroTitle: String,
      heroSubtitle: String,
      heroImageUrl: String,
      heroBadge: String,
      collectionsHeading: String,
      collectionsSubheading: String,
    },
  },
  { timestamps: true }
);

siteContentSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({
      banners: [],
      homepage: {},
    });
  }
  return doc;
};

const SiteContent = mongoose.model('SiteContent', siteContentSchema);

module.exports = SiteContent;
