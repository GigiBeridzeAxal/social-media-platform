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
  bio: { type: String, maxlength: 160, default: '' },
  website: { type: String, default: '' },
  location: { type: String, default: '' },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isVerified: { type: Boolean, default: false },
  isPrivate: { type: Boolean, default: false }
}, { timestamps: true })

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.followers
  delete obj.following
  obj.followersCount = this.followers?.length || 0
  obj.followingCount = this.following?.length || 0
  return obj
}

export default mongoose.models.User || mongoose.model('User', userSchema)
