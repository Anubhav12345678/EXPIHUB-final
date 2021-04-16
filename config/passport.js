// const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");
const conn = require("./database");
const bcrypt = require("bcrypt");
// we need to define the verify callback

// to make passport-local know where to look for username and apsswordfileds
function init(passport) {
	console.log("User yha aaya!!!");
	passport.use(
		new LocalStrategy(
			{ usernameField: "email" },
			async (email, password, done) => {
				// Login
				// check if email exists
				const user = await User.findOne({ email: email });
				if (!user) {
					console.log("User nhi mila!!!");
					return done(null, false, {
						message: "No user with this email",
					});
				}

				if (!user.confirmed) {
					// console.log("User email verify nhi kiya!!!");
					console.log("Please confirm your email to login");
					return done(null, false, {
						message: "Please confirm your email to login",
					});
				}

				bcrypt
					.compare(password, user.password)
					.then((match) => {
						if (match) {
							console.log("User success!!!");
							return done(null, user, {
								message: "Logged in succesfully",
							});
						}
						console.log("Wrong username or password");
						return done(null, false, {
							message: "Wrong username or password",
						});
					})
					.catch((err) => {
						console.log("Something went wrong!!");
						return done(null, false, {
							message: "Something went wrong",
						});
					});
			}
		)
	);

	passport.serializeUser((user, done) => {
		done(null, user._id);
	});

	passport.deserializeUser((userId, done) => {
		User.findById(userId)
			.then((user) => {
				done(null, user);
			})
			.catch((err) => done(err));
	});
}

module.exports = init;
