const { User, Task } = require("../models/user");

module.exports = function (router) {
    var taskRoute = router.route('/tasks');
    var taskIdRoute = router.route('/tasks/:id');

    // for taskid, its req.params.id
    taskRoute.get(async function (req, res) {
        const filter = req.query.where
                    ? JSON.parse(req.query.where)
                    : {};
        let query = Task.find(filter); 
        if (req.query.count && req.query.count === "true") {
            query = Task.countDocuments(filter);
        } 
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
        
        try {
            const result = await query.exec();
            res.status(200).json({ message:"Ok", data: result});
        } catch (err) {
            res.status(500).json({message:err.message, data: err });
        }
    });

    // Invalid task: request succeeded (status 201) but should have been rejected
    taskRoute.post(async function (req, res) {
        const {name,description, deadline, completed, assignedUser, assignedUserName, dateCreated} = req.body;
        const task = new Task({name,description, deadline, completed, assignedUser, assignedUserName, dateCreated});

        if (!name || !deadline  || typeof name !== 'string' || !(deadline instanceof Date)) {
            return res.status(400).json({message: "Name and deadline not set", data: err });
        }

        try{
            await task.save();
            return res.status(201).json({message:"ok", data:task});
        } catch (err) {
            return res.status(400).json({message:err.message, data: err });
        }
    });

    taskIdRoute.get(async function (req, res) {
        const taskId = req.params.id;
        const filter = req.query.where
            ? JSON.parse(req.query.where)
            : {};
        let query = Task.findById(taskId);
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
            query = query.countDocuments({_id:taskId});
        } 
        try {
            const result = await query.exec();
            if (!result) {
                res.status(404).json({ message: "Task not found" });
            } else {
                res.status(200).json({ message:"Ok", data: result});
            }
            
        } catch (err) {
            res.status(500).json({message:err.message, data: err });
        }
    });

    // Two-way reference broken: assigning a task to a user (Task -> User.pendingTasks) did not add it to the user's pendingTasks
    //assignedUser/assignedUserName that do not belong to the same user: request succeeded (status 200) but should have been rejected
    taskIdRoute.put(async function (req, res) {
        const taskId = req.params.id;
        const query = Task.findByIdAndUpdate(taskId, req.body, { new: true, runValidators: true });
        try {
            const taskVal = await Task.findById(taskId);
            if (!(taskVal.assignedUser && taskVal.assignedUserName) && (taskVal.assignedUser || taskVal.assignedUserName)) {
                return res.status(404).json({ message: "Task user data incorrect" });
            }
            if(taskVal.assignedUser) {
                const taskUser = await User.findById(taskVal.assignedUser);
                if(!taskUser || result.assignedUserName != taskUser.name) {
                    return res.status(404).json({ message: "Task user data incorrect" });
                }
            }
            const result = await query.exec();
            if (!result) {
                res.status(404).json({ message: "Task not found" });
            } else {
                res.status(200).json({ message:"Ok", data: result});
            }
        } catch (err) {
            res.status(404).json({message:err.message, data: err });
        }
    });
     taskIdRoute.delete(async function (req, res) {
        const taskId = req.params.id;
        const query = Task.findByIdAndDelete(taskId);
        try {
            const result = await query.exec();
            if (!result) {
                res.status(404).json({ message: "Task not found" });
            } else {
                res.status(204).json({ message: "Success",data:result });
            }
        } catch (err) {
            res.status(404).json({message:err.message, data: err });
        }
    });
    

    return router;
}
