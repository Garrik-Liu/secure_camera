const createError = require("http-errors");
const express = require("express");
const path = require("path");
const logger = require("morgan");
const bodyParser = require("body-parser");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const CONFIG = require('./config');

const indexRouter = require("./routes/index");
const imagesRouter = require("./routes/images");
const trustRouter = require("./routes/trust");

const app = express();

app.setSocketIo = function(socket, io) {
    indexRouter.setSocketIo(socket, io);
    imagesRouter.setSocketIo(socket, io);
    trustRouter.setSocketIo(socket, io);
};

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("node_modules"));

app.use(cookieParser(CONFIG.signKey));
app.use(session({
    secret: CONFIG.signKey,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7
    },
    rolling: true
}));


app.use((req, res, next) => {
    app.locals.userInfo = {};
    app.locals.deviceStatus = 'on'
    next();
})

app.use("/", indexRouter);
app.use("/images", imagesRouter);
app.use("/trust", trustRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;