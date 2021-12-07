import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
	firstName: {'type': String, "required": true},
	lastName: {'type': String, "required": true},
	username: {'type': String, "required": true},
	email: {'type': String, "required": true},
	hash: { 'type': String, "required": true},
	accessGroups: {'type': String, "required": true},
}, 

// const UserSchema = new mongoose.Schema({
// 	firstName: {'type': String},
// 	lastName: {'type': String},
// 	username: {'type': String},
// 	email: {'type': String},
// 	password: { 'type': String},
// 	accessGroups: {'type': String},
// }, 
{
	timestamps: true,
	versionKey: false,
	collection: "users"

})

const UserModel = mongoose.model('UserModel', UserSchema);

export default UserModel;