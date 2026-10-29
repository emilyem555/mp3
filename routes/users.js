const { User } = require("../models/user");

module.exports = function (router) {
    var userRoute = router.route('/users');
    var userIdRoute = router.route('/users/:id');

    // for userid, its req.params.id
    userRoute.get(async function (req, res) {
        const query = User.find();
        try {
            const result = await query.exec();
            res.status(200).json({ message:"Ok", data: result});
        } catch (err) {
            res.status(500).json({message:err.message, data: err });
        }
    });
    userRoute.post(async function (req, res) {
        const {name,email, pendingTasks, dateCreated} = req.body;
        const user = new User({name,email, pendingTasks, dateCreated});
        try{
            await user.save();
            res.status(201).json({message:"ok", data:user});
        } catch (err) {
            res.status(400).json({message:err.message, data: err });
        }
    });

    userIdRoute.get(async function (req, res) {
        const userId = req.params.id;
        const query = User.findById(userId);
        try {
            const result = await query.exec();
            if (!result) {
                res.status(404).json({ message: "User not found" });
            } else {
                res.status(200).json({ message:"Ok", data: result});
            }
            
        } catch (err) {
            res.status(500).json({message:err.message, data: err });
        }
    });

    // Two-way reference broken: a task added to a user's pendingTasks (User.pendingTasks -> Task) was not assigned to that user (found assignedUser: "", assignedUserName: "unassigned"
    userIdRoute.put(async function (req, res) {
        const userId = req.params.id;
        const query = User.findByIdAndUpdate(userId, req.body, { new: true, runValidators: true });
        try {
            const result = await query.exec();
            if (!result) {
                res.status(404).json({ message: "User not found" });
            } else {
                res.status(200).json({ message:"Ok", data: result});
            }
        } catch (err) {
            res.status(500).json({message:err.message, data: err });
        }
    });

    // no error for tasks equivilent
    // Deleting a user: request failed, no response from server (ECONNABORTED)
     userIdRoute.delete(async function (req, res) {
        const userId = req.params.id;
        const query = User.findByIdAndDelete(userId);
        try {
            const result = await query.exec();
            if (!result) {
                res.status(404).json({ message: "User not found" });
            } else {
                res.status(204).json({ message: "Success",data:result });
            }
        } catch (err) {
            res.status(404).json({message:err.message, data: err });
        }
    });
    

    return router;
}
