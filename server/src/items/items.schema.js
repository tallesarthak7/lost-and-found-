const { Schema, model } = require("mongoose");

const itemSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Item title is required"],
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: ["wallet", "phone", "bag", "id", "electronics", "others"],
      index: true,
    },

    type: {
      type: String,
      enum: ["lost", "found"],
      required: true,
      index: true,
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    imageURL: {
      type: String,
      default: null,
    },

    // relation
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "claimed", "closed"],
      default: "pending",
      index: true,
    },

    verifiedByAdmin: {
      type: Boolean,
      default: false,
    },

    // admin tracking (better than just boolean)
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // extra useful for matching
    keywords: [
      {
        type: String,
        trim: true,
      },
    ],

    // optional: geo support (future upgrade)
    coordinates: {
      lat: Number,
      lng: Number,
    },

    // moderation
    isFlagged: {
      type: Boolean,
      default: false,
    },

    // soft delete
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Item = model("Item", itemSchema);
module.exports = Item;
