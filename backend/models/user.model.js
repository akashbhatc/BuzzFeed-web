import mongoose from "mongoose"; //by using mongoose the interaction between the collection is easy 
const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
		},
		fullName: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
			minLength: 6,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			validate: {
				validator: function(v) {
					return /\S+@\S+\.\S+/.test(v);
				},//only valid email has to be entered 
				message: props => `${props.value} is not a valid email address!`,
			},
		},
		
		followers: {
			type: [{ //array maintained to the users/followers
				type: mongoose.Schema.Types.ObjectId, //refer to the object id given by the mongodb,similar to foreign keys 
				ref: "User", //refer the used model for followers 
			}],
			default: [],
		},
		//who all follow their id will be maintained taken from the user model
		following: {
			type: [{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			}],
			default: [], //initially zero followers
		},
		likedPosts: { //liked post maintained in the post model 
			type: [{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Post",//refer for the post model so as to get the liked post 
			}],
			default: [],
		},
		profileImg: {
			type: String, //image is also string type
			default: "",
		},
		coverImg: {
			type: String,
			default: "",
		},
		bio: {
			type: String,
			default: "",
		},

		link: {
			type: String,
			default: "",
		},
	},
	{ timestamps: true } // timestamp maintains the time of creation,updation , etc
);


const User = mongoose.model("User", userSchema);

export default User;


/*important*/
//type: mongoose.Schema.Types.ObjectId,
//ref: "User"