const { Task } = require("../models/user");

module.exports = function (router) {
    var taskRoute = router.route('/tasks');
    var taskIdRoute = router.route('/tasks/:id');

    // for taskid, its req.params.id
    taskRoute.get(async function (req, res) {
        const query = Task.find();
        try {
            const result = await query.exec();
            res.status(200).json({ message:"Ok", data: result});
        } catch (err) {
            res.status(500).json({message:err.message, data: err });
        }
    });
    taskRoute.post(async function (req, res) {
        const {name,description, deadline, completed, assignedUser, assignedUserName, dateCreated} = req.body;
        const task = new Task({name,description, deadline, completed, assignedUser, assignedUserName, dateCreated});
        try{
            await task.save();
            res.status(201).json({message:"ok", data:task});
        } catch (err) {
            res.status(500).json({message:err.message, data: err });
        }
    });

    taskIdRoute.get(async function (req, res) {
        const taskId = req.params.id;
        const query = Task.findById(taskId);
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
    taskIdRoute.put(async function (req, res) {
        const taskId = req.params.id;
        const query = Task.findByIdAndUpdate(taskId, req.body, { new: true, runValidators: true });
        try {
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
                res.status(200).json({ message: "Success",data:result });
            }
        } catch (err) {
            res.status(404).json({message:err.message, data: err });
        }
    });
    

    return router;
}
