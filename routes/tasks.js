const { Task } = require("../models/user");

module.exports = function (router) {

    var taskRoute = router.route('/tasks');

    taskRoute.get(async function (req, res) {
        const query = Task.find();
        query.collection(Task.collection);
        try {
            result = await query.exec();
            res.status(200).json({ data: result});
        } catch (err) {
            res.status(500).json({ data: err });
        }
    });
    
    taskRoute.post(async function (req, res) {
        const {name,description, deadline, completed, assignedUser, assignedUserName, dateCreated} = req.body;
        const task = new Task({name,description, deadline, completed, assignedUser, assignedUserName, dateCreated});
        try{
            await task.save();
            res.status(200).json(task);
        } catch (err) {
            res.status(500).json({ data: err });
        }
    });

    return router;
}
