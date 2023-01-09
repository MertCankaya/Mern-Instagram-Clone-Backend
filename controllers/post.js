const { validationResult } = require("express-validator");
const { default: mongoose } = require("mongoose");
const Post = require("../models/post");
const User = require("../models/user");

exports.getPosts = async (req, res, next) => {
  try {
    const user = await User.findById(req.body.userId);
    let filteredPosts = [];
    const posts = await Post.find();
    for (const iterator of user.following) {
      const creator = await User.findById(iterator.toString());

      for (const post of posts) {
        if (post.creator.toString() === iterator.toString()) {
          filteredPosts.push({ post, creator });
        }
      }
    }

    for (const iterator of user.posts) {
      if (!!iterator) {
        const post = await Post.findById(iterator);
        filteredPosts.push({ post, creator: user });
      }
    }

    res.status(200).json(filteredPosts.sort((a, b) => (a - b > 1 ? 1 : -1)));
  } catch (error) {
    next(error);
  }
};

exports.getExplorePosts = async (req, res) => {
  const posts = await Post.find();

  const postsWithOwner = [];

  for (const post of posts) {
    const postUser = await User.findById(post.creator);
    postsWithOwner.push({ post, postUser });
  }

  res.status(200).json(postsWithOwner.sort((a, b) => (a > b ? 1 : -1)));
};

exports.createPost = async (req, res, next) => {
  const description = req.body.description;
  const image = req.body.image;
  const creatorAsString = req.body.creator;
  const creator = mongoose.Types.ObjectId(creatorAsString);

  const post = new Post({
    description,
    image,
    creator,
  });
  const result = await post.save();
  await User.findOneAndUpdate(
    { _id: creatorAsString },
    { $push: { posts: result } }
  );

  res.status(201).json({
    post: post,
  });
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Post doesn't exsist.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ post });
  } catch (error) {
    next(error);
  }
};

exports.getPostviewerPost = async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.body.userId;
  try {
    const post = await Post.findById(mongoose.Types.ObjectId(postId));
    const user = await User.findById(userId);
    if (!post) {
      const error = new Error("Post doesn't exsist.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ post, user });
  } catch (error) {
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = Post.findById(postId);
    if (post.creator.toString() !== req.userId) {
      const error = new Error("Not authorized!");
      error.statusCode = 403;
      throw error;
    }
    const user = await User.findById(req.userId);
    await Post.findByIdAndRemove(postId);
    user.posts.pull(postId);
    await user.save();
    res.status(200).json({ message: "Post Deleted!" });
  } catch (error) {
    next(error);
  }
};

exports.likePost = async (req, res, next) => {
  const postId = req.params.postId;
  const post = await Post.findById(postId);
  const user = await User.findById(req.body.userId);
  try {
    if (post.likes.includes(user._id) === false) {
      await Post.findOneAndUpdate({ _id: postId }, { $push: { likes: user } });
    }
    res.status(200).json();
  } catch (error) {
    next(error);
  }
};

exports.addComment = async (req, res) => {
  const postId = req.params.postId;
  const comment = req.body.comment;
  const userId = req.body.userId;
  const user = await User.findById(userId);
  await Post.findOneAndUpdate(
    { _id: postId },
    {
      $push: {
        comments: {
          comment,
          owner: {
            id: userId,
            profilePic: user.profilePic,
            username: user.name,
          },
        },
      },
    }
  );

  res.status(200).json("");
};
