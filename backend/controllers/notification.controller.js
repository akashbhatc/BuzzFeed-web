import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;//my id

    const notifications = await Notification.find({ to: userId }).populate({ //find all the notification in which to field is my id 
      path: "from",
      select: "username profileImg",
    });//populate the from field with username and profile img 

    await Notification.updateMany({ to: userId }, { read: true }); //if notification is read then change read to true 

    res.status(200).json(notifications);
  } catch (error) {
    console.log("Error in getNotifications function", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//delete all the notifications that is recieved by me 
export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id; //my id

    await Notification.deleteMany({ to: userId }); //delete notification recieved by me 

    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.log("Error in deleteNotifications function", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
//id can be populated using populate method , path tells what to populate , select tells what to select from the users db 