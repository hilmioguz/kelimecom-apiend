const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createSection = {
  body: Joi.object().keys({
    dictId: Joi.string().custom(objectId),
    name: Joi.string().required(),
    totalPages: Joi.number().optional(),
    order: Joi.number().optional(),
    pages: Joi.string().optional(),
    isActive: Joi.boolean(),
    isCompleted: Joi.boolean(),
    isControlled: Joi.boolean(),
    isDelivered: Joi.boolean(),
    controlAssigned: Joi.string().custom(objectId).optional(),
    userAssigned: Joi.string().custom(objectId).optional(),
  }),
};
const getNextSectionById = {
  params: Joi.object().keys({
    sectionId: Joi.string().custom(objectId),
  }),
};

const getSections = {
  query: Joi.object().keys({
    query: Joi.string().optional(),
    dictId: Joi.string().optional(),
    sortBy: Joi.array().optional(),
    sortDesc: Joi.array().optional(),
    itemsPerPage: Joi.number().optional(),
    page: Joi.number().optional(),
    perpage: Joi.number().optional(),
  }),
};

const getSectionById = {
  params: Joi.object().keys({
    sectionId: Joi.string().custom(objectId),
  }),
};
const sectionRegister = {
  params: Joi.object().keys({
    sectionId: Joi.string().custom(objectId),
    userId: Joi.string().custom(objectId),
    isModerater: Joi.boolean().optional(),
  }),
};
const sectionDelivered = {
  params: Joi.object().keys({
    sectionId: Joi.string().custom(objectId),
  }),
};
const sectionControlled = {
  params: Joi.object().keys({
    sectionId: Joi.string().custom(objectId),
    userSubmitted: Joi.string().custom(objectId),
  }),
};
const getSectionByName = {
  params: Joi.object().keys({
    name: Joi.string(),
  }),
};

const updateSection = {
  params: Joi.object().keys({
    sectionId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      dictId: Joi.string().custom(objectId),
      name: Joi.string().required(),
      totalPages: Joi.number().optional(),
      order: Joi.number().optional(),
      pages: Joi.string().optional(),
      isActive: Joi.boolean().optional(),
      isCompleted: Joi.boolean().optional(),
      isControlled: Joi.boolean().optional(),
      isDelivered: Joi.boolean().optional(),
      controlAssigned: Joi.string().custom(objectId).optional(),
      userAssigned: Joi.string().custom(objectId).optional(),
    })
    .min(1),
};

const deleteSection = {
  params: Joi.object().keys({
    sectionId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createSection,
  getSections,
  getSectionById,
  getSectionByName,
  updateSection,
  sectionRegister,
  sectionControlled,
  sectionDelivered,
  deleteSection,
  getNextSectionById,
};
