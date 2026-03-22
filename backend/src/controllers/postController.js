import Post from '../models/Post.js'
import Comment from '../models/Comment.js'
import Notification from '../models/Notification.js'
import { sendToUser } from '../config/websocket.js'

export async function getFeed(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    const followingIds = req.user.following

    const posts = await Post.find({ author: { $in: [...followingIds, req.user._id] } })
      .populate('author', 'username displayName avatar isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit + 1)

    const hasMore = posts.length > limit
    const result = posts.slice(0, limit).map(p => ({
      ...p.toJSON(),
      isLiked: p.likes.includes(req.user._id),
      commentsCount: 0
    }))

    res.json({ posts: result, hasMore, page })
  } catch (err) {
    next(err)
  }
}

export async function createPost(req, res, next) {
  try {
    const { content } = req.body
    const postData = { author: req.user._id, content }

    // Extract hashtags
    const hashtags = content.match(/#(\w+)/g)?.map(h => h.slice(1).toLowerCase()) || []
    postData.hashtags = hashtags

    if (req.file) postData.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`

    const post = await Post.create(postData)
    await post.populate('author', 'username displayName avatar isVerified')

    res.status(201).json({ ...post.toJSON(), isLiked: false, commentsCount: 0 })
  } catch (err) {
    next(err)
  }
}

export async function getPost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username displayName avatar isVerified')
    if (!post) return res.status(404).json({ message: 'Post not found' })
    res.json({ ...post.toJSON(), isLiked: post.likes.includes(req.user._id) })
  } catch (err) {
    next(err)
  }
}

export async function deletePost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })
    if (String(post.author) !== String(req.user._id)) return res.status(403).json({ message: 'Forbidden' })
    post.isDeleted = true
    await post.save()
    res.json({ message: 'Post deleted' })
  } catch (err) {
    next(err)
  }
}

export async function likePost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    const isLiked = post.likes.includes(req.user._id)
    if (isLiked) {
      post.likes.pull(req.user._id)
    } else {
      post.likes.push(req.user._id)
      // Notify post author
      if (String(post.author) !== String(req.user._id)) {
        const notif = await Notification.create({ recipient: post.author, from: req.user._id, type: 'like', post: post._id })
        await notif.populate('from', 'username displayName avatar')
        sendToUser(post.author, 'notification', notif)
      }
    }
    await post.save()
    res.json({ likesCount: post.likes.length, isLiked: !isLiked })
  } catch (err) {
    next(err)
  }
}

export async function getComments(req, res, next) {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('author', 'username displayName avatar')
      .sort({ createdAt: 1 })
    res.json(comments)
  } catch (err) {
    next(err)
  }
}

export async function addComment(req, res, next) {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    const comment = await Comment.create({ post: post._id, author: req.user._id, content: req.body.content })
    await comment.populate('author', 'username displayName avatar')

    if (String(post.author) !== String(req.user._id)) {
      const notif = await Notification.create({ recipient: post.author, from: req.user._id, type: 'comment', post: post._id })
      await notif.populate('from', 'username displayName avatar')
      sendToUser(post.author, 'notification', notif)
    }

    res.status(201).json(comment)
  } catch (err) {
    next(err)
  }
}

export async function getTrending(req, res, next) {
  try {
    const trending = await Post.aggregate([
      { $match: { isDeleted: false, createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } },
      { $unwind: '$hashtags' },
      { $group: { _id: '$hashtags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { tag: '$_id', count: 1, _id: 0 } }
    ])
    res.json(trending)
  } catch (err) {
    next(err)
  }
}
