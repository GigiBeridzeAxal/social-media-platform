import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true, minlength: 3, maxlength: 30 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 8 },
  displayName: { type: String, required: true, trim: true, maxlength: 50 },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  avatar: { type: String, default: null },
  coverImage: { type: String, default: null },
  bio: { type: String, maxlength: 160, default: '' },
  website: { type: String, default: '' },
  location: { type: String, default: '' },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isVerified: { type: Boolean, default: false },
  isPrivate: { type: Boolean, default: false }
}, { timestamps: true, toJSON: { virtuals: true } })

userSchema.virtual('followersCount').get(function () { return this.followers.length })
userSchema.virtual('followingCount').get(function () { return this.following.length })

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject({ virtuals: true })
  delete obj.password
  delete obj.followers
  delete obj.following
  return obj
}

export default mongoose.model('User', userSchema)
