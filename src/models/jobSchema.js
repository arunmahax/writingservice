/**
 * MongoDB Schema for Recipe Generation Jobs
 */

const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'queued', 'generating', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  currentSection: {
    type: String,
    default: null
  },
  input: {
    title: { type: String, required: true },
    image1: String,
    image2: String,
    featuredImage: String,
    categories: String,
    authors: String
  },
  sections: {
    type: Map,
    of: {
      status: {
        type: String,
        enum: ['pending', 'generating', 'completed', 'failed']
      },
      data: mongoose.Schema.Types.Mixed,
      timestamp: Date,
      retries: { type: Number, default: 0 },
      error: String
    }
  },
  context: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  result: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  errors: [{
    section: String,
    message: String,
    timestamp: Date
  }],
  metadata: {
    attemptNumber: { type: Number, default: 1 },
    lastError: String,
    processingTime: Number,
    queuedAt: Date,
    startedAt: Date,
    completedAt: Date
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  collection: 'jobs'
});

// Indexes for better query performance
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ 'input.title': 'text' });
jobSchema.index({ createdAt: -1 });

// TTL index to auto-delete old completed jobs after 7 days
jobSchema.index({ createdAt: 1 }, { 
  expireAfterSeconds: 604800, // 7 days
  partialFilterExpression: { status: 'completed' }
});

// Methods
jobSchema.methods.updateProgress = function(progress) {
  this.progress = Math.min(100, Math.max(0, progress));
  return this.save();
};

jobSchema.methods.addError = function(section, message) {
  this.errors.push({
    section,
    message,
    timestamp: new Date()
  });
  return this.save();
};

jobSchema.methods.markCompleted = function(result) {
  this.status = 'completed';
  this.progress = 100;
  this.result = result;
  this.metadata.completedAt = new Date();
  
  if (this.metadata.startedAt) {
    this.metadata.processingTime = Date.now() - this.metadata.startedAt.getTime();
  }
  
  return this.save();
};

jobSchema.methods.markFailed = function(error) {
  this.status = 'failed';
  this.metadata.lastError = error;
  this.metadata.completedAt = new Date();
  
  if (this.metadata.startedAt) {
    this.metadata.processingTime = Date.now() - this.metadata.startedAt.getTime();
  }
  
  return this.save();
};

// Statics
jobSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

jobSchema.statics.getRecentJobs = function(limit = 50) {
  return this.find().sort({ createdAt: -1 }).limit(limit);
};

jobSchema.statics.cleanOldJobs = async function(daysOld = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const result = await this.deleteMany({
    createdAt: { $lt: cutoffDate },
    status: { $in: ['completed', 'failed'] }
  });
  
  return result.deletedCount;
};

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
