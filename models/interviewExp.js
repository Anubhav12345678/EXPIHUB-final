const mongoose = require("mongoose");

const InterviewexperienceSchema = new mongoose.Schema(
	{
		postedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		jobType: {
			type: String,
			required: true,
		},
		companyName: {
			type: String,
			required: true,
		},
		isoncampus: {
			type: Boolean,
			required: true,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model(
	"Interviewexperience",
	InterviewexperienceSchema
);
