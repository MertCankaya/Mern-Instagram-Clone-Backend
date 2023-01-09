const { default: mongoose } = require("mongoose");
const User = require("../models/user");

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res) => {
  const user = await User.findById(req.body.userId);
  res.status(200).json(user);
};

exports.getSuggestedUsers = async (req, res) => {
  const loggedUser = await User.findById(req.body.userId);
  const users = await User.find();
  if (loggedUser?.following.length > 0) {
    for (const followingId of loggedUser.following) {
      const index = users.findIndex(
        (user) => user._id.toString() === followingId.toString()
      );
      if (!!index) {
        users.splice(index, 1);
      }
    }
  }
  const dropUserItselfArr = users.filter((user) => {
    return loggedUser?._id.toString() !== user._id.toString();
  });

  res.status(200).json(dropUserItselfArr);
};

exports.followUser = async (req, res) => {
  const loggedUser = await User.findById(req.body.loggedUserId);
  const followingUser = await User.findById(req.body.followingUserId);

  if (!loggedUser.following.includes(mongoose.Types.ObjectId(followingUser))) {
    await User.findOneAndUpdate(
      { _id: req.body.loggedUserId },
      { $push: { following: followingUser } }
    );

    await User.findOneAndUpdate(
      { _id: req.body.followingUserId },
      { $push: { followers: loggedUser } }
    );
  }
  res.status(201).json();
};

exports.getFollowingUsers = async (req, res) => {
  const userId = req.body.userId;
  const user = await User.findById(userId);
  const followingUsers = [];
  for (const following of user.following) {
    const followingUser = await User.findById(following);
    followingUsers.push(followingUser);
  }

  res.status(200).json(followingUsers);
};

exports.getMessages = async (req, res) => {
  const userId = req.body.userId;
  const otherUserId = req.body.otherUserId;
  const result = await User.findById(userId);
  let messages = [];
  for (const message of result.messages) {
    if (
      message.otherUserId.toString() === otherUserId ||
      message.userId.toString() === otherUserId
    ) {
      messages.push(message);
    }
  }
  res.status(200).json(messages);
};

exports.uploadMessage = async (req, res) => {
  const userId = req.body.userId;
  const otherUserId = req.body.otherUserId;
  const message = req.body.message;
  await User.findOneAndUpdate(
    {
      _id: userId,
    },
    {
      $push: {
        messages: {
          userId,
          otherUserId,
          message,
        },
      },
    }
  );
  await User.findOneAndUpdate(
    { _id: otherUserId },
    {
      $push: {
        messages: {
          otherUserId,
          userId,
          message,
        },
      },
    }
  );
  res.status(200).json();
};
