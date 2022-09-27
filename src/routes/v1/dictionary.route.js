const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const dictionaryValidation = require('../../validations/dictionaries.validation');
const dictionaryController = require('../../controllers/dictionaries.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageDictionaries'), validate(dictionaryValidation.createDictionary), dictionaryController.createDictionary)
  .get(auth('freeZone'), validate(dictionaryValidation.getDictionaries), dictionaryController.getDictionaries);

router
  .route('/:dictId')
  .get(auth('freeZone'), validate(dictionaryValidation.getDictionaryById), dictionaryController.getDictionaryById)
  .patch(auth('manageDictionaries'), validate(dictionaryValidation.updateDictionary), dictionaryController.updateDictionary)
  .delete(
    auth('manageDictionaries'),
    validate(dictionaryValidation.deleteDictionary),
    dictionaryController.deleteDictionary
  );

router
  .route('/stat/:dictId')
  .get(auth('freeZone'), validate(dictionaryValidation.getDictionaryById), dictionaryController.getDictionaryStatById);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Madde
 *   description: Madde management and retrieval
 */

/**
 * @swagger
 * /madde:
 *   post:
 *     summary: Create a madde
 *     description: Only admins and moderater can create a madde.Moderater only access its own maddeler.
 *     tags: [Madde]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - madde
 *               - dictionaryName
 *               - correspondingId
 *               - dictId
 *             properties:
 *               madde:
 *                 type: string
 *                 description: must be unique
 *               dictionaryName:
 *                 type: string
 *               correspondingId:
 *                 type: string
 *               dictId:
 *                  type: string
 *             example:
 *               madde: kelime
 *               dictionaryName: Turkce Genel Sozluk
 *               correspondingId: ABC123
 *               dictId: DEF123
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Madde'
 *       "400":
 *         $ref: '#/components/responses/DuplicateMadde'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all madde
 *     description: Only admins and moderater can retrieve all madde.
 *     tags: [Madde]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: madde
 *         schema:
 *           type: string
 *         description: Madde teriminin kendisi
 *       - in: query
 *         name: dictionaryName
 *         schema:
 *           type: string
 *         description: Dictionary name
 *       - in: query
 *         name: tur
 *         schema:
 *           type: string
 *         description: Madde türü
 *       - in: query
 *         name: tip
 *         schema:
 *           type: string
 *         description: Madde tipi
 *       - in: query
 *         name: koken
 *         schema:
 *           type: string
 *         description: Madde kokeni
 *       - in: query
 *         name: cinsiyet
 *         schema:
 *           type: string
 *         description: Madde cinsiyeti
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. madde:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of madde
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Madde'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /madde/{id}:
 *   get:
 *     summary: Get a madde
 *     description: Logged in admin and moderater can fetch  madde. Only moderater can fetch and edit own madde.
 *     tags: [Madde]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Madde id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Madde'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a madde
 *     description: Logged in moderater can only update their own madde information. Only admins can update other users.
 *     tags: [Madde]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Madde id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               madde:
 *                 type: string
 *                 description: must be unique
 *               dictionaryName:
 *                 type: string
 *               correspondingId:
 *                 type: string
 *               dictId:
 *                  type: string
 *             example:
 *               madde: kelime
 *               dictionaryName: Turkce Genel Sozluk
 *               correspondingId: ABC123
 *               dictId: DEF123
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Madde'
 *       "400":
 *         $ref: '#/components/responses/DuplicateMadde'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a madde
 *     description: Logged in users can delete only themselves. Only admins can delete other user's madde.
 *     tags: [Madde]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Madde id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
