import { ObjectId } from "mongodb";
import { User } from "../models/userModel.js";
import { Post } from "../models/postModel.js";
import { Comment } from "../models/commentModel.js";
const postController = {
  // gets post for each user

  getIndex: async (req, res) => {
    var result = await db.findMany(
     // Comments,
      {},
      "date upvotes username content"
    );
    console.log(result);

    res.render("indiv-post", {
      comment: result,
    });
  },

  getPost: async (req, res) => {
    try {
      let canEdit= false;
      let canEditComment=false;
      const param_postid = req.params.id;
      console.log("post id", param_postid);

      const posts = await Post.find({_id:new ObjectId(param_postid)}).populate({ path: 'username', model: User }).lean().exec();
      const comments=await Comment.find({post:new ObjectId(param_postid)}).populate({ path: 'username', model: User }).lean().exec();
      console.log(comments);
      //console.log(posts);
      
      if (posts) {
        if (req.session.authorized) {
          console.log("Authorized session in getProfile")
          const nav_user = await User.findOne({username: req.session.user.username}).lean().exec();
          // check post
          if(nav_user.username==posts[0].username.username){
            canEdit=true;
          }
          else{
            canEdit=false;
          }

          // Loop through all comments and update canEditComment
          for (const comment of comments) {
            if (nav_user.username === comment.username.username) {
              comment.canEditComment = true;
              comment.commentPfp = nav_user.picture;
            } else {
              comment.canEditComment = false;
              comment.commentPfp = nav_user.picture;
            }
          }
          
          res.render("indiv-post", {
            title: "Edit profile",
            upvotes: posts[0].upvotes,
            downvotes: posts[0].downvotes,
            title: posts[0].title,
            tag: posts[0].tag,
            pfp: posts[0].username.picture,
            username: posts[0].username.username,
            date: posts[0].date,
            content: posts[0].content,
            id: posts[0]._id,
            comments:comments.map(comment => ({ ...comment, commentId: comment._id, commentCaption: comment.content })),
            navusername:nav_user.username,
            navpfp:nav_user.picture,
            notAuth: false,
            canEdit:canEdit
          });
        }else{
          // console.log("working");
          res.render("indiv-post", {
            upvotes: posts[0].upvotes,
            downvotes: posts[0].downvotes,
            title: posts[0].title,
            tag: posts[0].tag,
            pfp: posts[0].username.picture,
            username: posts[0].username.username,
            date: posts[0].date,
            content: posts[0].content,
            id: posts[0]._id,
            comments:comments.map(comment => ({ ...comment, commentId: comment._id, commentCaption: comment.content })),
            notAuth: true,
            canEdit:false
          });
        }
      } else {
        res.render("error", {
          title: "Page not Found.",
        });
      }
    } catch (err) {
      console.error(err);
      res.render("error", {
        title: "Page not Found.",
      });
    }
  },

  // saves post edits to database
  saveContent: async (req, res) => {
    console.log("POST request for update in content post received");
    console.log(req.body.edited);
    try {
      let updateResult = await Post.updateOne(
        { _id: new ObjectId(req.body.id) },
        {
          $set: {
            content: req.body.content,
            edited: true
          },
        }
      );
      console.log(updateResult);
      res.sendStatus(200);
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  },

  getComment: async (req, res) => {
    try {
      const param_cmtid = req.params.id;
      console.log("comment id", param_cmtid);

      const existCmnt = await Post.findOne({
        _id: new ObjectId(param_cmtid),
      });

      if (existCmnt) {
        res.render("indiv-post", {
          upvotes: existCmnt.upvotes,
          downvotes: existCmnt.downvotes,
          username: existCmnt.username,
          date: existCmnt.date,
          content: existCmnt.content,
          id: existCmnt._id,
        });
      } else {
        res.render("error", {
          title: "Page not Found.",
        });
      }
    } catch (err) {
      res.render("error", {
        title: "Page not Found.",
      });
    }
  },

  // save comment edits to database
  saveComment: async function (req, res) {
    console.log("POST request for update in content comment received");
    console.log(req.body.edited);
    try {
      let updateResult = await Comment.updateOne(
        { _id: new ObjectId(req.body.id) },
        {
          $set: {
            content: req.body.content,
            edited: req.body.edited,
          },
        }
      );
      console.log(updateResult);
      res.sendStatus(200);
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  },

  getDelete: async function (req, res) {
    const id = req.body.id; 

    try {
        const result = await Post.deleteOne({_id: id}).exec();
        const deleteAllComments = await Comment.deleteMany({post: id}).exec();
        console.log(result);
        console.log(deleteAllComments);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
  },

  deleteComment: async function(req, res) {
    const {post, id} = req.body;
    const currentUrl = req.url;

    try {
        const result = await Comment.deleteOne({_id: id}).exec();
        console.log(result);
        res.redirect(currentUrl);

        if (result.deletedCount === 1){
          // Update the corresponding Post's comments array
          await Post.findByIdAndUpdate(
            post,
            { $pull: { comments: id }}, // Add the new comment's ObjectId to the comments array
            { new: true }
          );
        }
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
  },

  addComment: async (req, res) => {
    const newCommentData = req.body;
    console.log("POST request for add new comment received");
    console.log('Received new comment data:', newCommentData);

    const {post, date, content, upvotes, downvotes, edited} = req.body;
    try {
      const newComment = await Comment.create({
        username: new ObjectId(req.session.user._id),
        post,
        date,
        content,
        upvotes,
        downvotes,
        edited
      });

      // Update the corresponding Post's comments array
      await Post.findByIdAndUpdate(
        post,
        { $push: { comments: newComment._id } }, // Add the new comment's ObjectId to the comments array
        { new: true }
      );
    // Respond with a success status code and message
    res.sendStatus(200);
  } catch (err) {
    // Handle errors and respond with an error status code and message
    console.error('Error adding post:', err);
    res.sendStatus(500);
  }
}
};

// Vote on a post (either upvote or downvote)
export const votePost = async (req, res) => {
  const { id } = req.params;
  const { voteType } = req.body; // Should be either "upvote" or "downvote"

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (voteType === "upvote") {
      post.upvotes += 1;
    } else if (voteType === "downvote") {
      post.downvotes += 1;
    } else {
      return res.status(400).json({ message: "Invalid vote type" });
    }

    await post.save();

    return res.status(200).json({
      message: `${voteType.charAt(0).toUpperCase() + voteType.slice(1)}d successfully`,
      upvotes: post.upvotes,
      downvotes: post.downvotes,
    });
  } catch (error) {
    console.error(`Error ${voteType}ing post:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default postController;

