var irc = require("irc"),
    path = require("path"),
    fs = require("fs"),
    express = require("express");

// Web
var app = express.createServer(express.logger()),
    port = process.env.PORT || 5000;

    app.configure(function() {
        app.use(express.static(__dirname + "/logs"));
        app.use(express.directory(__dirname + "/logs", {
            icons: true
        }));
        app.use(express.errorHandler());
    });

    app.listen(port, function() {
        console.log("Listening on " + port);
    });

// Worker
var config = {
    server: "irc.freenode.net",
    nick: "clonebot",
    channels: ["#clonewars"],
    path: "logs",
    debug: true,
    connect: false
}

var client = new irc.Client(config.server, config.nick, {
        channels: config.channels,
        debug: config.debug,
        autoConnect: config.connect
    });

    client.addListener("message#", function(from, to, message) {
        logger.write("<" + from + "> " + message);
    });

    client.addListener("action", function(from, to, message) {
        logger.write(" * " + from + " " + message);
    });

var logger = {
    file: null,
    day: null,
    write: function(text) {
        var date = new Date(),
            today = [
                date.getFullYear(),
                ("0" + (date.getMonth() + 1)).substr(-2),
                ("0" + date.getDate()).substr(-2)
            ].join("-"),
            time = [
                ("0" + date.getHours()).substr(-2),
                ("0" + date.getMinutes()).substr(-2)
            ].join(":");

        if (!this.file || this.day !== today) {
            var file_path = path.join(config.path, today + ".log");
            this.file = fs.createWriteStream(file_path, {
                flags: "a+", encoding: "utf8"
            });
            this.day = today;
        }

        this.file.write("[" + time + "] " + text + "\n");
    }
};

