#!/usr/bin/env node

/**
 * MongoDB Index Creation Script
 * 
 * This script creates necessary indexes for performance optimization
 * Run this after updating the models to ensure indexes are created in MongoDB
 * 
 * Usage: node create-indexes.js
 */

const mongoose = require('mongoose');
const config = require('./src/config/config');
const logger = require('./src/config/logger');

// Import models to trigger index creation
const Madde = require('./src/models/madde.model');
const Dictionaries = require('./src/models/dictionaries.model');

const createIndexes = async () => {
  try {
    logger.info('🔗 Connecting to MongoDB...');
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info('✅ Connected to MongoDB');

    logger.info('📊 Creating indexes for Madde collection...');
    await Madde.createIndexes();
    logger.info('✅ Madde indexes created successfully');

    logger.info('📊 Creating indexes for Dictionaries collection...');
    await Dictionaries.createIndexes();
    logger.info('✅ Dictionaries indexes created successfully');

    // Get index information
    logger.info('\n📋 Current Madde indexes:');
    const maddeIndexes = await Madde.collection.getIndexes();
    Object.keys(maddeIndexes).forEach(indexName => {
      logger.info(`  - ${indexName}: ${JSON.stringify(maddeIndexes[indexName])}`);
    });

    logger.info('\n📋 Current Dictionaries indexes:');
    const dictIndexes = await Dictionaries.collection.getIndexes();
    Object.keys(dictIndexes).forEach(indexName => {
      logger.info(`  - ${indexName}: ${JSON.stringify(dictIndexes[indexName])}`);
    });

    logger.info('\n✅ All indexes created successfully!');
    logger.info('🚀 You can now restart your application for optimal performance.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error creating indexes:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

createIndexes();

