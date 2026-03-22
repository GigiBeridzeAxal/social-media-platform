import User from '../models/User.js'
import Post from '../models/Post.js'

export async function search(req, res, next) {
  try {
    const q = req.query.q?.trim()
    if (!q) return res.json({ users: [], posts: [] })

    const regex = new RegExp(q, 'i')

    const [users, posts] = await Promise.all([
      User.find({ $or: [{ username: regex }, { displayName: regex }] })
        .select('username displayName avatar followersCount isVerified')
        .limit(10),
      Post.find({ $text: { $search: q } })
        .populate('author', 'username displayName avatar isVerified')
        .sort({ score: { $meta: 'textScore' } })
        .limit(10)
    ])

    const usersWithFollow = users.map(u => ({
      ...u.toJSON(),
      isFollowing: req.user.following.includes(u._id)
    }))

    const postsWithLike = posts.map(p => ({
      ...p.toJSON(),
      isLiked: p.likes.includes(req.user._id),
      commentsCount: 0
    }))

    res.json({ users: usersWithFollow, posts: postsWithLike })
  } catch (err) {
    next(err)
  }
}
