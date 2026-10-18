const { getPrisma } = require("./prisma.js");

// Polyfill .equals on String so any string ID behaves like MongoDB ObjectId
if (!String.prototype.equals) {
  String.prototype.equals = function (other) {
    if (!other) return false;
    return this.toString() === other.toString();
  };
}

/**
 * Format a document row so that:
 * 1. Both `id` and `_id` are always present
 * 2. Populated relational fields are mapped to expected keys
 * 3. Has .save(), .toObject(), .toJSON()
 */
function wrapDocument(doc, modelName) {
  if (!doc) return null;

  const row = { ...doc };
  row.id = String(row.id);
  row._id = row.id;

  // Map relations if included
  if (row.lostItem) {
    row.lostItemId = wrapDocument(row.lostItem, "Item");
  }
  if (row.foundItem) {
    row.foundItemId = wrapDocument(row.foundItem, "Item");
  }
  if (row.item) {
    row.itemId = wrapDocument(row.item, "Item");
  }
  if (row.match) {
    row.matchId = wrapDocument(row.match, "Match");
  }
  if (row.postedBy) {
    row.postedBy = wrapDocument(row.postedBy, "User");
  }
  if (row.verifiedBy) {
    row.verifiedBy = wrapDocument(row.verifiedBy, "User");
  }
  if (row.claimedBy) {
    row.claimedBy = wrapDocument(row.claimedBy, "User");
  }
  if (row.reviewedBy) {
    row.reviewedBy = wrapDocument(row.reviewedBy, "User");
  }

  // Define helper methods
  row.toObject = function () {
    const copy = { ...this };
    delete copy.save;
    delete copy.toObject;
    delete copy.toJSON;
    return copy;
  };

  row.toJSON = function () {
    return this.toObject();
  };

  row.save = async function () {
    const prisma = getPrisma();
    if (!prisma) throw new Error("Database is not connected.");

    const { id, _id, toObject, toJSON, save, lostItem, foundItem, item, match, ...dataToSave } = this;
    const cleanData = cleanPayloadForPrisma(dataToSave, modelName);

    const clientModel = getClientModel(prisma, modelName);
    const updated = await clientModel.update({
      where: { id: this.id },
      data: cleanData,
    });

    Object.assign(this, wrapDocument(updated, modelName));
    return this;
  };

  return row;
}

function getClientModel(prisma, modelName) {
  switch (modelName.toLowerCase()) {
    case "user":
      return prisma.user;
    case "item":
      return prisma.item;
    case "match":
      return prisma.match;
    case "claim":
      return prisma.claim;
    default:
      throw new Error(`Unknown model: ${modelName}`);
  }
}

/**
 * Maps JS/Mongo payload keys to Prisma model properties
 */
function cleanPayloadForPrisma(data, modelName) {
  const result = {};

  for (const [key, val] of Object.entries(data)) {
    if (val === undefined || typeof val === "function") continue;
    if (key === "_id" || key === "id" || key === "save" || key === "toObject" || key === "toJSON") continue;

    // Model specific mappings
    if (modelName === "Item") {
      if (key === "postedBy") {
        result.postedById = typeof val === "object" && val ? val.id || val._id : String(val);
        continue;
      }
      if (key === "verifiedBy") {
        result.verifiedById = val ? (typeof val === "object" ? val.id || val._id : String(val)) : null;
        continue;
      }
      if (key === "coordinates" && val) {
        if (val.lat !== undefined) result.coordinatesLat = val.lat != null ? parseFloat(val.lat) : null;
        if (val.lng !== undefined) result.coordinatesLng = val.lng != null ? parseFloat(val.lng) : null;
        continue;
      }
      if (key === "date" && val) {
        result.date = new Date(val);
        continue;
      }
    }

    if (modelName === "Claim") {
      if (key === "itemId") {
        result.itemId = typeof val === "object" && val ? val.id || val._id : String(val);
        continue;
      }
      if (key === "claimedBy") {
        result.claimedById = typeof val === "object" && val ? val.id || val._id : String(val);
        continue;
      }
      if (key === "reviewedBy") {
        result.reviewedById = val ? (typeof val === "object" ? val.id || val._id : String(val)) : null;
        continue;
      }
      if (key === "matchId") {
        result.matchId = val ? (typeof val === "object" ? val.id || val._id : String(val)) : null;
        continue;
      }
    }

    if (modelName === "Match") {
      if (key === "lostItemId") {
        result.lostItemId = typeof val === "object" && val ? val.id || val._id : String(val);
        continue;
      }
      if (key === "foundItemId") {
        result.foundItemId = typeof val === "object" && val ? val.id || val._id : String(val);
        continue;
      }
    }

    result[key] = val;
  }

  delete result.save;
  delete result.toObject;
  delete result.toJSON;
  delete result.id;
  delete result._id;

  return result;
}

/**
 * Transforms MongoDB-style filters to Prisma `where` clause
 */
function transformFilterToWhere(filter = {}, modelName) {
  if (!filter || Object.keys(filter).length === 0) return {};

  const where = {};

  for (const [key, value] of Object.entries(filter)) {
    if (value === undefined) continue;

    // Handle $or
    if (key === "$or" && Array.isArray(value)) {
      where.OR = value.map((subFilter) => transformFilterToWhere(subFilter, modelName));
      continue;
    }

    // Handle _id / id
    if (key === "_id" || key === "id") {
      if (value && typeof value === "object") {
        if (value.$ne) where.id = { not: String(value.$ne) };
        else if (value.$in) where.id = { in: value.$in.map(String) };
        else where.id = String(value);
      } else {
        where.id = String(value);
      }
      continue;
    }

    // Map foreign key field names
    let prismaField = key;
    if (modelName === "Item") {
      if (key === "postedBy") prismaField = "postedById";
      if (key === "verifiedBy") prismaField = "verifiedById";
    } else if (modelName === "Claim") {
      if (key === "claimedBy") prismaField = "claimedById";
      if (key === "reviewedBy") prismaField = "reviewedById";
    }

    // Handle operators
    if (value && typeof value === "object" && !(value instanceof Date) && !Array.isArray(value)) {
      const fieldCond = {};

      if (value.$regex !== undefined) {
        fieldCond.contains = String(value.$regex);
        fieldCond.mode = "insensitive";
      }
      if (value.$in !== undefined && Array.isArray(value.$in)) {
        fieldCond.in = value.$in.map((item) => (item instanceof RegExp ? item.source : item));
      }
      if (value.$nin !== undefined && Array.isArray(value.$nin)) {
        fieldCond.notIn = value.$nin;
      }
      if (value.$ne !== undefined) {
        fieldCond.not = value.$ne;
      }
      if (value.$gte !== undefined) {
        fieldCond.gte = value.$gte;
      }
      if (value.$lte !== undefined) {
        fieldCond.lte = value.$lte;
      }
      if (value.$gt !== undefined) {
        fieldCond.gt = value.$gt;
      }
      if (value.$lt !== undefined) {
        fieldCond.lt = value.$lt;
      }

      if (key === "keywords") {
        if (value.$in) {
          where.keywords = { hasSome: value.$in.map(String) };
          continue;
        }
      }

      where[prismaField] = fieldCond;
    } else if (value instanceof RegExp) {
      where[prismaField] = {
        contains: value.source,
        mode: "insensitive",
      };
    } else {
      where[prismaField] = value;
    }
  }

  return where;
}

/**
 * Builds standard Prisma include from populate specs
 */
function buildPrismaInclude(populateList, modelName) {
  if (!populateList || populateList.length === 0) return undefined;

  const include = {};

  for (const pop of populateList) {
    const path = typeof pop === "string" ? pop : pop.path;

    if (modelName === "Item") {
      if (path === "postedBy") include.postedBy = true;
      if (path === "verifiedBy") include.verifiedBy = true;
    } else if (modelName === "Match") {
      if (path === "lostItemId") include.lostItem = { include: { postedBy: true } };
      if (path === "foundItemId") include.foundItem = { include: { postedBy: true } };
    } else if (modelName === "Claim") {
      if (path === "itemId") {
        if (pop.populate && pop.populate.path === "postedBy") {
          include.item = { include: { postedBy: true } };
        } else {
          include.item = true;
        }
      }
      if (path === "matchId") {
        include.match = { include: { lostItem: true, foundItem: true } };
      }
      if (path === "claimedBy") include.claimedBy = true;
      if (path === "reviewedBy") include.reviewedBy = true;
    }
  }

  return Object.keys(include).length > 0 ? include : undefined;
}

/**
 * Chainable Query Builder providing full Mongoose method compatibility over Prisma
 */
class QueryBuilder {
  constructor(modelName, action, initialFilter = {}) {
    this.modelName = modelName;
    this.action = action; // "find", "findOne", "findById", "count"
    this.filter = initialFilter;
    this._selectFields = null;
    this._skip = undefined;
    this._limit = undefined;
    this._orderBy = undefined;
    this._populates = [];
    this._distinctField = null;
  }

  select(fields) {
    this._selectFields = fields;
    return this;
  }

  sort(sortObj) {
    if (sortObj) {
      this._orderBy = [];
      for (const [col, dir] of Object.entries(sortObj)) {
        const key = col === "_id" ? "id" : col;
        this._orderBy.push({
          [key]: dir === -1 || dir === "desc" ? "desc" : "asc",
        });
      }
    }
    return this;
  }

  skip(n) {
    this._skip = parseInt(n, 10) || 0;
    return this;
  }

  limit(n) {
    this._limit = parseInt(n, 10);
    return this;
  }

  populate(spec, select) {
    if (typeof spec === "string") {
      this._populates.push({ path: spec, select });
    } else if (typeof spec === "object" && spec) {
      this._populates.push(spec);
    }
    return this;
  }

  distinct(field) {
    this._distinctField = field;
    return this;
  }

  async exec() {
    const prisma = getPrisma();
    if (!prisma) {
      throw new Error("Database is connecting or unavailable. Please check DATABASE_URL.");
    }

    const clientModel = getClientModel(prisma, this.modelName);
    const where = transformFilterToWhere(this.filter, this.modelName);

    if (this.action === "count") {
      return await clientModel.count({ where });
    }

    if (this.action === "findOne" || this.action === "findById") {
      const include = buildPrismaInclude(this._populates, this.modelName);
      const row = await clientModel.findFirst({
        where,
        include,
      });

      if (!row) return null;

      if (this._selectFields && typeof this._selectFields === "string") {
        if (this._selectFields.includes("-password")) {
          delete row.password;
        }
      }

      return wrapDocument(row, this.modelName);
    }

    // Standard "find"
    const include = buildPrismaInclude(this._populates, this.modelName);
    const queryArgs = {
      where,
      skip: this._skip,
      take: this._limit,
      orderBy: this._orderBy,
      include,
    };

    const rows = await clientModel.findMany(queryArgs);

    // If distinct was called (e.g. .distinct("_id"))
    if (this._distinctField) {
      const fieldKey = this._distinctField === "_id" ? "id" : this._distinctField;
      const values = rows.map((r) => r[fieldKey] || r.id);
      return Array.from(new Set(values));
    }

    return rows.map((r) => {
      if (this._selectFields && typeof this._selectFields === "string") {
        if (this._selectFields.includes("-password")) {
          delete r.password;
        }
      }
      return wrapDocument(r, this.modelName);
    });
  }

  // Makes QueryBuilder directly awaitable with `await Model.find(...)`
  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

/**
 * Creates a Model interface for a given entity
 */
function createModel(modelName) {
  function ModelConstructor(data = {}) {
    Object.assign(this, cleanPayloadForPrisma(data, modelName));
    return this;
  }

  ModelConstructor.prototype.save = async function () {
    const prisma = getPrisma();
    if (!prisma) throw new Error("Database is connecting or unavailable.");

    const clientModel = getClientModel(prisma, modelName);
    const cleanData = cleanPayloadForPrisma(this, modelName);

    const created = await clientModel.create({
      data: cleanData,
    });

    Object.assign(this, wrapDocument(created, modelName));
    return this;
  };

  ModelConstructor.find = function (filter = {}) {
    return new QueryBuilder(modelName, "find", filter);
  };

  ModelConstructor.findOne = function (filter = {}) {
    return new QueryBuilder(modelName, "findOne", filter);
  };

  ModelConstructor.findById = function (id) {
    return new QueryBuilder(modelName, "findById", { id: String(id) });
  };

  ModelConstructor.countDocuments = function (filter = {}) {
    return new QueryBuilder(modelName, "count", filter);
  };

  ModelConstructor.create = async function (data) {
    const prisma = getPrisma();
    if (!prisma) throw new Error("Database is connecting or unavailable.");

    const clientModel = getClientModel(prisma, modelName);
    const cleanData = cleanPayloadForPrisma(data, modelName);
    const created = await clientModel.create({ data: cleanData });
    return wrapDocument(created, modelName);
  };

  ModelConstructor.insertMany = async function (docs = []) {
    const prisma = getPrisma();
    if (!prisma) throw new Error("Database is connecting or unavailable.");

    const clientModel = getClientModel(prisma, modelName);
    const createdList = [];

    for (const doc of docs) {
      const cleanData = cleanPayloadForPrisma(doc, modelName);
      const created = await clientModel.create({ data: cleanData });
      createdList.push(wrapDocument(created, modelName));
    }

    return createdList;
  };

  ModelConstructor.findByIdAndUpdate = function (id, update = {}, options = {}) {
    const query = {
      _selectFields: null,
      _populates: [],
      select(fields) {
        this._selectFields = fields;
        return this;
      },
      populate(spec) {
        if (typeof spec === "string") {
          this._populates.push({ path: spec });
        } else if (spec) {
          this._populates.push(spec);
        }
        return this;
      },
      async exec() {
        const prisma = getPrisma();
        if (!prisma) throw new Error("Database is connecting or unavailable.");

        const clientModel = getClientModel(prisma, modelName);
        const dataToUpdate = update.$set ? update.$set : update;
        const cleanData = cleanPayloadForPrisma(dataToUpdate, modelName);

        const include = buildPrismaInclude(this._populates, modelName);

        const updated = await clientModel.update({
          where: { id: String(id) },
          data: cleanData,
          include,
        });

        if (this._selectFields && typeof this._selectFields === "string") {
          if (this._selectFields.includes("-password")) {
            delete updated.password;
          }
        }

        return wrapDocument(updated, modelName);
      },
      then(resolve, reject) {
        return this.exec().then(resolve, reject);
      },
      catch(reject) {
        return this.exec().catch(reject);
      },
    };

    return query;
  };

  ModelConstructor.updateMany = async function (filter = {}, update = {}) {
    const prisma = getPrisma();
    if (!prisma) throw new Error("Database is connecting or unavailable.");

    const clientModel = getClientModel(prisma, modelName);
    const where = transformFilterToWhere(filter, modelName);
    const dataToUpdate = update.$set ? update.$set : update;
    const cleanData = cleanPayloadForPrisma(dataToUpdate, modelName);

    return await clientModel.updateMany({
      where,
      data: cleanData,
    });
  };

  // Special aggregate method for analytics Overview
  if (modelName === "Item") {
    ModelConstructor.aggregate = async function (pipeline = []) {
      const prisma = getPrisma();
      if (!prisma) return [];

      const matchStage = pipeline.find((s) => s.$match)?.$match || {};
      const groupStage = pipeline.find((s) => s.$group)?.$group || {};
      const limitStage = pipeline.find((s) => s.$limit)?.$limit || 5;

      const where = transformFilterToWhere(matchStage, "Item");

      if (groupStage._id === "$category") {
        const grouped = await prisma.item.groupBy({
          by: ["category"],
          where,
          _count: { category: true },
          orderBy: { _count: { category: "desc" } },
          take: limitStage,
        });
        return grouped.map((g) => ({
          _id: g.category,
          count: g._count.category,
        }));
      }

      if (groupStage._id === "$location") {
        const grouped = await prisma.item.groupBy({
          by: ["location"],
          where,
          _count: { location: true },
          orderBy: { _count: { location: "desc" } },
          take: limitStage,
        });
        return grouped.map((g) => ({
          _id: g.location,
          count: g._count.location,
        }));
      }

      return [];
    };
  }

  return ModelConstructor;
}

module.exports = {
  createModel,
  wrapDocument,
};
