const express = require("express");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid"); //unique strings
const Router = express.Router();
const passport = require("passport");
const User = require("./models/User");
const interviewexperience = require("./models/interviewExp");
const authenticateUser = require("./middlewares/authenticateUser");
const isAuth = require("./middlewares/chkauthenticate");
const bcrypt = require("bcrypt");
const bcryptjs = require("bcryptjs");
// require("./config/passport");
const path = require("path");

// file uploading
const multer = require("multer");
var empModel = require("./modules/employee");
var uploadModel = require("./modules/upload"); //database sai lene ke liye

var employee = empModel.find({});
var imageData = uploadModel.find({});

// const upload = multer({
//     dest: 'images'
// })
// Router.post('/upload', upload.single('upload'), (req, res) => {
//     res.send()
// })
// Router.use(express.static(__dirname + "./public/"));

// if (typeof localStorage === "undefined" || localStorage === null) {
//   const LocalStorage = require('node-localstorage').LocalStorage;
//   localStorage = new LocalStorage('./scratch');
// }

var Storage = multer.diskStorage({
	destination: "./public/uploads/",
	filename: (req, file, cb) => {
		cb(
			null,
			file.fieldname + "_" + Date.now() + path.extname(file.originalname)
		);
	},
});

var upload = multer({
	storage: Storage,
}).single("file");

/* GET home page. */
Router.post("/upload", upload, function (req, res, next) {
	var imageFile = req.file.filename;
	var success = req.file.filename + " uploaded successfully";

	var imageDetails = new uploadModel({
		imagename: imageFile,
	});
	imageDetails.save(function (err, doc) {
		if (err) throw err;

		imageData.exec(function (err, data) {
			//to view the existing file also
			if (err) throw err;
			res.render("file_upload", {
				title: "Upload File",
				records: data,
				success: success,
			});
		}); //saara data records mai save hojayege
	});
});

// mongodb cloud connection is here

// const publicDirectoryPath = path.join(__dirname, './public')
// console.log(publicDirectoryPath);

// route for serving frontend files

Router.get("/", (req, res) => {
	// console.log(req.session);
	var f = 0;
	console.log(req.session);
	console.log(req.user);
	if (req.user) {
		res.render("index", { user: req.user });
	} else {
		res.render("index", { user: null });
	}
});
Router.get("/login", authenticateUser, (req, res) => {
	res.render("login");
});
Router.get("/register", authenticateUser, (req, res) => {
	res.render("register");
});

Router.get("/interviewexperience", async (req, res) => {
	const exps = await interviewexperience.find().populate("postedBy").exec();
	try {
		console.log(exps);
		// res.send(exps);
		if (!exps) {
			res.render("interviewexperience", {
				exps: new interviewexperience(),
			});
		} else {
			res.render("interviewexperience", { exps: exps });
		}
	} catch (err) {
		console.log(err);
	}
});

Router.post("/interviewexperience", async (req, res) => {
	const { title, description, jobType, companyName, isoncampus } = req.body;
	if (!title || !description || !jobType || !companyName) {
		return res.redirect("/interviewexperience");
	}
	const inexp = new interviewexperience({
		postedBy: req.user._id,
		title,
		description,
		jobType,
		companyName,
		isoncampus,
	});
	console.log(inexp);
	await inexp
		.save()
		.then((data) => {
			console.log("Interview Exp successfully entered!!");
			return res.redirect("/interviewexperience");
		})
		.catch((err) => {
			console.log(err);
		});
});

Router.get("/home", (req, res) => {
	res.render("home");
});
// Router.get("/upload", (req, res) => {
//   res.render("file_upload");
// })
Router.get("/upload", function (req, res, next) {
	imageData.exec(function (err, data) {
		if (err) throw err;
		res.render("file_upload", {
			title: "Upload File",
			records: data,
			success: "",
		});
	});
});
Router.get("/verify/:uniqueString", async (req, res) => {
	const { uniqueString } = req.params;
	const user = await User.findOne({ uniqueString: uniqueString });
	if (user) {
		user.confirmed = true;
		await user.save();
		res.redirect("/login");
	} else {
		res.json("User not found");
	}
});

// Router.post(
// 	"/login",
// 	passport.authenticate("local", {
// 		successRedirect: "/",
// 		failureRedirect: "/login",
// 	})
// );
// route for handling post requests

Router.post("/login", (req, res, next) => {
	const { email, password } = req.body;
	if (!email || !password) {
		res.redirect("/login");
	}
	passport.authenticate("local", (err, user, info) => {
		// info object me message var aa jayega jo local strayegy ne bhja h
		if (err) {
			// req.flash('error', info.message )
			console.log(info);
			console.log("something went wrong");
			return res.redirect("/login");
		}
		if (!user) {
			// req.flash('error', info.message )
			// alert("No such user exists");
			console.log(info);
			console.log("No such user exists!!!");
			return res.redirect("/login");
		}

		if (!user.confirmed) {
			console.log(info);
			console.log("Confirm your email");
			// alert("Pleaseconfirm your email id");
			return res.redirect("/login");
		}

		req.logIn(user, (err) => {
			if (err) {
				// req.flash('error', info.message )
				console.log(info);
				console.log("something went wrong");
				return res.redirect("/login");
			}
			// alert("Success!!!!");
			console.log(info);
			console.log("Success!!!!");
			return res.redirect("/");
		});
	})(req, res, next);
	// const doesUserExits = await User.findOne({ email });
	// if (!doesUserExits) {
	// 	res.send("invalid username or password");
	// 	return;
	// }
	// if (!doesUserExits.confirmed) {
	// 	console.log("Confirm your email");
	// 	return res.redirect("/register");
	// }
	// const doesPasswordMatch = await bcrypt.compare(
	// 	password,
	// 	doesUserExits.password
	// );
	// if (!doesPasswordMatch) {
	// 	res.send("invalid username or password");
	// 	return;
	// }
	// console.log("user has been logged in successfully");
	// res.redirect("/");
});

const randString = () => {
	// const len=100
	let randStr = uuidv4();
	// for(let i=0;i<len; i++){
	//     const ch = Math.floor((Math.random() * 100) + 1)
	//     randStr+=ch
	// }
	return randStr;
};

// send Mail fun is starting

const sendEmail = (email, uniqueString) => {
	const Transport = nodemailer.createTransport({
		// connection
		service: "Gmail",
		auth: {
			user: process.env.MY_GMAIL_USERID,
			pass: process.env.MY_GMAIL_PASS,
		},
	});

	var mailOptions = {
		from: "EXPI_HUB",
		to: email,
		subject: "Email Verification",
		html: `Thank you for registeration . <br> Press <a href=http://localhost:4000/verify/${uniqueString}> here </a> to verify your email. Thanks`,
	};
	Transport.sendMail(mailOptions, function (error, res) {
		if (error) {
			console.log(error);
		} else console.log("message send via nodemailer ");
	});
};

Router.post("/register", async (req, res) => {
	if (
		Object.entries(req.body).length === 0 &&
		req.body.constructor === Object
	) {
		res.send({ message: "Please provide a body" });
	} else {
		const {
			firstName,
			lastName,
			collegeId,
			email,
			course,
			graduationYear,
			password,
			RepeatPassword,
		} = req.body;
		try {
			const doesUserExitsAlready = await User.findOne({ email: email });
			if (doesUserExitsAlready) {
				// res.send("A user with that email already exits please try another one!");
				// res.redirect('/home');
				res.render("home", {
					user: { email: "samsonnkrumah253@gmail.com" },
				});
			} else {
				let salt = await bcryptjs.genSalt(10);
				let hashedPassword = await bcryptjs.hash(password, salt);
				// const hashedPassword = await bcrypt.hash(password, 12);
				// const hashedRepeatPassword = await bcrypt.hash(RepeatPassword, 12);
				const uniqueString = randString();
				const latestUser = new User({
					firstName,
					lastName,
					collegeId,
					email,
					course,
					graduationYear,
					password: hashedPassword,
					RepeatPassword: hashedPassword,
					uniqueString: uniqueString,
				});
				await latestUser
					.save()
					.then((user) => {
						// res.send("please verify your email-id");
						console.log("registered successfully");
						sendEmail(user.email, uniqueString);
					})
					.catch((error) => {
						console.log(error);
					});
				console.log(latestUser);

				//-----------------------------------
				// res.send("registered account!");
				//-----------------------------------

				res.render("login");
			}
		} catch (err) {
			console.log(err);
			res.send(err);
		}
	}
});
// const userinfo=req.body;
// console.log(userinfo);
// const { firstName,lastName,collegeId,email,course,graduationYear,password ,RepeatPassword} = req.body;

// // check for missing fields
// if (!email || !password || !firstName || !lastName || !collegeId  || !course || !graduationYear || !RepeatPassword) {
//   res.send("Please enter all the fields");
//   res.redirect('/home');
// }

// const doesUserExitsAlready = await User.findOne({ email });

// if (doesUserExitsAlready) {
//   res.send("A user with that email already exits please try another one!");
//   res.redirect('/home');
// }

// // lets hash the password
// const hashedPassword = await bcrypt.hash(password, 12);
// // const hashedRepeatPassword = await bcrypt.hash(Repeatpassword, 12);
// const latestUser = new User({firstName,lastName,collegeId,email,course,graduationYear, hashedPassword, hashedPassword});

// latestUser.save()
//   .then(() => {
//     res.send("registered account!");
//     res.redirect('/home');
//   })
//   .catch((err) => console.log(err));

//logout
Router.get("/logout", authenticateUser, (req, res) => {
	// req.session.user = null;
	req.logout();
	res.redirect("/login");
});

module.exports = Router;
