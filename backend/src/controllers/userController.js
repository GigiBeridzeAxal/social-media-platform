import User from '../models/User.js'
import Post from '../models/Post.js'
import Notification from '../models/Notification.js'
import { sendToUser } from '../config/websocket.js'

export async function getUser(req, res, next) {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -__v')
    if (!user) return res.status(404).json({ message: 'User not found' })

    const postsCount = await Post.countDocuments({ author: user._id })
    const isFollowing = req.user ? user.followers.includes(req.user._id) : false

    res.json({ ...user.toPublicJSON(), postsCount, isFollowing })
  } catch (err) {
    next(err)
  }
}

export async function getUserPosts(req, res, next) {
  try {
    const user = await User.findOne({ username: req.params.username })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const posts = await Post.find({ author: user._id })
      .populate('author', 'username displayName avatar isVerified')
      .sort({ createdAt: -1 })
      .limit(20)

    const result = posts.map(p => ({
      ...p.toJSON(),
      isLiked: req.user ? p.likes.includes(req.user._id) : false,
      commentsCount: 0
    }))

    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function followUser(req, res, next) {
  try {
    const target = await User.findById(req.params.id)
    if (!target) return res.status(404).json({ message: 'User not found' })
    if (String(target._id) === String(req.user._id)) {
      return res.status(400).json({ message: 'Cannot follow yourself' })
    }

    const isFollowing = target.followers.includes(req.user._id)
    if (isFollowing) {
      target.followers.pull(req.user._id)
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: target._id } })
    } else {
      target.followers.push(req.user._id)
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: target._id } })
      const notif = await Notification.create({ recipient: target._id, from: req.user._id, type: 'follow' })
      await notif.populate('from', 'username displayName avatar')
      sendToUser(target._id, 'notification', notif)
    }
    await target.save()
    res.json({ followersCount: target.followers.length, isFollowing: !isFollowing })
  } catch (err) {
    next(err)
  }
}

export async function getSuggestedUsers(req, res, next) {
  try {
    const users = await User.find({
      _id: { $nin: [...req.user.following, req.user._id] }
    })
      .select('username displayName avatar followersCount isVerified')
      .sort({ createdAt: -1 })
      .limit(5)

    res.json(users.map(u => ({ ...u.toJSON(), isFollowing: false })))
  } catch (err) {
    next(err)
  }
}
