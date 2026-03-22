import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true, maxlength: 280 },
  image: { type: String, default: null },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  hashtags: [{ type: String, lowercase: true }],
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true, toJSON: { virtuals: true } })

postSchema.virtual('likesCount').get(function () { return this.likes.length })

postSchema.index({ author: 1, createdAt: -1 })
postSchema.index({ hashtags: 1 })
postSchema.index({ content: 'text' })

postSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false })
  next()
})

export default mongoose.model('Post', postSchema)
