import User from "../../models/user.model.js";

export const createUser = (data) => User.create(data);

export const saveUser = (user) => user.save();

export const findbyEmail = (email) => User.findOne({ email });

export const findbyId = (id) => User.findById(id).select("-password");