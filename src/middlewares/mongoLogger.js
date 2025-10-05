const mongoose = require('mongoose');

// MongoDB query logging middleware
class MongoLogger {
  constructor() {
    this.queries = new Map();
    this.setupMongooseLogging();
  }

  setupMongooseLogging() {
    // Mongoose query middleware'leri
    mongoose.plugin((schema) => {
      // Pre-find middleware
      schema.pre(['find', 'findOne', 'findOneAndUpdate', 'findOneAndDelete', 'count', 'countDocuments', 'distinct', 'aggregate'], function() {
        const queryId = this._id || Math.random().toString(36).substr(2, 9);
        const startTime = Date.now();
        
        // Query bilgilerini sakla
        this._queryId = queryId;
        this._startTime = startTime;
        
        // Query detaylarını logla
        const queryInfo = {
          operation: this.op || 'unknown',
          collection: this.model?.collection?.name || 'unknown',
          query: this.getQuery ? this.getQuery() : this._conditions,
          options: this.getOptions ? this.getOptions() : {},
          startTime: new Date().toISOString(),
          queryId: queryId
        };

        console.log(`🔍 [MONGO-QUERY-START] ID: ${queryId}`);
        console.log(`📊 Collection: ${queryInfo.collection}`);
        console.log(`⚡ Operation: ${queryInfo.operation}`);
        console.log(`🔎 Query:`, JSON.stringify(queryInfo.query, null, 2));
        console.log(`⚙️ Options:`, JSON.stringify(queryInfo.options, null, 2));
        console.log(`⏰ Start Time: ${queryInfo.startTime}`);
        console.log('─'.repeat(80));
      });

      // Post-find middleware
      schema.post(['find', 'findOne', 'findOneAndUpdate', 'findOneAndDelete', 'count', 'countDocuments', 'distinct', 'aggregate'], function(result) {
        const endTime = Date.now();
        const duration = endTime - this._startTime;
        const queryId = this._queryId;

        // Result bilgilerini logla
        const resultInfo = {
          queryId: queryId,
          duration: `${duration}ms`,
          resultCount: Array.isArray(result) ? result.length : (result ? 1 : 0),
          endTime: new Date().toISOString(),
          memoryUsage: process.memoryUsage()
        };

        console.log(`✅ [MONGO-QUERY-END] ID: ${queryId}`);
        console.log(`⏱️ Duration: ${resultInfo.duration}`);
        console.log(`📈 Result Count: ${resultInfo.resultCount}`);
        console.log(`🏁 End Time: ${resultInfo.endTime}`);
        console.log(`💾 Memory: ${Math.round(resultInfo.memoryUsage.heapUsed / 1024 / 1024)}MB`);
        
        // Yavaş sorguları özel olarak işaretle
        if (duration > 1000) {
          console.log(`🐌 [SLOW QUERY] ${duration}ms - Collection: ${this.model?.collection?.name}`);
        }
        
        console.log('═'.repeat(80));
      });

      // Error middleware
      schema.post(['find', 'findOne', 'findOneAndUpdate', 'findOneAndDelete', 'count', 'countDocuments', 'distinct', 'aggregate'], function(error) {
        if (error) {
          const endTime = Date.now();
          const duration = endTime - this._startTime;
          const queryId = this._queryId;

          console.log(`❌ [MONGO-QUERY-ERROR] ID: ${queryId}`);
          console.log(`⏱️ Duration: ${duration}ms`);
          console.log(`🚨 Error:`, error.message);
          console.log(`📊 Collection: ${this.model?.collection?.name}`);
          console.log(`🔎 Query:`, JSON.stringify(this.getQuery ? this.getQuery() : this._conditions, null, 2));
          console.log('═'.repeat(80));
        }
      });
    });

    // Connection event logging
    mongoose.connection.on('connected', () => {
      console.log('🔗 [MONGO-CONNECTION] Connected to MongoDB');
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 [MONGO-CONNECTION] Disconnected from MongoDB');
    });

    mongoose.connection.on('error', (error) => {
      console.log('❌ [MONGO-CONNECTION] Error:', error.message);
    });

    // Query performance summary
    setInterval(() => {
      this.logPerformanceSummary();
    }, 60000); // Her dakika
  }

  logPerformanceSummary() {
    console.log('📊 [MONGO-PERFORMANCE] Connection Status:', {
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
    });
  }

  // Manuel query logging için helper method
  logCustomQuery(collection, operation, query, duration, resultCount) {
    console.log(`🔧 [MONGO-CUSTOM] Collection: ${collection}`);
    console.log(`⚡ Operation: ${operation}`);
    console.log(`🔎 Query:`, JSON.stringify(query, null, 2));
    console.log(`⏱️ Duration: ${duration}ms`);
    console.log(`📈 Result Count: ${resultCount}`);
    console.log('─'.repeat(80));
  }
}

// Singleton instance
const mongoLogger = new MongoLogger();

module.exports = mongoLogger;
