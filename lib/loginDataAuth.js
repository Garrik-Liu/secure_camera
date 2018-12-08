const mongoose = require("mongoose");
const chalk = require("chalk");
const modelDatastore = require("../lib/model-datastore");
const md5 = require('md5-node');
const CONFIG = require("../config");

let Comment = null;

const KIND = "UserInfo";

const initialize = () => {
    return new Promise((resolve, reject) => {
        // let db = mongoose.createConnection(dbURI);
        let db = mongoose.createConnection(dbURI, { useNewUrlParser: true });

        db.on("error", err => {
            reject(err); // reject the promise with the provided error
        });
        db.once("open", () => {
            Comment = db.model("users", userSchema);

            resolve("Secess initialize MongoDB");
            console.log(chalk.red("+++++++++++++++"));
        });
    });
};

const registerUser = userData => {
    return new Promise((resolve, reject) => {
        if (userData.password_1 != userData.password_2) {
            reject({
                msg: "Password does not match",
                state: 0
            });
        } else {
            data = {
                email: userData.email,
                password: md5(userData.password_1)
            };
            modelDatastore.create(KIND, data, (err, savedData) => {
                if (err) {
                    next(err);
                    return;
                }

                resolve({
                    msg: "Success",
                    state: 1
                });
            });
        }
    });
};

const checkUser = userData => {
    return new Promise((resolve, reject) => {
        modelDatastore.query(KIND, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                if (result.length) {
                    if (result[0].password == md5(userData.password)) {
                        resolve({
                            msg: "Success",
                            state: 1,
                            userInfo: {
                                email: userData.email
                            }
                        });
                    } else {
                        reject({
                            msg: "Password does not match",
                            state: 0
                        });
                    }
                } else {
                    reject({
                        msg: "Email is not existed",
                        state: 0
                    });
                }
            }
        }, { prop: 'email', compare: '=', propVal: userData.email });
    });
};

const updatePassword = userData => {
    return new Promise((resolve, reject) => {
        if (userData.password != userData.password2) {
            console.log(chalk.bgCyan("The new passwords do not match."));
            reject();
        } else {
            bcrypt.genSalt(10, function(err, salt) {
                // Generate a "salt" using 10 rounds
                if (err) {
                    reject("There was an error encrypting the password");
                }
                bcrypt.hash(userData.password, salt, function(err, hash) {
                    // encrypt the password: "myPassword123"
                    // TODO: Store the resulting "hash" value in the DB
                    console.log(chalk.yellow(hash));
                    Comment.update({ user: userData.user }, { $set: { password: hash } }, { multi: false })
                        .exec()
                        .then(res => {
                            resolve();
                        });
                });
            });
        }
    }).catch(err => {
        reject("The new passwords do not match.");
    });
};

module.exports = {
    initialize,
    registerUser,
    checkUser,
    updatePassword
};