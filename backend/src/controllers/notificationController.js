import Notification from '../models/Notification.js'

export async function getNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('from', 'username displayName avatar')
      .populate('post', 'content')
      .sort({ createdAt: -1 })
      .limit(50)
    res.json(notifications)
  } catch (err) {
    next(err)
  }
}

export async function markAllRead(req, res, next) {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true })
    res.json({ message: 'All notifications marked as read' })
  } catch (err) {
    next(err)
  }
}

export async function markRead(req, res, next) {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true }
    )
    res.json({ message: 'Notification marked as read' })
  } catch (err) {
    next(err)
  }
}
