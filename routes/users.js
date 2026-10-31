const { User, Task } = require("../models/user");

module.exports = function (router) {
    var userRoute = router.route('/users');
    var userIdRoute = router.route('/users/:id');

    // for userid, its req.params.id
    userRoute.get(async function (req, res) {
        /*Add query handling:
            - where: filter results based on JSON query
            - sort: specify the order in which to sort each specified field (1- ascending; -1 - descending) 
            - select: specify the set of fields to include or exclude in each document (1 - include; 0 - exclude)
            - skip: specify the number of results to skip in the result set; useful for pagination
            - limit: specify the number of results to return (default should be 100 for tasks and unlimited for users)
            - count:if set to true, return the count of documents that match the query (instead of the documents themselves)
        */
        const filter = req.query.where
            ? JSON.parse(req.query.where)
            : {};
        let query = User.find(filter); 
        if(req.query.sort) {
            query = query.sort(JSON.parse(req.query.sort));
        } 
        if(req.query.select) {
            query = query.select(JSON.parse(req.query.select));
        }
        if(req.query.skip) {
            query = query.skip(Number(req.query.skip));
        }
        if(req.query.limit) {
            query = query.limit(Number(req.query.limit));
        } 
        if (req.query.count && req.query.count === "true") {
            query = User.countDocuments(filter);
        } 

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
        if (!name || !email || typeof name != 'string' || typeof email != 'string') {
            return res.status(400).json({message:"missing required data"});
        }
        try{
            const result = await user.save();
            if(result.pendingTasks && result.pendingTasks.length !== 0) {
                const taskResult = await Task.updateMany({ _id: { $in:result.pendingTasks } },
                                                         { $set: { assignedUser: result._id, assignedUserName: result.name} });

            }
            return res.status(201).json({message:"ok", data:user});
        } catch (err) {
            return res.status(400).json({message:err.message, data: err });
        }
    });

    userIdRoute.get(async function (req, res) {
        const userId = req.params.id;
        const filter = req.query.where
            ? JSON.parse(req.query.where)
            : {};
        let query = User.findById(userId); 
        if(req.query.sort) {
            query = query.sort(JSON.parse(req.query.sort));
        } 
        if(req.query.select) {
            query = query.select(JSON.parse(req.query.select));
        }
        if(req.query.skip) {
            query = query.skip(Number(req.query.skip));
        }
        if(req.query.limit) {
            query = query.limit(Number(req.query.limit));
        } 
        if (req.query.count && req.query.count === "true") {
            query = query.countDocuments({_id: userId});
        } 
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
            const old_user = await User.findById(userId);
            const result = await query.exec();
            if (!result) {
                res.status(404).json({ message: "User not found" });
            } else {
                if(result.pendingTasks && old_user.pendingTasks) {
                    const taskResult = await Task.updateMany({ _id: { $in:result.pendingTasks.filter(newTask => !old_user.pendingTasks.some(oldTask => oldTask.toString() === newTask.toString())) } },
                                                            { $set: { assignedUser: result._id, assignedUserName: result.name} });
                }
                if (old_user.pendingTasks && old_user.pendingTasks.length !== 0) {
                    const oldTaskResult = await Task.updateMany({ _id: { $in:old_user.pendingTasks.filter(oldTask => !result.pendingTasks.some(newTask => oldTask.toString() === newTask.toString())) }, assignedUser:userId },
                                                        { $set: { assignedUser: '', assignedUserName: ''} });
                }
                res.status(200).json({ message:"Ok", data: result});
            }
        } catch (err) {
            res.status(500).json({message:err.message, data: err });
        }
    });

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
