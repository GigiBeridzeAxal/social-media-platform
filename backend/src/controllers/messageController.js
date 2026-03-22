import { Conversation, Message } from '../models/Message.js'
import { sendToUser } from '../config/websocket.js'

export async function getConversations(req, res, next) {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'username displayName avatar')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })

    const result = conversations.map(c => {
      const participant = c.participants.find(p => String(p._id) !== String(req.user._id))
      const unread = false // simplified
      return { _id: c._id, participant, lastMessage: c.lastMessage, unread, updatedAt: c.updatedAt }
    })

    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function getMessages(req, res, next) {
  try {
    const conv = await Conversation.findOne({ _id: req.params.convId, participants: req.user._id })
    if (!conv) return res.status(404).json({ message: 'Conversation not found' })

    const messages = await Message.find({ conversation: conv._id })
      .populate('sender', 'username displayName avatar')
      .sort({ createdAt: 1 })
      .limit(100)

    const result = messages.map(m => ({ ...m.toJSON(), isMine: String(m.sender._id) === String(req.user._id) }))
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function sendMessage(req, res, next) {
  try {
    const conv = await Conversation.findOne({ _id: req.params.convId, participants: req.user._id })
    if (!conv) return res.status(404).json({ message: 'Conversation not found' })

    const message = await Message.create({ conversation: conv._id, sender: req.user._id, content: req.body.content })
    await message.populate('sender', 'username displayName avatar')

    conv.lastMessage = message._id
    await conv.save()

    const recipient = conv.participants.find(p => String(p) !== String(req.user._id))
    sendToUser(recipient, 'message', { ...message.toJSON(), isMine: false })

    res.status(201).json({ ...message.toJSON(), isMine: true })
  } catch (err) {
    next(err)
  }
}

export async function startConversation(req, res, next) {
  try {
    const { userId } = req.body
    let conv = await Conversation.findOne({ participants: { $all: [req.user._id, userId] } })
    if (!conv) {
      conv = await Conversation.create({ participants: [req.user._id, userId] })
    }
    await conv.populate('participants', 'username displayName avatar')
    const participant = conv.participants.find(p => String(p._id) !== String(req.user._id))
    res.json({ _id: conv._id, participant, lastMessage: null, unread: false })
  } catch (err) {
    next(err)
  }
}
