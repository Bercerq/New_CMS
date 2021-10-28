import * as mongoose from "mongoose";
import * as uniqid from "uniqid";

export const CategorySchema = new mongoose.Schema({
  categoryID: {
    type: String,
    unique: true,
    readonly: true,
  },
  name: {
    type: String,
    unique: true,
    required: true,
  },
  description: {
    type: String,
  },
  subcategories: {
    type: Array,
  },
  categoryImage: {
    type: String,
    default: null,
  },
  viewed: {
    type: Number,
    default: 0,
  },
});

CategorySchema.pre("save", async function (next: mongoose.HookNextFunction) {
  try {
    if (!this.isModified("categoryID")) this["categoryID"] = uniqid("id-c_");

    return next();
  } catch (e) {
    return next(e);
  }
});
