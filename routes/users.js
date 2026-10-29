const { User } = require("../models/user");

module.exports = function (router) {

    var userRoute = router.route('/users');

    userRoute.get(async function (req, res) {
        const query = User.find();
        query.collection(User.collection);
        try {
            result = await query.exec();
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
            res.status(500).json({message:err.message, data: err });
        }
    });

    return router;
}
